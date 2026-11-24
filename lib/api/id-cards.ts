import { getStudents, StudentRecord } from "./students";
import { getStaff, StaffRecord } from "./staff";

/**
 * Fetch students for student ID card generation.
 */
export async function getStudentIDCards(): Promise<StudentRecord[]> {
  return await getStudents();
}

/**
 * Fetch faculty for faculty ID card generation.
 */
export async function getFacultyIDCards(): Promise<StaffRecord[]> {
  return await getStaff();
}
