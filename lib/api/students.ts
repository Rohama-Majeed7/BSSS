import { api } from "./client";

export interface StudentRecord {
  id: number;
  admNo: string;
  receiptNo?: string | null;
  name: string;
  father: string;
  fatherCnic?: string | null;
  class: string;
  gender: string;
  dob: string;
  bform: string;
  phone: string;
  fee: number;
  adj?: number;
  paid?: number;
  payDate?: string | null;
  payMethod?: string | null;
  payRemarks?: string | null;
  address: string;
  status: string;
  admClass: string;
  admDate: string;
  leaveClass?: string | null;
  leaveDate?: string | null;
  conduct?: string | null;
  leaveReason?: string | null;
  photo?: string | null;
  photoUrl?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface StudentPayload {
  id?: number;
  admNo: string;
  receiptNo?: string | null;
  name: string;
  father: string;
  fatherCnic?: string | null;
  class: string;
  gender?: string;
  dob?: string;
  bform?: string;
  phone?: string;
  fee?: number;
  adj?: number;
  paid?: number;
  payDate?: string | null;
  payMethod?: string | null;
  payRemarks?: string | null;
  address?: string;
  status?: string;
  admClass?: string;
  admDate?: string;
  leaveClass?: string | null;
  leaveDate?: string | null;
  conduct?: string | null;
  leaveReason?: string | null;
  photo?: string | null;
}

export interface StudentsResponse {
  ok: boolean;
  students: StudentRecord[];
}

export interface StudentSaveResponse {
  ok: boolean;
  student: StudentRecord;
}

export interface StudentDeleteResponse {
  ok: boolean;
  deletedId: number;
}

/**
 * Fetch all students from the database.
 */
export async function getStudents(): Promise<StudentRecord[]> {
  const res = await api.get<StudentsResponse>("/api/students");
  return res.students || [];
}

/**
 * Create a new student or update an existing student record in the database.
 */
export async function saveStudent(data: StudentPayload): Promise<StudentRecord> {
  const res = await api.post<StudentSaveResponse>("/api/students", data);
  return res.student;
}

/**
 * Delete a student record by ID from the database.
 */
export async function deleteStudent(id: number): Promise<number> {
  const res = await api.delete<StudentDeleteResponse>(`/api/students?id=${id}`);
  return res.deletedId;
}
