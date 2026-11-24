import { StudentRecord, saveStudent } from "./students";

export interface SLCPayload {
  admClass: string;
  leaveClass: string;
  leaveDate: string;
  conduct: string;
  leaveReason: string;
  markLeft: boolean;
}

/**
 * Save School Leaving Certificate (SLC) details and optionally mark student status as "Left" in the database.
 */
export async function saveStudentSLC(
  student: StudentRecord,
  slcData: SLCPayload
): Promise<StudentRecord> {
  const updatedStudent = {
    ...student,
    admClass: slcData.admClass,
    leaveClass: slcData.leaveClass,
    leaveDate: slcData.leaveDate,
    conduct: slcData.conduct,
    leaveReason: slcData.leaveReason,
    status: slcData.markLeft ? "Left" : student.status,
  };

  return await saveStudent(updatedStudent);
}
