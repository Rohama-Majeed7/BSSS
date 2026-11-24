import { api } from "./client";

export interface StaffRecord {
  id: number;
  empId: string;
  name: string;
  role: string;
  cnic: string;
  phone: string;
  basic: number;
  allowance: number;
  deduction: number;
  att: string; // "Present" | "Absent" | "Leave"
  payStatus: string; // "Paid" | "Unpaid"
  photo?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StaffPayload {
  id?: number;
  empId?: string;
  name: string;
  role: string;
  cnic?: string;
  phone?: string;
  basic?: number;
  allowance?: number;
  deduction?: number;
  att?: string;
  payStatus?: string;
  photo?: string | null;
}

export interface StaffListResponse {
  ok: boolean;
  teachers: StaffRecord[];
}

export interface StaffSaveResponse {
  ok: boolean;
  teacher: StaffRecord;
}

export interface StaffDeleteResponse {
  ok: boolean;
  deletedId: number;
}

/**
 * Fetch all faculty and staff records from the database.
 */
export async function getStaff(): Promise<StaffRecord[]> {
  const res = await api.get<StaffListResponse>("/api/staff");
  return res.teachers || [];
}

/**
 * Save (create or update) a faculty or staff profile in the database.
 */
export async function saveStaff(data: StaffPayload): Promise<StaffRecord> {
  const res = await api.post<StaffSaveResponse>("/api/staff", data);
  return res.teacher;
}

/**
 * Delete a faculty or staff member by ID from the database.
 */
export async function deleteStaff(id: number): Promise<number> {
  const res = await api.delete<StaffDeleteResponse>(`/api/staff?id=${id}`);
  return res.deletedId;
}

/**
 * Cycle faculty attendance status: Present -> Absent -> Leave -> Present in the database.
 */
export async function cycleStaffAttendance(teacher: StaffRecord): Promise<StaffRecord> {
  const cur = teacher.att || "Present";
  const next = cur === "Present" ? "Absent" : cur === "Absent" ? "Leave" : "Present";
  const updated = { ...teacher, att: next };
  return await saveStaff(updated);
}
