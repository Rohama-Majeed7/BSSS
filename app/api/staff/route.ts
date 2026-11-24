import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handlePrismaError, logApiError } from "@/lib/prismaError";
import {
  getTeacherPhotoUrl,
  deleteTeacherPhoto,
  isValidPhotoKey,
  isExternalOrDataUrl,
  validatePhotoKeyForSave,
} from "@/lib/storage";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const teachers = await prisma.teacher.findMany({ orderBy: { id: "asc" } });

    const teachersWithPhotos = await Promise.all(
      teachers.map(async (teacher) => ({
        ...teacher,
        photoUrl: await getTeacherPhotoUrl(teacher.photo),
      }))
    );

    return NextResponse.json({ ok: true, teachers: teachersWithPhotos });
  } catch (err: any) {
    logApiError("GET /api/staff", err);
    const { message, status } = handlePrismaError(err, "fetch staff");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const {
      id,
      empId,
      name,
      role,
      cnic,
      phone,
      basic,
      allowance,
      deduction,
      att,
      payStatus,
      photo,
      photoKey,
    } = body;

    if (!name || !String(name).trim()) {
      return NextResponse.json({ ok: false, error: "Staff member name is required." }, { status: 400 });
    }
    if (!role || !String(role).trim()) {
      return NextResponse.json({ ok: false, error: "Designation / role is required." }, { status: 400 });
    }

    const teacherId = id && Number(id) > 0 ? Number(id) : null;
    const existingTeacher = teacherId
      ? await prisma.teacher.findUnique({
          where: { id: teacherId },
          select: { id: true, photo: true },
        })
      : null;

    if (teacherId && !existingTeacher) {
      return NextResponse.json(
        { ok: false, error: "Teacher / Staff record not found." },
        { status: 404 }
      );
    }

    const rawPhotoInput = photoKey !== undefined ? photoKey : photo;
    const photoValidation = validatePhotoKeyForSave({
      rawPhotoInput,
      existingPhoto: existingTeacher?.photo,
      expectedPrefix: "teachers/",
      entityLabel: "teacher",
    });

    if (!photoValidation.ok) {
      return NextResponse.json(
        { ok: false, error: photoValidation.error },
        { status: 400 }
      );
    }

    const normalizedPhoto = photoValidation.photo;

    const payload = {
      empId: empId || `BS-STF-${String(Date.now()).slice(-4)}`,
      name: String(name).trim(),
      role: String(role).trim(),
      cnic: cnic || "",
      phone: phone || "",
      basic: Number(basic || 0),
      allowance: Number(allowance || 0),
      deduction: Number(deduction || 0),
      att: att || "Present",
      payStatus: payStatus || "Unpaid",
      photo: normalizedPhoto,
    };

    const previousPhoto = existingTeacher?.photo?.trim() || null;

    let teacher;
    if (teacherId) {
      teacher = await prisma.teacher.update({ where: { id: teacherId }, data: payload });

      // If the teacher's stored photo was replaced or cleared via save, delete the superseded object.
      if (
        previousPhoto &&
        previousPhoto !== normalizedPhoto &&
        isValidPhotoKey(previousPhoto, "teachers/")
      ) {
        try {
          await deleteTeacherPhoto(previousPhoto);
        } catch (cleanupErr) {
          console.warn(
            "Warning: Teacher updated, but superseded photo could not be deleted from storage:",
            previousPhoto,
            cleanupErr
          );
        }
      }
    } else {
      teacher = await prisma.teacher.create({ data: payload });
    }

    return NextResponse.json({
      ok: true,
      teacher: {
        ...teacher,
        photoUrl: await getTeacherPhotoUrl(teacher.photo),
      },
    });
  } catch (err: any) {
    logApiError("POST /api/staff", err);
    const { message, status } = handlePrismaError(err, "save faculty record");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const queryId = searchParams.get("id");
    let teacherId = queryId ? Number(queryId) : null;

    if (!teacherId) {
      const body = await req.json().catch(() => ({}));
      teacherId = body.id ? Number(body.id) : null;
    }

    if (!teacherId || isNaN(teacherId) || !Number.isInteger(teacherId) || teacherId <= 0) {
      return NextResponse.json({ ok: false, error: "Missing or invalid staff ID." }, { status: 400 });
    }

    const teacher = await prisma.teacher.findUnique({
      where: { id: teacherId },
      select: { id: true, photo: true },
    });

    if (!teacher) {
      return NextResponse.json({ ok: false, error: "Staff record not found." }, { status: 404 });
    }

    if (teacher.photo && (isExternalOrDataUrl(teacher.photo) || isValidPhotoKey(teacher.photo, "teachers/"))) {
      await deleteTeacherPhoto(teacher.photo);
    }

    await prisma.teacher.delete({ where: { id: teacherId } });
    return NextResponse.json({ ok: true, deletedId: teacherId });
  } catch (err: any) {
    logApiError("DELETE /api/staff", err);
    const { message, status } = handlePrismaError(err, "delete staff record");
    return NextResponse.json({ ok: false, error: message }, { status });
  }
}
