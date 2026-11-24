import { api } from "./client";
import { StudentRecord } from "./students";

export interface FeePaymentPayload {
  studentId: number;
  receiptNo?: string;
  billingMonth?: string;
  amount: number;
  adj?: number;
  payDate?: string;
  payMethod?: string;
  payRemarks?: string;
}

export interface FeePaymentRecord {
  id: number;
  studentId: number;
  receiptNo: string;
  billingMonth: string;
  amount: number;
  adj: number;
  payDate: string;
  payMethod: string;
  payRemarks?: string | null;
  createdAt?: string;
}

export interface FeePaymentResponse {
  ok: boolean;
  payment: FeePaymentRecord;
  student: StudentRecord;
}

/**
 * Fetch recent fee payments from the database.
 */
export async function getFeePayments(): Promise<FeePaymentRecord[]> {
  const res = await api.get<{ ok: boolean; payments: FeePaymentRecord[] }>("/api/fees");
  return res.payments || [];
}

/**
 * Record a student fee payment in the database and update student's fee ledger status.
 */
export async function recordFeePayment(
  data: FeePaymentPayload
): Promise<FeePaymentResponse> {
  return await api.post<FeePaymentResponse>("/api/fees", data);
}
