import { SCHOOL_INFO, SCHOOL_CLASSES } from "@/lib/constants";
import {
  formatClassLabel,
  calculateAge,
  getNetStudentFee,
  getFeeStatus,
  calcExamStats,
  calcTeacherNetPay,
  esc,
} from "@/lib/utils";

export function getA4ReportHeader(title: string, sub: string = ""): string {
  const dt = new Date().toLocaleDateString("en-PK", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  return `
    <div style="border-bottom: 2px solid #0f2347; padding-bottom: 8px; margin-bottom: 12px; text-align: center;">
      <h2 style="margin: 0; color: #0f2347; font-size: 15pt; font-weight: 800; text-transform: uppercase;">${esc(
    SCHOOL_INFO.nameUpper
  )}</h2>
      <p style="margin: 2px 0 0; color: #d99b26; font-size: 11pt; font-family: 'Noto Nastaliq Urdu', serif;">${esc(
    SCHOOL_INFO.urduName
  )}</p>
      <p style="margin: 2px 0 0; color: #475569; font-size: 8pt;">EMIS: ${esc(
    SCHOOL_INFO.emis
  )} • ${esc(SCHOOL_INFO.address)} • Principal: ${esc(SCHOOL_INFO.principal)}</p>
      <div style="margin-top: 6px; display: inline-block; padding: 2px 14px; background: #0f2347; color: #fcd34d; font-weight: 800; font-size: 8.5pt; border-radius: 9999px; text-transform: uppercase;">${esc(
    title
  )}</div>
      ${sub ? `<p style="margin: 3px 0 0; font-size: 8pt; color: #64748b;">${esc(sub)}</p>` : ""}
      <div style="text-align: right; font-size: 7.5pt; color: #94a3b8; margin-top: 2px;">Report Generated: ${esc(
    dt
  )}</div>
    </div>
  `;
}

export function getA4ReportFooter(): string {
  return `
    <div style="margin-top: 30px; display: flex; justify-content: space-between; font-size: 8.5pt; color: #334155; padding-top: 10px; border-top: 1px solid #cbd5e1;">
      <div style="text-align: center; width: 140px;"><div style="border-bottom: 1px solid #64748b; margin-bottom: 4px;"></div>Prepared By (Clerk)</div>
      <div style="text-align: center; width: 140px;"><div style="border-bottom: 1px solid #64748b; margin-bottom: 4px;"></div>Checked By (Incharge)</div>
      <div style="text-align: center; width: 160px;"><div style="border-bottom: 1px solid #0f2347; margin-bottom: 4px;"></div><strong>Rahmatullah Dogar</strong><br><span style="font-size: 7.5pt; text-transform: uppercase;">Principal &amp; Stamp</span></div>
    </div>
  `;
}

export function triggerA4Print(innerHTML: string) {
  const stage = document.getElementById("print-stage");
  if (!stage) return;
  stage.innerHTML = innerHTML;
  window.print();
}

export function buildStudentRegisterHTML(students: any[]): string {
  const rows = students
    .map(
      (s, i) => `
    <tr>
      <td style="padding:4px;text-align:center;">${i + 1}</td>
      <td style="padding:4px;font-family:monospace;font-weight:700;">${esc(s.admNo)}</td>
      <td style="padding:4px;font-weight:700;">${esc(s.name)}</td>
      <td style="padding:4px;">${esc(s.father)}</td>
      <td style="padding:4px;font-family:monospace;">${esc(s.fatherCnic || "—")}</td>
      <td style="padding:4px;font-weight:700;">${esc(formatClassLabel(s.class))}</td>
      <td style="padding:4px;text-align:center;">${esc(s.gender)}</td>
      <td style="padding:4px;text-align:center;">${esc(s.dob)}</td>
      <td style="padding:4px;text-align:center;">${esc(calculateAge(s.dob).text)}</td>
      <td style="padding:4px;font-family:monospace;">${esc(s.bform)}</td>
      <td style="padding:4px;font-family:monospace;">${esc(s.phone)}</td>
      <td style="padding:4px;text-align:center;">${esc(s.status)}</td>
    </tr>
  `
    )
    .join("");

  return `
    ${getA4ReportHeader("STUDENT ADMISSION MASTER REGISTER (ALL 14 CLASSES)")}
    <table style="width:100%;font-size:9.5px;border-collapse:collapse;">
      <thead style="background:#f1f5f9;">
        <tr>
          <th>#</th><th>Adm #</th><th>Student Name</th><th>Father Name</th><th>Father CNIC</th>
          <th>Class</th><th>Gender</th><th>DOB</th><th>Age</th><th>B-Form</th><th>WhatsApp</th><th>Status</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="12" style="padding:16px;text-align:center;color:#64748b;">No students found in database.</td></tr>'}</tbody>
    </table>
    ${getA4ReportFooter()}
  `;
}

export function buildFeeRegisterHTML(students: any[]): string {
  let sumBase = 0,
    sumPaid = 0,
    sumDue = 0;
  const rows = students
    .filter((s) => s.status === "Active")
    .map((s, i) => {
      const net = getNetStudentFee(s);
      const paid = Number(s.paid || 0);
      const due = Math.max(0, net - paid);
      sumBase += net;
      sumPaid += paid;
      sumDue += due;
      return `
      <tr>
        <td style="padding:4px;text-align:center;">${i + 1}</td>
        <td style="padding:4px;font-family:monospace;">${esc(s.admNo)}</td>
        <td style="padding:4px;font-weight:700;">${esc(s.name)}</td>
        <td style="padding:4px;">${esc(s.father)}</td>
        <td style="padding:4px;">${esc(formatClassLabel(s.class))}</td>
        <td style="padding:4px;text-align:right;">Rs. ${net.toLocaleString()}</td>
        <td style="padding:4px;text-align:right;color:#047857;font-weight:700;">Rs. ${paid.toLocaleString()}</td>
        <td style="padding:4px;text-align:right;color:#b91c1c;font-weight:700;">Rs. ${due.toLocaleString()}</td>
        <td style="padding:4px;text-align:center;">${esc(getFeeStatus(s))}</td>
      </tr>
    `;
    })
    .join("");

  return `
    ${getA4ReportHeader("MONTHLY FEE & DUES REGISTER")}
    <table style="width:100%;font-size:9.5px;border-collapse:collapse;">
      <thead style="background:#f1f5f9;">
        <tr>
          <th>#</th><th>Adm #</th><th>Student Name</th><th>Father Name</th><th>Class</th>
          <th>Expected Fee</th><th>Paid Amount</th><th>Balance Due</th><th>Status</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="12" style="padding:16px;text-align:center;color:#64748b;">No students found in database.</td></tr>'}</tbody>
      <tfoot>
        <tr style="background:#eff6ff;font-weight:800;">
          <td colspan="5" style="padding:5px;text-align:right;">TOTALS:</td>
          <td style="padding:5px;text-align:right;">Rs. ${sumBase.toLocaleString()}</td>
          <td style="padding:5px;text-align:right;color:#047857;">Rs. ${sumPaid.toLocaleString()}</td>
          <td style="padding:5px;text-align:right;color:#b91c1c;">Rs. ${sumDue.toLocaleString()}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
    ${getA4ReportFooter()}
  `;
}

export function buildAttendanceSheetHTML(
  students: any[],
  attendanceMap: Record<string, Record<string, string>>,
  dateStr?: string
): string {
  const dt = dateStr || new Date().toISOString().split("T")[0];
  const dayAtt = attendanceMap[dt] || {};
  const rows = students
    .filter((s) => s.status === "Active")
    .map(
      (s, i) => `
    <tr>
      <td style="padding:4px;text-align:center;">${i + 1}</td>
      <td style="padding:4px;font-family:monospace;">${esc(s.admNo)}</td>
      <td style="padding:4px;font-weight:700;">${esc(s.name)}</td>
      <td style="padding:4px;">${esc(s.father)}</td>
      <td style="padding:4px;">${esc(formatClassLabel(s.class))}</td>
      <td style="padding:4px;text-align:center;font-weight:700;">${esc(
        dayAtt[s.id] || "Present"
      )}</td>
    </tr>
  `
    )
    .join("");

  return `
    ${getA4ReportHeader("DAILY STUDENT ATTENDANCE REGISTER", `Date: ${dt}`)}
    <table style="width:100%;font-size:9.5px;border-collapse:collapse;">
      <thead style="background:#f1f5f9;">
        <tr>
          <th>#</th><th>Adm #</th><th>Student Name</th><th>Father Name</th><th>Class</th><th>Attendance Status</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="12" style="padding:16px;text-align:center;color:#64748b;">No students found in database.</td></tr>'}</tbody>
    </table>
    ${getA4ReportFooter()}
  `;
}

export function buildResultGazetteHTML(examResults: any[], students: any[]): string {
  const rows = examResults
    .map((r, i) => {
      const s = students.find((st) => String(st.id) === String(r.studentId)) || {};
      const st = calcExamStats(r.subjects);
      return `
      <tr>
        <td style="padding:4px;text-align:center;">${i + 1}</td>
        <td style="padding:4px;font-family:monospace;">${esc(s.admNo || "")}</td>
        <td style="padding:4px;font-weight:700;">${esc(s.name || "")}</td>
        <td style="padding:4px;">${esc(formatClassLabel(s.class))}</td>
        <td style="padding:4px;">${esc(r.term)}</td>
        <td style="padding:4px;text-align:center;">${st.obtained}/${st.total}</td>
        <td style="padding:4px;text-align:center;font-weight:700;">${st.pct}%</td>
        <td style="padding:4px;text-align:center;font-weight:800;">${st.grade}</td>
        <td style="padding:4px;text-align:center;">${esc(r.rank || "—")}</td>
        <td style="padding:4px;text-align:center;">${st.status}</td>
      </tr>
    `;
    })
    .join("");

  return `
    ${getA4ReportHeader("EXAM RESULT GAZETTE")}
    <table style="width:100%;font-size:9.5px;border-collapse:collapse;">
      <thead style="background:#f1f5f9;">
        <tr>
          <th>#</th><th>Adm No</th><th>Student Name</th><th>Class</th><th>Exam Term</th>
          <th>Marks</th><th>%</th><th>Grade</th><th>Position</th><th>Result</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="12" style="padding:16px;text-align:center;color:#64748b;">No students found in database.</td></tr>'}</tbody>
    </table>
    ${getA4ReportFooter()}
  `;
}

export function buildPayrollRegisterHTML(teachers: any[]): string {
  let sumNet = 0;
  const rows = teachers
    .map((t, i) => {
      const p = calcTeacherNetPay(t);
      sumNet += p.net;
      return `
      <tr>
        <td style="padding:4px;text-align:center;">${i + 1}</td>
        <td style="padding:4px;font-family:monospace;">${esc(t.empId)}</td>
        <td style="padding:4px;font-weight:700;">${esc(t.name)}</td>
        <td style="padding:4px;">${esc(t.role)}</td>
        <td style="padding:4px;font-family:monospace;">${esc(t.cnic)}</td>
        <td style="padding:4px;text-align:right;">Rs. ${p.basic.toLocaleString()}</td>
        <td style="padding:4px;text-align:right;">Rs. ${p.allow.toLocaleString()}</td>
        <td style="padding:4px;text-align:right;">Rs. ${p.ded.toLocaleString()}</td>
        <td style="padding:4px;text-align:right;font-weight:800;">Rs. ${p.net.toLocaleString()}</td>
        <td style="padding:4px;text-align:center;">${esc(t.payStatus)}</td>
      </tr>
    `;
    })
    .join("");

  return `
    ${getA4ReportHeader("FACULTY PAYROLL REGISTER")}
    <table style="width:100%;font-size:9.5px;border-collapse:collapse;">
      <thead style="background:#f1f5f9;">
        <tr>
          <th>#</th><th>Staff ID</th><th>Name</th><th>Designation</th><th>CNIC</th>
          <th>Salary</th><th>Allowances</th><th>Deductions</th><th>Net Pay</th><th>Status</th>
        </tr>
      </thead>
      <tbody>${rows || '<tr><td colspan="12" style="padding:16px;text-align:center;color:#64748b;">No students found in database.</td></tr>'}</tbody>
      <tfoot>
        <tr style="background:#eff6ff;font-weight:800;">
          <td colspan="8" style="padding:5px;text-align:right;">TOTAL NET PAYROLL:</td>
          <td style="padding:5px;text-align:right;">Rs. ${sumNet.toLocaleString()}</td>
          <td></td>
        </tr>
      </tfoot>
    </table>
    ${getA4ReportFooter()}
  `;
}

export function buildExecutiveSummaryHTML(students: any[], teachers: any[]): string {
  const act = students.filter((s) => s.status === "Active");
  const totalFee = act.reduce((s, x) => s + getNetStudentFee(x), 0);
  const totalCol = act.reduce((s, x) => s + Number(x.paid || 0), 0);
  const totalPay = teachers.reduce((s, t) => s + calcTeacherNetPay(t).net, 0);

  return `
    ${getA4ReportHeader("MONTHLY EXECUTIVE SUMMARY")}
    <table style="width:100%;font-size:11px;border-collapse:collapse;">
      <tr>
        <td style="padding:8px;font-weight:700;">Total Active Students (14 Classes)</td>
        <td style="padding:8px;font-weight:800;text-align:right;">${act.length}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:8px;font-weight:700;">Total Monthly Fee Expected</td>
        <td style="padding:8px;font-weight:800;text-align:right;">Rs. ${totalFee.toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:8px;font-weight:700;">Total Monthly Fee Collected</td>
        <td style="padding:8px;font-weight:800;text-align:right;color:#047857;">Rs. ${totalCol.toLocaleString()}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:8px;font-weight:700;">Pending Fee Dues</td>
        <td style="padding:8px;font-weight:800;text-align:right;color:#b91c1c;">Rs. ${Math.max(
    0,
    totalFee - totalCol
  ).toLocaleString()}</td>
      </tr>
      <tr>
        <td style="padding:8px;font-weight:700;">Total Faculty &amp; Staff</td>
        <td style="padding:8px;font-weight:800;text-align:right;">${teachers.length}</td>
      </tr>
      <tr style="background:#f8fafc;">
        <td style="padding:8px;font-weight:700;">Total Monthly Net Payroll</td>
        <td style="padding:8px;font-weight:800;text-align:right;">Rs. ${totalPay.toLocaleString()}</td>
      </tr>
    </table>
    ${getA4ReportFooter()}
  `;
}
