import * as XLSX from "xlsx";
import { SCHOOL_CLASSES, SCHOOL_INFO } from "./constants";
import { formatClassLabel, calculateAge, getNetStudentFee, getFeeStatus, calcExamStats, calcTeacherNetPay } from "./utils";

export function export7SheetExcel(
  students: any[],
  attendanceMap: Record<string, Record<string, string>>,
  examResults: any[],
  teachers: any[],
  currentDate?: string
) {
  const dt = currentDate || new Date().toISOString().split("T")[0];
  const dayAtt = attendanceMap[dt] || {};

  // 1. Students Sheet
  const stuRows = students.map((s, i) => ({
    Sr: i + 1,
    "Admission No": s.admNo,
    "Student Name": s.name,
    "Father Name": s.father,
    "Father CNIC No": s.fatherCnic || "",
    Class: formatClassLabel(s.class),
    "Class to which admitted": formatClassLabel(s.admClass || s.class),
    "Date of admission": s.admDate || "",
    "Class from which withdraw": s.leaveClass ? formatClassLabel(s.leaveClass) : "",
    "Date of withdraw": s.leaveDate || "",
    Gender: s.gender,
    DOB: s.dob,
    "Auto Age": calculateAge(s.dob).text,
    "B-Form / CNIC": s.bform,
    WhatsApp: s.phone,
    "Monthly Fee (Rs.)": Number(s.fee),
    Address: s.address,
    Status: s.status,
  }));

  // 2. Attendance Sheet
  const attRows = students
    .filter((s) => s.status === "Active")
    .map((s, i) => ({
      Sr: i + 1,
      Date: dt,
      "Admission No": s.admNo,
      "Student Name": s.name,
      Class: formatClassLabel(s.class),
      Status: dayAtt[s.id] || "Present",
      WhatsApp: s.phone,
    }));

  // 3. Fee Ledger Sheet
  const feeRows = students.map((s, i) => ({
    Sr: i + 1,
    "Admission No": s.admNo,
    "Receipt No": s.receiptNo || `REC-${s.id}`,
    "Student Name": s.name,
    "Father Name": s.father,
    Class: formatClassLabel(s.class),
    "Base Fee (Rs.)": Number(s.fee),
    "Adj (+/-)": Number(s.adj || 0),
    "Net Fee (Rs.)": getNetStudentFee(s),
    "Paid (Rs.)": Number(s.paid || 0),
    "Balance (Rs.)": Math.max(0, getNetStudentFee(s) - Number(s.paid || 0)),
    Method: s.payMethod || "Cash",
    Status: getFeeStatus(s),
  }));

  // 4. Exam Results Sheet
  const resRows = examResults.map((r, i) => {
    const s = students.find((st) => String(st.id) === String(r.studentId)) || {};
    const st = calcExamStats(r.subjects);
    return {
      Sr: i + 1,
      Term: r.term,
      Date: r.date,
      "Admission No": s.admNo || "",
      Student: s.name || "",
      Class: formatClassLabel(s.class),
      Obtained: st.obtained,
      Total: st.total,
      Percentage: st.pct + "%",
      Grade: st.grade,
      Position: r.rank || "",
      Result: st.status,
    };
  });

  // 5. Faculty & Payroll Sheet
  const staffRows = teachers.map((t, i) => {
    const p = calcTeacherNetPay(t);
    return {
      Sr: i + 1,
      "Staff ID": t.empId,
      Name: t.name,
      Designation: t.role,
      CNIC: t.cnic,
      Phone: t.phone,
      Attendance: t.att,
      "Salary (Rs.)": p.basic,
      "Allowances (Rs.)": p.allow,
      "Deductions (Rs.)": p.ded,
      "Net Pay (Rs.)": p.net,
      "Pay Status": t.payStatus,
    };
  });

  // 6. SLC Records Sheet
  const slcRows = students
    .filter((s) => s.status === "Left" || s.leaveDate)
    .map((s, i) => ({
      Sr: i + 1,
      "Admission No": s.admNo,
      "Student Name": s.name,
      "Father Name": s.father,
      DOB: s.dob,
      "B-Form": s.bform,
      "Admission Class": formatClassLabel(s.admClass || s.class),
      "Date of Admission": s.admDate || "",
      "Leaving Class": formatClassLabel(s.leaveClass || s.class),
      "Leaving Date": s.leaveDate || "",
      Conduct: s.conduct || "Excellent",
      Reason: s.leaveReason || "",
    }));

  // 7. 14-Class Summary Sheet
  const classSummaryRows = SCHOOL_CLASSES.map((cls) => {
    const list = students.filter((s) => s.class === cls);
    const act = list.filter((s) => s.status === "Active");
    const col = act.reduce((sum, s) => sum + Number(s.paid || 0), 0);
    const due = act.reduce((sum, s) => sum + Math.max(0, getNetStudentFee(s) - Number(s.paid || 0)), 0);
    const avg = act.length
      ? (act.reduce((acc, s) => acc + calculateAge(s.dob).years, 0) / act.length).toFixed(1) + " Yrs"
      : "N/A";
    return {
      Class: formatClassLabel(cls),
      "Active Students": act.length,
      "Left Students": list.filter((s) => s.status === "Left").length,
      "Fee Collected (Rs.)": col,
      "Fee Due (Rs.)": due,
      "Average Age": avg,
    };
  });

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(stuRows), "Students");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(attRows), "Attendance");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(feeRows), "Fee Ledger");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(resRows), "Exam Results");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(staffRows), "Faculty Payroll");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(slcRows), "Leaving Certs");
  XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(classSummaryRows), "14-Class Summary");

  XLSX.writeFile(wb, `BrightStars_SMS_CompleteBackup_${dt}.xlsx`);
}
