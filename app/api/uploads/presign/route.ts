import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { createPhotoUploadUrl, MAX_PHOTO_SIZE_BYTES } from "@/lib/storage";

export async function POST(request: Request) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const rawBody = await request.text();
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

        const contentType =
            body.contentType === undefined ? "image/jpeg" : body.contentType;
        if (typeof contentType !== "string" || contentType !== "image/jpeg") {
            return NextResponse.json(
                { error: "Only JPEG images (image/jpeg) are allowed" },
                { status: 400 }
            );
        }

        const prefix =
            body.prefix !== undefined
                ? body.prefix
                : body.category !== undefined
                  ? body.category
                  : "students";

        if (prefix !== "students" && prefix !== "teachers") {
            return NextResponse.json(
                { error: "Invalid prefix. Must be 'students' or 'teachers'" },
                { status: 400 }
            );
        }

        const rawSize = body.fileSize ?? body.size ?? body.contentLength;
        if (rawSize !== undefined) {
            if (
                typeof rawSize !== "number" ||
                !Number.isFinite(rawSize) ||
                rawSize <= 0 ||
                rawSize > MAX_PHOTO_SIZE_BYTES
            ) {
                return NextResponse.json(
                    {
                        error: `Invalid image size. Must be between 1 byte and ${MAX_PHOTO_SIZE_BYTES} bytes`,
                    },
                    { status: 400 }
                );
            }
        }

        const result = await createPhotoUploadUrl("image/jpeg", prefix);

        return NextResponse.json({ ok: true, ...result });
    } catch (error: unknown) {
        console.error("Presigned URL error:", error);
        const message =
            error instanceof Error ? error.message : "Could not generate upload URL";

        return NextResponse.json({ error: message }, { status: 500 });
    }
}
