import { StaffRecord, saveStaff } from "./staff";

/**
 * Toggle faculty salary payment status ("Paid" <-> "Unpaid") in the database.
 */
export async function togglePayrollStatus(teacher: StaffRecord): Promise<StaffRecord> {
  const cur = teacher.payStatus || "Unpaid";
  const next = cur === "Paid" ? "Unpaid" : "Paid";
  const updated = { ...teacher, payStatus: next };
  return await saveStaff(updated);
}
