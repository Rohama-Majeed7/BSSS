import { api } from "./client";

export interface SubjectMarks {
  name: string;
  total: number;
  obtained: number;
}

export interface ExamResultRecord {
  id: number;
  studentId: number;
  term: string;
  date: string;
  rank?: string | null;
  remarks?: string | null;
  subjects: SubjectMarks[];
  student?: {
    name: string;
    admNo: string;
    class: string;
    father: string;
  };
  createdAt?: string;
}

export interface ExamResultPayload {
  id?: number;
  studentId: number;
  term: string;
  date?: string;
  rank?: string;
  remarks?: string;
  subjects: SubjectMarks[];
}

export interface ExamResultsResponse {
  ok: boolean;
  results: ExamResultRecord[];
}

export interface ExamResultSaveResponse {
  ok: boolean;
  result: ExamResultRecord;
}

export interface ExamResultDeleteResponse {
  ok: boolean;
  deletedId: number;
}

/**
 * Fetch all exam results from the database.
 */
export async function getExamResults(): Promise<ExamResultRecord[]> {
  const res = await api.get<ExamResultsResponse>("/api/exams");
  return res.results || [];
}

/**
 * Save (create or update) student exam marks and results in the database.
 */
export async function saveExamResult(
  data: ExamResultPayload
): Promise<ExamResultRecord> {
  const res = await api.post<ExamResultSaveResponse>("/api/exams", data);
  return res.result;
}

/**
 * Delete an exam result record by ID from the database.
 */
export async function deleteExamResult(id: number): Promise<number> {
  const res = await api.delete<ExamResultDeleteResponse>(`/api/exams?id=${id}`);
  return res.deletedId;
}
