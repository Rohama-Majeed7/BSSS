import { api } from "./client";
import { StudentRecord } from "./students";
import { StaffRecord } from "./staff";
import { ExamResultRecord } from "./results";
import { FeePaymentRecord } from "./fees";

export interface SchoolSettingRecord {
  id: number;
  name: string;
  nameUpper: string;
  urduName: string;
  emis: string;
  principal: string;
  address: string;
  urduAddress: string;
  logo?: string | null;
  sign?: string | null;
  feeReminderTemplate?: string | null;
  reminderSentLog?: Record<string, Record<string, string>> | null;
  updatedAt?: string;
}

export interface DashboardData {
  students: StudentRecord[];
  teachers: StaffRecord[];
  examResults: ExamResultRecord[];
  attendanceMap: Record<string, Record<string, string>>;
  feePayments: FeePaymentRecord[];
  setting?: SchoolSettingRecord | null;
}

export interface InitResponse {
  ok: boolean;
  hasDbData: boolean;
  data: DashboardData;
}

/**
 * Fetch all initial application data and dashboard statistics in a single call from the database.
 */
export async function getDashboardData(): Promise<DashboardData> {
  const res = await api.get<InitResponse>("/api/init");
  return (
    res.data || {
      students: [],
      teachers: [],
      examResults: [],
      attendanceMap: {},
      feePayments: [],
      setting: null,
    }
  );
}
