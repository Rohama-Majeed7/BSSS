import { SCHOOL_CLASSES, SchoolClass, SCHOOL_INFO } from "./constants";

export function formatClassLabel(cls: string): string {
  const v = String(cls || "").trim();
  if (!v) return "";
  if (v === "Nursery" || v === "Prep") return v;
  if (/^\d+$/.test(v)) return `Class ${v}`;
  return v;
}

export function normalizeClass(cls: string): SchoolClass {
  const c = String(cls || "").trim();
  if ((SCHOOL_CLASSES as readonly string[]).includes(c)) {
    return c as SchoolClass;
  }
  const m = c.match(/\b(1[0-2]|[1-9])(?:st|nd|rd|th)?\b/i);
  if (m) return m[1] as SchoolClass;
  if (/nursery/i.test(c)) return "Nursery";
  if (/prep|kg/i.test(c)) return "Prep";
  if (/1st\s*year/i.test(c)) return "11";
  if (/2nd\s*year|f\.?sc|ics|f\.?a/i.test(c)) return "12";
  return "1";
}

export function calculateAge(dobStr: string | Date): { years: number; months: number; text: string } {
  if (!dobStr) return { years: 0, months: 0, text: "N/A" };
  const dob = typeof dobStr === "string" ? new Date(dobStr) : dobStr;
  if (isNaN(dob.getTime())) return { years: 0, months: 0, text: "N/A" };
  const today = new Date();
  let y = today.getFullYear() - dob.getFullYear();
  let m = today.getMonth() - dob.getMonth();
  if (today.getDate() < dob.getDate()) m--;
  if (m < 0) {
    y--;
    m += 12;
  }
  const yStr = y === 1 ? "1 Yr" : `${y} Yrs`;
  const mStr = m === 1 ? "1 Mo" : `${m} Mos`;
  return { years: Math.max(0, y), months: Math.max(0, m), text: `${yStr} ${mStr}` };
}

export function calcExamStats(subjects: Array<{ total: number; obtained: number }>) {
  let total = 0,
    obtained = 0,
    failedAny = false;
  (subjects || []).forEach((sub) => {
    const t = Number(sub.total || 0),
      o = Number(sub.obtained || 0);
    total += t;
    obtained += o;
    if (t > 0 && (o / t) * 100 < 33) failedAny = true;
  });
  const pct = total > 0 ? ((obtained / total) * 100).toFixed(1) : "0.0";
  const n = parseFloat(pct);
  let grade = "F";
  if (n >= 90) grade = "A+";
  else if (n >= 80) grade = "A";
  else if (n >= 70) grade = "B";
  else if (n >= 60) grade = "C";
  else if (n >= 50) grade = "D";
  else if (n >= 33) grade = "E";
  else grade = "F";

  const status = failedAny || n < 33 ? "Failed" : "Passed";
  return { total, obtained, pct, grade, status };
}

export function calcTeacherNetPay(t: {
  basic: number;
  allowance?: number;
  deduction?: number;
}) {
  const basic = Number(t.basic || 0);
  const allow = Number(t.allowance || 0);
  const ded = Number(t.deduction || 0);
  return { basic, allow, ded, net: Math.max(0, basic + allow - ded) };
}

export function getNetStudentFee(s: { fee: number; adj?: number }) {
  const base = Number(s.fee || 0);
  const adj = Number(s.adj || 0);
  return Math.max(0, base + adj);
}

export function getFeeStatus(s: { fee: number; adj?: number; paid?: number }): "Paid" | "Partial" | "Unpaid" {
  const net = getNetStudentFee(s);
  const paid = Number(s.paid || 0);
  if (paid >= net && net > 0) return "Paid";
  if (paid > 0) return "Partial";
  return "Unpaid";
}

export function buildWhatsAppURL(rawPhone: string, message: string): string {
  let p = String(rawPhone || "").replace(/[^0-9]/g, "");
  if (p.startsWith("03")) p = "92" + p.substring(1);
  if (!p.startsWith("92") && p.length === 10) p = "92" + p;
  return `https://wa.me/${p}?text=${encodeURIComponent(message)}`;
}

export function esc(str: any): string {
  return String(str ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function getNameInitials(name: string): string {
  const clean = String(name || "").trim();
  if (!clean) return "S";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "S";
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  const first = parts[0].charAt(0).toUpperCase();
  const last = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${first}${last}`;
}

export function buildResultCardWhatsAppMsg(student: any, result: any): string {
  const stats = calcExamStats(result.subjects);
  const clsLabel = formatClassLabel(student.class);
  const subjectsList = (result.subjects || [])
    .map((sub: any) => `• ${sub.name}: ${sub.obtained}/${sub.total}`)
    .join("\n");

  return [
    `🎓 *${SCHOOL_INFO.nameUpper}*`,
    `📋 *DETAILED MARKS CERTIFICATE (DMC)*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Student:* ${student.name}`,
    `🏷️ *Adm #:* ${student.admNo}`,
    `👨 *Father:* ${student.father}`,
    `🏫 *Class:* ${clsLabel}`,
    `📝 *Exam Term:* ${result.term}`,
    `📅 *Exam Date:* ${result.date}`,
    result.rank ? `🏆 *Position:* ${result.rank}` : null,
    ``,
    `*SUBJECT WISE MARKS:*`,
    subjectsList,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `📊 *Total Marks:* ${stats.total}`,
    `🎯 *Obtained Marks:* ${stats.obtained}`,
    `📈 *Percentage:* ${stats.pct}%`,
    `🎖️ *Grade:* ${stats.grade}`,
    `✅ *Result Status:* ${stats.status.toUpperCase()}`,
    result.remarks ? `💬 *Remarks:* "${result.remarks}"` : null,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🏫 EMIS: ${SCHOOL_INFO.emis}`,
    `✍️ Principal: ${SCHOOL_INFO.principal}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildFeeReceiptWhatsAppMsg(student: any): string {
  const netFee = getNetStudentFee(student);
  const paid = Number(student.paid || 0);
  const due = Math.max(0, netFee - paid);
  const status = getFeeStatus(student);
  const clsLabel = formatClassLabel(student.class);

  return [
    `🧾 *${SCHOOL_INFO.nameUpper}*`,
    `💵 *OFFICIAL FEE PAYMENT RECEIPT*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🧾 *Receipt No:* ${student.receiptNo || `REC-${student.id}`}`,
    `👤 *Student:* ${student.name}`,
    `🏷️ *Adm #:* ${student.admNo}`,
    `👨 *Father:* ${student.father}`,
    `🏫 *Class:* ${clsLabel}`,
    `📅 *Payment Date:* ${student.payDate || new Date().toISOString().split("T")[0]}`,
    `💳 *Payment Method:* ${student.payMethod || "Cash"}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `• Monthly Tuition Fee: Rs. ${Number(student.fee).toLocaleString()}`,
    Number(student.adj || 0) !== 0 ? `• Adjustment: Rs. ${student.adj}` : null,
    `• Net Payable Fee: Rs. ${netFee.toLocaleString()}`,
    `• Amount Paid: Rs. ${paid.toLocaleString()}`,
    `• Remaining Balance: Rs. ${due.toLocaleString()}`,
    `• Payment Status: ${status === "Paid" ? "PAID ✅" : status === "Partial" ? "PARTIAL ⚠️" : "UNPAID ❌"}`,
    student.payRemarks ? `💬 *Remarks:* ${student.payRemarks}` : null,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `Thank you for your payment. JazakAllah Khair!`,
    `🏫 EMIS: ${SCHOOL_INFO.emis}`,
    `✍️ Principal: ${SCHOOL_INFO.principal}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function buildStudentIDCardWhatsAppMsg(student: any): string {
  const clsLabel = formatClassLabel(student.class);
  return [
    `🪪 *${SCHOOL_INFO.nameUpper}*`,
    `🌟 *OFFICIAL STUDENT ID CARD*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Name:* ${student.name}`,
    `🏷️ *Admission #:* ${student.admNo}`,
    `👨 *Father Name:* ${student.father}`,
    `🏫 *Class:* ${clsLabel}`,
    `🎂 *Date of Birth:* ${student.dob || "—"}`,
    `🆔 *B-Form / CNIC:* ${student.bform || "—"}`,
    `📞 *Emergency Contact:* ${student.phone || "—"}`,
    `📍 *Address:* ${student.address || SCHOOL_INFO.address}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🏫 EMIS: ${SCHOOL_INFO.emis}`,
    `✍️ Verified by Principal: ${SCHOOL_INFO.principal}`,
  ]
    .filter(Boolean)
    .join("\n");
}

export function formatCNIC(value: string): string {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 13);
  if (digits.length <= 5) return digits;
  if (digits.length <= 12) return `${digits.slice(0, 5)}-${digits.slice(5)}`;
  return `${digits.slice(0, 5)}-${digits.slice(5, 12)}-${digits.slice(12)}`;
}

export function buildFacultyIDCardWhatsAppMsg(teacher: any): string {
  return [
    `🪪 *${SCHOOL_INFO.nameUpper}*`,
    `🌟 *FACULTY & STAFF ID CARD*`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `👤 *Staff Name:* ${teacher.name}`,
    `🏷️ *Employee ID:* ${teacher.empId}`,
    `💼 *Designation:* ${teacher.role}`,
    `🆔 *CNIC:* ${teacher.cnic || "—"}`,
    `📞 *Phone / Contact:* ${teacher.phone || "—"}`,
    `━━━━━━━━━━━━━━━━━━━━━`,
    `🏫 EMIS: ${SCHOOL_INFO.emis}`,
    `✍️ Verified by Principal: ${SCHOOL_INFO.principal}`,
  ]
    .filter(Boolean)
    .join("\n");
}
