/**
 * Shared client-side helpers for Student and Teacher/Staff photo upload,
 * validation, preview rendering, and deletion against Neon Object Storage.
 */

export type PhotoCategory = "students" | "teachers";

const ALLOWED_INPUT_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
]);

const MAX_RAW_FILE_BYTES = 15 * 1024 * 1024; // 15 MB before resize
const MAX_UPLOAD_BLOB_BYTES = 5 * 1024 * 1024; // 5 MB after JPEG conversion

/**
 * Returns true only for URLs that can be safely passed to `<img src="..." />`
 * (signed HTTP/HTTPS URLs, local blob previews, legacy data URLs, or local public paths).
 * Raw Neon S3 object keys like `students/abc.jpg` return false.
 */
export function isRenderablePhotoUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  return (
    trimmed.startsWith("https://") ||
    trimmed.startsWith("http://") ||
    trimmed.startsWith("data:") ||
    trimmed.startsWith("blob:") ||
    trimmed.startsWith("/")
  );
}

/**
 * Resolves the safe `<img src>` URL for a Student or Teacher record.
 * Prioritizes the server-generated signed `photoUrl` over legacy `photo` URLs.
 */
export function resolveDisplayPhotoUrl(record: {
  photoUrl?: string | null;
  photo?: string | null;
}): string {
  if (isRenderablePhotoUrl(record.photoUrl)) {
    return record.photoUrl.trim();
  }
  if (isRenderablePhotoUrl(record.photo)) {
    return record.photo.trim();
  }
  return "";
}

/**
 * Validates, resizes (max 400px), and converts a user-selected image to a JPEG Blob.
 */
export async function resizeAndConvertPhotoToJpeg(file: File): Promise<Blob> {
  if (!ALLOWED_INPUT_MIME_TYPES.has(file.type.toLowerCase())) {
    throw new Error("Please select a valid image file (JPEG, PNG, or WebP).");
  }
  if (file.size <= 0) {
    throw new Error("Selected image file is empty.");
  }
  if (file.size > MAX_RAW_FILE_BYTES) {
    throw new Error("Selected image is too large. Maximum allowed file size is 15 MB.");
  }

  const imageUrl = URL.createObjectURL(file);

  try {
    const blob = await new Promise<Blob>((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 400;

        let width = image.width;
        let height = image.height;

        if (width > height && width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        } else if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          reject(new Error("Canvas context is unavailable"));
          return;
        }

        ctx.drawImage(image, 0, 0, width, height);

        canvas.toBlob(
          (result) => {
            if (result) resolve(result);
            else reject(new Error("Image conversion to JPEG failed"));
          },
          "image/jpeg",
          0.85
        );
      };

      image.onerror = () => reject(new Error("Selected file could not be read"));
      image.src = imageUrl;
    });

    if (blob.size <= 0 || blob.size > MAX_UPLOAD_BLOB_BYTES) {
      throw new Error("Processed image exceeds the 5 MB upload limit.");
    }

    return blob;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

/**
 * Uploads a photo directly from the browser to Neon Object Storage using a presigned PUT URL.
 * Returns the storage objectKey (`students/*.jpg` or `teachers/*.jpg`) and a local object preview URL.
 */
export async function uploadPhotoToNeon(
  file: File,
  category: PhotoCategory
): Promise<{ objectKey: string; previewUrl: string }> {
  const blob = await resizeAndConvertPhotoToJpeg(file);

  const presignResponse = await fetch("/api/uploads/presign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contentType: "image/jpeg",
      prefix: category,
      fileSize: blob.size,
    }),
  });

  const presign = await presignResponse.json().catch(() => ({}));
  if (!presignResponse.ok || !presign.uploadUrl || !presign.objectKey) {
    throw new Error(presign.error || "Could not generate upload URL");
  }

  const expectedPrefix = `${category}/`;
  if (typeof presign.objectKey !== "string" || !presign.objectKey.startsWith(expectedPrefix)) {
    throw new Error(`Invalid object key prefix returned from server for ${category}`);
  }

  const uploadResponse = await fetch(presign.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": "image/jpeg" },
    body: blob,
  });

  if (!uploadResponse.ok) {
    throw new Error(`Upload to storage failed (HTTP ${uploadResponse.status})`);
  }

  return {
    objectKey: presign.objectKey,
    previewUrl: URL.createObjectURL(blob),
  };
}

/**
 * Deletes a photo from Neon Object Storage (and clears the DB field if `recordId` is provided).
 */
export async function deletePhotoFromServer(params: {
  photoKey: string;
  category: PhotoCategory;
  recordId?: number | null;
}): Promise<void> {
  const { photoKey, category, recordId } = params;
  const payload: Record<string, unknown> = {
    photoKey,
    prefix: category,
  };

  if (recordId && recordId > 0) {
    if (category === "students") {
      payload.studentId = recordId;
    } else {
      payload.teacherId = recordId;
    }
  }

  const response = await fetch("/api/uploads/delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok || result.ok === false) {
    throw new Error(result.error || "Failed to delete photo from storage");
  }
}
