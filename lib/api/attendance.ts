import { api } from "./client";

export interface AttendancePayload {
  date: string;
  records: Record<string, string>; // studentId -> "Present" | "Absent" | "Leave"
}

export interface AttendanceSaveResponse {
  ok: boolean;
  count: number;
}

/**
 * Fetch student attendance records from the database.
 */
export async function getAttendance(date?: string): Promise<any[]> {
  const url = date ? `/api/attendance?date=${encodeURIComponent(date)}` : "/api/attendance";
  const res = await api.get<{ ok: boolean; records: any[] }>(url);
  return res.records || [];
}

/**
 * Save or bulk-upsert daily student attendance for a given date in the database.
 */
export async function saveAttendance(
  date: string,
  records: Record<string, string>
): Promise<number> {
  const res = await api.post<AttendanceSaveResponse>("/api/attendance", {
    date,
    records,
  });
  return res.count;
}
