import "server-only";

import {
    S3Client,
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// ---------------------------------------------------------------------------
// Allowed object-key prefixes, content types, and size limit.
// ---------------------------------------------------------------------------
export const ALLOWED_PREFIXES = ["students/", "teachers/"] as const;
export type AllowedPrefix = (typeof ALLOWED_PREFIXES)[number];
export const ALLOWED_CONTENT_TYPES = ["image/jpeg"] as const;
export const MAX_PHOTO_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

// ---------------------------------------------------------------------------
// S3 / Neon Object Storage client (server-side only)
// ---------------------------------------------------------------------------
const s3 = new S3Client({
    region: process.env.AWS_REGION || "us-east-2",
    endpoint: process.env.AWS_ENDPOINT_URL_S3,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
    },
    forcePathStyle: true,
});

const bucket = process.env.NEON_STORAGE_BUCKET || "bright-stars-uploads";

function assertStorageConfigured(): void {
    if (
        !process.env.AWS_ENDPOINT_URL_S3?.trim() ||
        !process.env.AWS_ACCESS_KEY_ID?.trim() ||
        !process.env.AWS_SECRET_ACCESS_KEY?.trim()
    ) {
        throw new Error(
            "Neon Object Storage credentials or endpoint are not configured on the server"
        );
    }
}

/** Returns true when a stored photo value is a legacy base64 data URL or external HTTP(S) URL. */
export function isExternalOrDataUrl(value: unknown): value is string {
    if (typeof value !== "string") return false;
    const clean = value.trim();
    return (
        clean.startsWith("data:") ||
        clean.startsWith("http://") ||
        clean.startsWith("https://")
    );
}

/**
 * Validates that a storage object key strictly matches `students/<filename>` or
 * `teachers/<filename>` (or a specific expected prefix) without path traversal.
 */
export function isValidPhotoKey(
    key: unknown,
    expectedPrefix?: AllowedPrefix
): key is string {
    if (typeof key !== "string" || key.length === 0 || key !== key.trim()) {
        return false;
    }

    const allowed = expectedPrefix ? [expectedPrefix] : ALLOWED_PREFIXES;
    const matchedPrefix = allowed.find((prefix) => key.startsWith(prefix));
    if (!matchedPrefix) return false;

    const rest = key.slice(matchedPrefix.length);
    if (
        rest.length === 0 ||
        rest.length > 255 ||
        rest !== rest.trim() ||
        rest.includes("..") ||
        rest.includes("/") ||
        rest.includes("\\") ||
        /[\x00-\x1f\x7f?#]/.test(rest)
    ) {
        return false;
    }

    return true;
}

/**
 * Generate a short-lived (5 min) presigned S3 PUT URL for direct browser uploads.
 * Returns { uploadUrl, objectKey, contentType }.
 */
export async function createPhotoUploadUrl(
    contentType: string = "image/jpeg",
    prefix: "students" | "teachers" = "students"
) {
    assertStorageConfigured();

    if (contentType !== "image/jpeg") {
        throw new Error("Only image/jpeg contentType is allowed");
    }
    if (prefix !== "students" && prefix !== "teachers") {
        throw new Error("Invalid prefix: must be 'students' or 'teachers'");
    }

    const key = `${prefix}/${crypto.randomUUID()}.jpg`;

    const command = new PutObjectCommand({
        Bucket: bucket,
        Key: key,
        ContentType: "image/jpeg",
    });

    const uploadUrl = await getSignedUrl(s3, command, { expiresIn: 300 });

    return {
        uploadUrl,
        objectKey: key,
        contentType: "image/jpeg",
    };
}

async function getSignedPhotoUrl(
    key: string | null | undefined,
    expectedPrefix?: AllowedPrefix
): Promise<string | null> {
    if (!key || typeof key !== "string" || !key.trim()) return null;
    const clean = key.trim();

    if (isExternalOrDataUrl(clean)) {
        return clean;
    }

    if (!isValidPhotoKey(clean, expectedPrefix)) {
        console.warn("getPhotoUrl: rejected invalid key:", clean);
        return null;
    }

    try {
        assertStorageConfigured();
        const command = new GetObjectCommand({ Bucket: bucket, Key: clean });
        // 24 hours expiry for read-only display
        return await getSignedUrl(s3, command, { expiresIn: 86400 });
    } catch (err) {
        console.error("Failed to generate signed GET URL for key:", clean, err);
        return null;
    }
}

/** Generate a signed GET URL for either students/ or teachers/ keys. */
export async function getPhotoUrl(
    key: string | null | undefined
): Promise<string | null> {
    return getSignedPhotoUrl(key);
}

/** Generate a signed GET URL strictly for students/ keys (or legacy URLs). */
export async function getStudentPhotoUrl(
    key: string | null | undefined
): Promise<string | null> {
    return getSignedPhotoUrl(key, "students/");
}

/** Generate a signed GET URL strictly for teachers/ keys (or legacy URLs). */
export async function getTeacherPhotoUrl(
    key: string | null | undefined
): Promise<string | null> {
    return getSignedPhotoUrl(key, "teachers/");
}

async function deleteScopedPhoto(
    key: string | null | undefined,
    expectedPrefix?: AllowedPrefix
): Promise<void> {
    if (!key || typeof key !== "string" || !key.trim()) return;
    const clean = key.trim();

    if (isExternalOrDataUrl(clean)) {
        return;
    }

    if (!isValidPhotoKey(clean, expectedPrefix)) {
        const scopeLabel = expectedPrefix ? expectedPrefix : "students/ or teachers/";
        throw new Error(
            `deletePhoto: invalid key – expected ${scopeLabel}. Got: "${clean}"`
        );
    }

    assertStorageConfigured();
    await s3.send(new DeleteObjectCommand({ Bucket: bucket, Key: clean }));
}

/** Delete a photo object under students/ or teachers/. Throws on invalid key or S3 error. */
export async function deletePhoto(
    key: string | null | undefined
): Promise<void> {
    return deleteScopedPhoto(key);
}

/** Delete a photo object strictly under students/. Throws on invalid/teacher key or S3 error. */
export async function deleteStudentPhoto(
    key: string | null | undefined
): Promise<void> {
    return deleteScopedPhoto(key, "students/");
}

/** Delete a photo object strictly under teachers/. Throws on invalid/student key or S3 error. */
export async function deleteTeacherPhoto(
    key: string | null | undefined
): Promise<void> {
    return deleteScopedPhoto(key, "teachers/");
}

export type PhotoSaveValidationResult =
    | { ok: true; photo: string | null }
    | { ok: false; error: string };

/**
 * Validates incoming `photo` / `photoKey` when saving a Student or Teacher record.
 * Rejects Base64 data URLs, local blob URLs, signed/external URLs, and wrong prefixes,
 * while preserving an untouched legacy data/http URL on an existing record.
 */
export function validatePhotoKeyForSave(options: {
    rawPhotoInput: unknown;
    existingPhoto?: string | null;
    expectedPrefix: AllowedPrefix;
    entityLabel: "student" | "teacher";
}): PhotoSaveValidationResult {
    const { rawPhotoInput, existingPhoto, expectedPrefix, entityLabel } = options;

    if (rawPhotoInput === undefined || rawPhotoInput === null || rawPhotoInput === "") {
        return { ok: true, photo: null };
    }

    if (typeof rawPhotoInput !== "string") {
        return {
            ok: false,
            error: "Invalid photo value. Expected a storage object key.",
        };
    }

    const trimmed = rawPhotoInput.trim();
    if (!trimmed) {
        return { ok: true, photo: null };
    }

    const unchangedLegacy =
        Boolean(existingPhoto) &&
        trimmed === existingPhoto!.trim() &&
        isExternalOrDataUrl(existingPhoto);

    if (unchangedLegacy) {
        return { ok: true, photo: trimmed };
    }

    if (trimmed.startsWith("data:")) {
        return {
            ok: false,
            error: "Base64 image data cannot be stored in the database. Upload to storage first.",
        };
    }

    if (
        trimmed.startsWith("blob:") ||
        trimmed.startsWith("http://") ||
        trimmed.startsWith("https://")
    ) {
        return {
            ok: false,
            error: "Preview or signed URLs cannot be stored in the database. Send only the object key.",
        };
    }

    if (!isValidPhotoKey(trimmed, expectedPrefix)) {
        return {
            ok: false,
            error: `Invalid ${entityLabel} photo key. Must start with '${expectedPrefix}'.`,
        };
    }

    return { ok: true, photo: trimmed };
}
