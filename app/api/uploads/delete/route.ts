import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
    deletePhoto,
    deleteStudentPhoto,
    deleteTeacherPhoto,
    isExternalOrDataUrl,
    isValidPhotoKey,
    type AllowedPrefix,
} from "@/lib/storage";

type ParsedIdResult =
    | { present: false; valid: true; id: null }
    | { present: true; valid: true; id: number }
    | { present: true; valid: false; id: null };

function parseOptionalPositiveInt(value: unknown): ParsedIdResult {
    if (value === undefined || value === null || value === "") {
        return { present: false, valid: true, id: null };
    }
    if (typeof value === "boolean") {
        return { present: true, valid: false, id: null };
    }
    const num = typeof value === "number" ? value : Number(value);
    if (!Number.isInteger(num) || num <= 0) {
        return { present: true, valid: false, id: null };
    }
    return { present: true, valid: true, id: num };
}

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rawBody = await req.text();
        let body: Record<string, unknown> = {};

        if (rawBody.trim()) {
            let parsed: unknown;
            try {
                parsed = JSON.parse(rawBody);
            } catch {
                return NextResponse.json(
                    { error: "Invalid JSON request body" },
                    { status: 400 }
                );
            }
            if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
                return NextResponse.json(
                    { error: "Request body must be a JSON object" },
                    { status: 400 }
                );
            }
            body = parsed as Record<string, unknown>;
        }

        const studentParsed = parseOptionalPositiveInt(body.studentId);
        if (!studentParsed.valid) {
            return NextResponse.json(
                { error: "Invalid studentId. Must be a positive integer" },
                { status: 400 }
            );
        }

        const teacherParsed = parseOptionalPositiveInt(body.teacherId);
        if (!teacherParsed.valid) {
            return NextResponse.json(
                { error: "Invalid teacherId. Must be a positive integer" },
                { status: 400 }
            );
        }

        if (studentParsed.present && teacherParsed.present) {
            return NextResponse.json(
                { error: "Provide either studentId or teacherId, not both" },
                { status: 400 }
            );
        }

        if (
            body.photoKey !== undefined &&
            body.photoKey !== null &&
            typeof body.photoKey !== "string"
        ) {
            return NextResponse.json(
                { error: "photoKey must be a string" },
                { status: 400 }
            );
        }
        const cleanClientKey =
            typeof body.photoKey === "string" ? body.photoKey.trim() : "";

        const rawPrefix = body.prefix !== undefined ? body.prefix : body.category;
        if (
            rawPrefix !== undefined &&
            rawPrefix !== "students" &&
            rawPrefix !== "teachers"
        ) {
            return NextResponse.json(
                { error: "Invalid prefix. Must be 'students' or 'teachers'" },
                { status: 400 }
            );
        }

        // -------------------------------------------------------------------
        // Case A: Unsaved new Student or Teacher (no DB record ID)
        // Deletes ONLY from Neon Storage after strict prefix validation.
        // -------------------------------------------------------------------
        if (!studentParsed.present && !teacherParsed.present) {
            const expectedPrefix: AllowedPrefix | undefined =
                rawPrefix === "students"
                    ? "students/"
                    : rawPrefix === "teachers"
                      ? "teachers/"
                      : undefined;

            if (!cleanClientKey || !isValidPhotoKey(cleanClientKey, expectedPrefix)) {
                return NextResponse.json(
                    {
                        error: expectedPrefix
                            ? `Invalid or missing photoKey. Must start with '${expectedPrefix}'`
                            : "Invalid or missing photoKey. Must start with 'students/' or 'teachers/'",
                    },
                    { status: 400 }
                );
            }

            if (expectedPrefix === "students/") {
                await deleteStudentPhoto(cleanClientKey);
            } else if (expectedPrefix === "teachers/") {
                await deleteTeacherPhoto(cleanClientKey);
            } else {
                await deletePhoto(cleanClientKey);
            }

            return NextResponse.json({ ok: true });
        }

        // -------------------------------------------------------------------
        // Case B: Existing Student or Teacher record
        // Verify ownership from the database record before deleting anything.
        // -------------------------------------------------------------------
        const isStudent = studentParsed.present;
        const recordId = isStudent ? studentParsed.id : teacherParsed.id!;
        const expectedPrefix: AllowedPrefix = isStudent ? "students/" : "teachers/";

        if (
            (isStudent && rawPrefix === "teachers") ||
            (!isStudent && rawPrefix === "students")
        ) {
            return NextResponse.json(
                { error: `Cannot use '${rawPrefix}' prefix for this record type` },
                { status: 400 }
            );
        }

        if (
            cleanClientKey &&
            !isExternalOrDataUrl(cleanClientKey) &&
            !isValidPhotoKey(cleanClientKey, expectedPrefix)
        ) {
            return NextResponse.json(
                {
                    error: `Invalid photoKey prefix. Must start with '${expectedPrefix}'`,
                },
                { status: 400 }
            );
        }

        const record = isStudent
            ? await prisma.student.findUnique({
                  where: { id: recordId },
                  select: { id: true, photo: true },
              })
            : await prisma.teacher.findUnique({
                  where: { id: recordId },
                  select: { id: true, photo: true },
              });

        if (!record) {
            return NextResponse.json(
                { error: isStudent ? "Student not found" : "Teacher not found" },
                { status: 404 }
            );
        }

        const dbPhoto = record.photo ? record.photo.trim() : null;

        // Safe handling for repeated / double-click delete or records with no photo:
        // Never delete a client-provided photoKey when the DB record owns no photo.
        if (!dbPhoto) {
            return NextResponse.json({ ok: true, alreadyCleared: true });
        }

        // Ownership verification: if client supplied photoKey, it must match DB record.
        if (cleanClientKey && cleanClientKey !== dbPhoto) {
            return NextResponse.json(
                { error: "Photo key does not belong to this record" },
                { status: 403 }
            );
        }

        if (!isExternalOrDataUrl(dbPhoto) && !isValidPhotoKey(dbPhoto, expectedPrefix)) {
            return NextResponse.json(
                {
                    error: `Stored photo key must start with '${expectedPrefix}'. Got: "${dbPhoto}"`,
                },
                { status: 400 }
            );
        }

        // Step 1: Delete from Neon Storage FIRST (do not update DB if this fails).
        try {
            if (isStudent) {
                await deleteStudentPhoto(dbPhoto);
            } else {
                await deleteTeacherPhoto(dbPhoto);
            }
        } catch (storageErr: unknown) {
            console.error(
                "Photo delete from Neon Storage failed – database NOT updated:",
                dbPhoto,
                storageErr
            );
            const message =
                storageErr instanceof Error
                    ? storageErr.message
                    : "Could not delete photo from storage. Database was NOT changed.";
            return NextResponse.json({ error: message }, { status: 500 });
        }

        // Step 2: Clear DB photo field ONLY after successful storage deletion.
        try {
            if (isStudent) {
                await prisma.student.update({
                    where: { id: recordId },
                    data: { photo: null },
                });
            } else {
                await prisma.teacher.update({
                    where: { id: recordId },
                    data: { photo: null },
                });
            }
        } catch (dbErr: unknown) {
            console.error(
                "INCONSISTENCY: Neon Storage object deleted but DB update failed.",
                isStudent ? "studentId:" : "teacherId:",
                recordId,
                "deletedKey:",
                dbPhoto,
                dbErr
            );
            return NextResponse.json(
                {
                    error:
                        "Storage deleted but database update failed. Manual recovery may be needed.",
                    inconsistency: true,
                    deletedKey: dbPhoto,
                },
                { status: 500 }
            );
        }

        return NextResponse.json({ ok: true });
    } catch (error: unknown) {
        console.error("Photo delete error:", error);
        const message =
            error instanceof Error ? error.message : "Could not delete photo";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
