/**
 * Converts raw Prisma/PostgreSQL errors into safe, human-readable messages.
 * Never exposes connection strings, passwords, stack traces, or internal details.
 */

interface SafeError {
  message: string;  // Safe message for the browser
  status: number;   // HTTP status code
}

export function handlePrismaError(err: any, context = "operation"): SafeError {
  const code: string = err?.code ?? "";
  const meta: any   = err?.meta ?? {};

  // ── Prisma known error codes ──────────────────────────────────────────────
  switch (code) {
    // Unique constraint violation
    case "P2002": {
      const fields: string[] = meta?.target ?? [];
      const readable = fields
        .map((f: string) =>
          f === "admNo"  ? "Admission No"  :
          f === "empId"  ? "Employee ID"   :
          f === "email"  ? "Email"         :
          f === "bform"  ? "B-Form / CNIC" :
          f
        )
        .join(", ");
      return {
        message: `A record with the same ${readable || "value"} already exists. Please use a unique value.`,
        status: 409,
      };
    }

    // Record not found (update/delete on non-existing record)
    case "P2001":
    case "P2015":
    case "P2018":
    case "P2025":
      return {
        message: `The record you are trying to ${context} was not found. It may have already been deleted.`,
        status: 404,
      };

    // Foreign key constraint failed
    case "P2003":
      return {
        message: "This record is linked to other data. Remove related records first before deleting.",
        status: 409,
      };

    // Required field missing / null constraint
    case "P2011":
    case "P2012": {
      const field = meta?.field_name ?? "a required field";
      return {
        message: `Missing required value: ${field}. Please fill in all required fields.`,
        status: 400,
      };
    }

    // Value too long
    case "P2000": {
      const field = meta?.column_name ?? "a field";
      return {
        message: `The value entered for ${field} is too long. Please shorten it.`,
        status: 400,
      };
    }

    // Invalid value / type mismatch
    case "P2005":
    case "P2006":
      return {
        message: "One or more field values are invalid. Please check the form and try again.",
        status: 400,
      };

    // Database cannot be reached
    case "P1001":
      return {
        message: "Cannot reach the database server. Please check your internet connection and try again.",
        status: 503,
      };

    // Database timeout
    case "P1002":
      return {
        message: "The database request timed out. Please try again in a moment.",
        status: 503,
      };

    // Authentication failed (wrong credentials in connection string)
    case "P1000":
    case "P1010":
      return {
        message: "Database authentication failed. Please contact the system administrator.",
        status: 500,
      };

    // Migration / schema version mismatch
    case "P4001":
      return {
        message: "The database schema is outdated. Please run prisma db push and try again.",
        status: 500,
      };
  }

  // ── Network / connection errors (no Prisma code) ──────────────────────────
  const msg: string = (err?.message ?? "").toLowerCase();
  if (
    msg.includes("econnrefused") ||
    msg.includes("can't reach database") ||
    msg.includes("connect etimedout") ||
    msg.includes("connection refused")
  ) {
    return {
      message: "Cannot connect to the database. Please try again later.",
      status: 503,
    };
  }

  if (msg.includes("unique constraint") || msg.includes("duplicate key")) {
    return {
      message: "A duplicate record already exists. Please check for existing entries.",
      status: 409,
    };
  }

  if (msg.includes("foreign key") || msg.includes("violates foreign key")) {
    return {
      message: "This record cannot be deleted because it is referenced by other data.",
      status: 409,
    };
  }

  if (msg.includes("not null") || msg.includes("null value in column")) {
    return {
      message: "A required field is missing. Please fill in all required fields.",
      status: 400,
    };
  }

  // ── Fallback: unexpected / unknown error ──────────────────────────────────
  // Log full technical error on server; return safe generic message to client
  console.error(`[DB Error][${context}] Code: ${code}`, err);
  return {
    message: `An unexpected error occurred while processing your request. Please try again. (Ref: ${code || "UNKNOWN"})`,
    status: 500,
  };
}

/** Wraps a Next.js API route handler with standard error logging */
export function logApiError(context: string, err: any): void {
  console.error(
    `[API Error][${context}]`,
    JSON.stringify({
      code: err?.code,
      message: err?.message,
      meta: err?.meta,
      stack: err?.stack?.split("\n").slice(0, 4).join(" | "),
    })
  );
}
