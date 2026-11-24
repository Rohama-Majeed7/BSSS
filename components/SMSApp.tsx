"use client";

import React, { useState, useEffect } from "react";
import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import DashboardView from "@/components/dashboard/DashboardView";
import StudentsView from "@/components/students/StudentsView";
import AttendanceView from "@/components/attendance/AttendanceView";
import FeesView from "@/components/fees/FeesView";
import ExamsView from "@/components/exams/ExamsView";
import IDCardStudioView from "@/components/idcards/IDCardStudioView";
import SLCView from "@/components/slc/SLCView";
import StaffView from "@/components/staff/StaffView";
import ReportsView from "@/components/reports/ReportsView";

import StudentModal from "@/components/students/StudentModal";
import PaymentModal from "@/components/fees/PaymentModal";
import ResultModal from "@/components/exams/ResultModal";
import StaffModal from "@/components/staff/StaffModal";
import DocModal from "@/components/modals/DocModal";
import Toast from "@/components/ui/Toast";
import Icon from "@/components/ui/Icon";

import TwinFeeReceipt from "@/components/docs/TwinFeeReceipt";
import ResultCardDMC from "@/components/docs/ResultCardDMC";
import TeacherPaySlip from "@/components/docs/TeacherPaySlip";

import {
  DEFAULT_FEE_REMINDER_TEMPLATE,
  SCHOOL_INFO,
  VALID_TABS,
  type ValidTab,
} from "@/lib/constants";
import {
  formatClassLabel,
  buildWhatsAppURL,
  buildFeeReceiptWhatsAppMsg,
  buildResultCardWhatsAppMsg,
} from "@/lib/utils";
import { export7SheetExcel } from "@/lib/excelExport";
import { printOrSavePdf } from "@/lib/exportPdf";
import {
  triggerA4Print,
  buildStudentRegisterHTML,
  buildFeeRegisterHTML,
  buildAttendanceSheetHTML,
  buildResultGazetteHTML,
  buildPayrollRegisterHTML,
  buildExecutiveSummaryHTML,
} from "@/components/docs/MasterRegisters";
import {
  getDashboardData,
  saveStudent,
  deleteStudent,
  saveAttendance,
  recordFeePayment,
  saveExamResult,
  deleteExamResult,
  saveStaff,
  deleteStaff,
  cycleStaffAttendance,
  togglePayrollStatus,
  saveStudentSLC,
  updateLogo,
  updateSignature,
  updateFeeReminderTemplate,
  updateReminderSentLog,
  StudentRecord,
  StaffRecord,
  ExamResultRecord,
} from "@/lib/api";

export interface SMSAppProps {
  initialTab?: string;
  initialSearchParams?: { [key: string]: string | string[] | undefined };
}

export default function SMSApp({ initialTab, initialSearchParams }: SMSAppProps) {
  // Determine initial active tab: prioritize initialTab prop, then fallback to dashboard
  const [activeTab, setActiveTab] = useState<string>(() => {
    if (initialTab && VALID_TABS.includes(initialTab.toLowerCase() as ValidTab)) {
      return initialTab.toLowerCase();
    }
    return "dashboard";
  });

  const [students, setStudents] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [examResults, setExamResults] = useState<any[]>([]);
  const [attendanceMap, setAttendanceMap] = useState<Record<string, Record<string, string>>>({});
  const [customLogo, setCustomLogo] = useState<string>("");
  const [customSign, setCustomSign] = useState<string>("");
  const [feeReminderTemplate, setFeeReminderTemplate] = useState<string>(
    DEFAULT_FEE_REMINDER_TEMPLATE
  );
  const [monthlyReminderSentLog, setMonthlyReminderSentLog] = useState<
    Record<string, Record<string, string>>
  >({});

  // Mobile drawer state
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any>(null);

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [payingStudent, setPayingStudent] = useState<any>(null);

  const [isResultModalOpen, setIsResultModalOpen] = useState(false);
  const [editingResult, setEditingResult] = useState<any>(null);

  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<any>(null);

  // Document modal preview state
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [docModalTitle, setDocModalTitle] = useState("");
  const [docModalContent, setDocModalContent] = useState<React.ReactNode>(null);
  const [docModalExtraButton, setDocModalExtraButton] = useState<React.ReactNode>(null);

  // Toast state
  const [toastMessage, setToastMessage] = useState("");
  const [isToastVisible, setIsToastVisible] = useState(false);
  const [toastType, setToastType] = useState<"success" | "error" | "warning" | "info">("success");

  // Class filter passed across tabs (e.g. clicking class on dashboard or from URL ?class=...)
  const [studentsClassFilter, setStudentsClassFilter] = useState<string>(() => {
    if (initialSearchParams?.class && typeof initialSearchParams.class === "string") {
      return initialSearchParams.class;
    }
    return "";
  });

  const [isDbConnected, setIsDbConnected] = useState(false);

  const showToast = (msg: string, type: "success" | "error" | "warning" | "info" = "success") => {
    setToastMessage(msg);
    setToastType(type);
    setIsToastVisible(true);
    setTimeout(() => {
      setIsToastVisible(false);
    }, type === "error" ? 5000 : 3200);
  };

  // Sync tab with URL and browser history (handles refresh, back/forward buttons, direct entry)
  useEffect(() => {
    const syncTabFromLocation = () => {
      if (typeof window === "undefined") return;
      const pathSegment = window.location.pathname.replace(/^\//, "").split("/")[0].toLowerCase();
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab")?.toLowerCase();
      const classParam = params.get("class");

      let resolvedTab = "";
      if (pathSegment && VALID_TABS.includes(pathSegment as ValidTab)) {
        resolvedTab = pathSegment;
      } else if (tabParam && VALID_TABS.includes(tabParam as ValidTab)) {
        resolvedTab = tabParam;
      } else {
        const savedTab = localStorage.getItem("bs_sms_active_tab");
        if (savedTab && VALID_TABS.includes(savedTab as ValidTab)) {
          resolvedTab = savedTab;
        }
      }

      if (resolvedTab) {
        setActiveTab(resolvedTab);
      }
      if (classParam) {
        setStudentsClassFilter(classParam);
      }
    };

    syncTabFromLocation();
    window.addEventListener("popstate", syncTabFromLocation);
    return () => window.removeEventListener("popstate", syncTabFromLocation);
  }, []);

  // Universal tab switcher that preserves URL routing and browser history
  const switchTab = (tab: string, extraFilter?: string) => {
    const normalizedTab = VALID_TABS.includes(tab.toLowerCase() as ValidTab)
      ? tab.toLowerCase()
      : "dashboard";

    setActiveTab(normalizedTab);
    localStorage.setItem("bs_sms_active_tab", normalizedTab);

    if (extraFilter !== undefined) {
      setStudentsClassFilter(extraFilter);
    } else if (normalizedTab !== "students") {
      setStudentsClassFilter("");
    }
    setIsMobileSidebarOpen(false);

    // Update browser URL without full reload, preserving search params where applicable
    if (typeof window !== "undefined") {
      const targetPath = normalizedTab === "dashboard" ? "/" : `/${normalizedTab}`;
      const url = new URL(window.location.origin + targetPath);
      if (extraFilter) {
        url.searchParams.set("class", extraFilter);
      }
      window.history.pushState(null, "", url.pathname + url.search);
    }
  };

  // Centralized function to load / refresh real data from PostgreSQL database via modular API
  const refreshAllData = async (showErrorToast = true) => {
    try {
      const data = await getDashboardData();
      setIsDbConnected(true);
      setStudents(Array.isArray(data.students) ? data.students : []);
      setTeachers(Array.isArray(data.teachers) ? data.teachers : []);
      setExamResults(Array.isArray(data.examResults) ? data.examResults : []);
      setAttendanceMap(data.attendanceMap || {});
      if (data.setting) {
        if (data.setting.logo) setCustomLogo(data.setting.logo);
        if (data.setting.sign) setCustomSign(data.setting.sign);
        if (data.setting.feeReminderTemplate) setFeeReminderTemplate(data.setting.feeReminderTemplate);
        if (data.setting.reminderSentLog) setMonthlyReminderSentLog(data.setting.reminderSentLog);
      }
    } catch (err: any) {
      setIsDbConnected(false);
      const errorMsg = err.message || "Could not connect to PostgreSQL database.";
      if (showErrorToast) showToast(`Database error: ${errorMsg}`, "error");
      setStudents([]);
      setTeachers([]);
      setExamResults([]);
      setAttendanceMap({});
    }
  };

  // Initial database load on component mount
  useEffect(() => {
    refreshAllData(true);
  }, []);

  // Tab titles
  const tabTitles: Record<string, string> = {
    dashboard: "Dashboard & Class-Wise Summary",
    students: "Students Directory (14 Classes)",
    attendance: "Daily Student Attendance",
    fees: "Fee Ledger & Twin-Copy Receipts",
    results: "Exams & DMC Result Cards",
    idcards: "Student & Faculty ID Card Studio",
    slc: "School Leaving Certificate (SLC) Studio",
    staff: "Faculty & Staff Payroll",
    excelhub: "Excel (.xlsx) & Master Registers Hub",
  };

  const handleStudentPhotoRemoved = (studentId: number) => {
    setStudents((prev) =>
      prev.map((s) => (s.id === studentId ? { ...s, photo: null, photoUrl: null } : s))
    );
    setEditingStudent((prev: any) =>
      prev && prev.id === studentId ? { ...prev, photo: null, photoUrl: null } : prev
    );
  };

  const handleTeacherPhotoRemoved = (teacherId: number) => {
    setTeachers((prev) =>
      prev.map((t) => (t.id === teacherId ? { ...t, photo: null, photoUrl: null } : t))
    );
    setEditingTeacher((prev: any) =>
      prev && prev.id === teacherId ? { ...prev, photo: null, photoUrl: null } : prev
    );
  };

  // Student CRUD handlers
  const handleSaveStudent = async (data: any) => {
    try {
      await saveStudent(data);
      await refreshAllData(false);
      showToast(data.id ? "Student updated successfully." : "New student admitted and saved to database!", "success");
    } catch (err: any) {
      if (!err.message?.includes("Failed to save student record.") && !err.message?.includes("exists")) {
        showToast(`Error saving student: ${err.message || "Could not reach the database."}`, "error");
      }
      throw err;
    }
  };

  const handleDeleteStudent = async (id: number) => {
    try {
      await deleteStudent(id);
      await refreshAllData(false);
      showToast("Student deleted from database.", "success");
    } catch (err: any) {
      showToast(`Error deleting student: ${err.message || "Could not reach the database."}`, "error");
    }
  };

  // Attendance handler
  const handleSaveAttendance = async (date: string, mapForDate: Record<string, string>) => {
    try {
      await saveAttendance(date, mapForDate);
      await refreshAllData(false);
      showToast(`Attendance saved for ${date} in database.`, "success");
    } catch (err: any) {
      showToast(`Attendance save failed: ${err.message || "Could not reach the database."}`, "error");
    }
  };

  // Payment handler
  const handleSavePayment = async (data: any) => {
    const s = students.find((item) => item.id === data.studentId);
    if (!s) {
      showToast("Selected student not found in database.", "error");
      return;
    }

    try {
      await recordFeePayment({
        studentId: data.studentId,
        receiptNo: s.receiptNo || undefined,
        amount: data.amount,
        adj: data.adj,
        payDate: data.date,
        payMethod: data.method,
        payRemarks: data.remarks,
      });
      await refreshAllData(false);
      showToast("Payment recorded and saved to database!", "success");
      const updatedStudent = {
        ...s,
        paid: data.amount,
        adj: data.adj,
        payDate: data.date,
        payMethod: data.method,
        payRemarks: data.remarks,
      };
      handleViewFeeReceipt(updatedStudent);
    } catch (err: any) {
      if (!err.message?.includes("Failed to record fee payment.")) {
        showToast(`Fee payment failed: ${err.message || "Could not reach the database."}`, "error");
      }
      throw err;
    }
  };

  // Fee receipt preview handler
  const handleViewFeeReceipt = (student: any) => {
    setDocModalTitle(`Fee Receipt — ${student.name} (Adm #${student.admNo})`);
    setDocModalContent(
      <TwinFeeReceipt student={student} customLogo={customLogo} customSign={customSign} />
    );
    setDocModalExtraButton(
      <a
        href={buildWhatsAppURL(
          student.phone,
          buildFeeReceiptWhatsAppMsg(student)
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition"
      >
        <Icon name="whatsapp" className="w-3.5 h-3.5" />
        <span>WhatsApp Fee Receipt</span>
      </a>
    );
    setIsDocModalOpen(true);
  };

  // Result CRUD handlers
  const handleSaveResult = async (data: any) => {
    try {
      const saved = await saveExamResult(data);
      await refreshAllData(false);
      showToast(data.id ? "Exam result updated in database." : "Exam marks saved to database!", "success");
      if (saved) {
        handleViewDMC(saved);
      }
    } catch (err: any) {
      if (!err.message?.includes("Failed to save exam result.")) {
        showToast(`Error saving result: ${err.message || "Could not reach the database."}`, "error");
      }
      throw err;
    }
  };

  const handleDeleteResult = async (id: number) => {
    try {
      await deleteExamResult(id);
      await refreshAllData(false);
      showToast("Exam record deleted from database.", "success");
    } catch (err: any) {
      showToast(`Error deleting result: ${err.message || "Could not reach the database."}`, "error");
    }
  };

  const handleViewDMC = (result: any) => {
    const s = students.find((item) => item.id === result.studentId);
    if (!s) return;
    setDocModalTitle(`Result Card (DMC) — ${s.name} (${result.term})`);
    setDocModalContent(
      <ResultCardDMC
        result={result}
        student={s}
        customLogo={customLogo}
        customSign={customSign}
      />
    );
    setDocModalExtraButton(
      <a
        href={buildWhatsAppURL(
          s.phone,
          buildResultCardWhatsAppMsg(s, result)
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 shadow-sm transition"
      >
        <Icon name="whatsapp" className="w-3.5 h-3.5" />
        <span>WhatsApp DMC Result</span>
      </a>
    );
    setIsDocModalOpen(true);
  };

  // Staff CRUD handlers
  const handleSaveTeacher = async (data: any) => {
    try {
      await saveStaff(data);
      await refreshAllData(false);
      showToast(data.id ? "Faculty profile updated in database." : "New faculty member saved to database!", "success");
    } catch (err: any) {
      if (!err.message?.includes("Failed to save faculty record.")) {
        showToast(`Error saving faculty: ${err.message || "Could not reach the database."}`, "error");
      }
      throw err;
    }
  };

  const handleDeleteStaff = async (id: number) => {
    try {
      await deleteStaff(id);
      await refreshAllData(false);
      showToast("Faculty member removed from database.", "success");
    } catch (err: any) {
      showToast(`Error removing faculty: ${err.message || "Could not reach the database."}`, "error");
    }
  };

  const handleCycleAttendance = async (id: number) => {
    const t = teachers.find((item) => item.id === id);
    if (!t) return;
    try {
      await cycleStaffAttendance(t);
      await refreshAllData(false);
      showToast(`Attendance updated for ${t.name}.`, "success");
    } catch (err: any) {
      showToast(`Attendance update failed: ${err.message || "Could not reach the database."}`, "error");
    }
  };

  const handleTogglePayStatus = async (id: number) => {
    const t = teachers.find((item) => item.id === id);
    if (!t) return;
    try {
      await togglePayrollStatus(t);
      await refreshAllData(false);
      showToast(`Salary payment status updated for ${t.name}.`, "success");
    } catch (err: any) {
      showToast(`Pay status update failed: ${err.message || "Could not reach the database."}`, "error");
    }
  };

  const handleViewPaySlip = (teacher: any) => {
    setDocModalTitle(`Salary Pay Slip — ${teacher.name} (${teacher.empId})`);
    setDocModalContent(
      <TeacherPaySlip teacher={teacher} customLogo={customLogo} customSign={customSign} />
    );
    setDocModalExtraButton(
      <a
        href={buildWhatsAppURL(
          teacher.phone,
          `Assalam-o-Alaikum ${teacher.name}, your monthly salary slip from ${SCHOOL_INFO.name} has been processed.`
        )}
        target="_blank"
        rel="noopener noreferrer"
        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-block"
      >
        WhatsApp Slip
      </a>
    );
    setIsDocModalOpen(true);
  };

  // School Leaving Certificate (SLC) save handler
  const handleSaveSLC = async (studentId: number, slcData: any) => {
    const s = students.find((item) => item.id === studentId);
    if (!s) {
      showToast("Selected student not found in database.", "error");
      return;
    }
    try {
      await saveStudentSLC(s, slcData);
      await refreshAllData(false);
      showToast("SLC details saved to database.", "success");
    } catch (err: any) {
      showToast(`SLC save failed: ${err.message || "Could not reach the database."}`, "error");
    }
  };

  // Document modal print & PDF save handler
  const handlePrintModalDoc = () => {
    const el = document.querySelector(".doc-modal-body");
    const filename = `${docModalTitle.replace(/[^a-zA-Z0-9_-]/g, "_")}.pdf`;
    if (el) {
      printOrSavePdf(el.innerHTML, filename);
    } else {
      window.print();
    }
  };

  const handleSaveModalDocPdf = () => {
    handlePrintModalDoc();
  };

  // Master Registers printing handlers
  const handlePrintStudentRegister = () => {
    triggerA4Print(buildStudentRegisterHTML(students));
  };

  const handlePrintFeeRegister = () => {
    triggerA4Print(buildFeeRegisterHTML(students));
  };

  const handlePrintAttendanceSheet = () => {
    triggerA4Print(buildAttendanceSheetHTML(students, attendanceMap));
  };

  const handlePrintResultGazette = () => {
    triggerA4Print(buildResultGazetteHTML(examResults, students));
  };

  const handlePrintPayrollRegister = () => {
    triggerA4Print(buildPayrollRegisterHTML(teachers));
  };

  const handlePrintExecutiveSummary = () => {
    triggerA4Print(buildExecutiveSummaryHTML(students, teachers));
  };

  // Excel and JSON backup
  const handleExportExcel = () => {
    export7SheetExcel(students, attendanceMap, examResults, teachers);
    showToast("7-Sheet Excel workbook downloaded!");
  };

  const handleExportJSON = () => {
    const data = {
      version: 8,
      exportedAt: new Date().toISOString(),
      school: SCHOOL_INFO,
      students,
      teachers,
      examResults,
      attendanceMap,
      feeReminderTemplate,
      monthlyReminderSentLog,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `BrightStars_Backup_${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    showToast("JSON backup downloaded!");
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.students) setStudents(data.students);
        if (data.teachers) setTeachers(data.teachers);
        if (data.examResults) setExamResults(data.examResults);
        if (data.attendanceMap) setAttendanceMap(data.attendanceMap);
        showToast("Backup restored successfully!");
      } catch (err) {
        showToast("Invalid backup file format.", "error");
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col lg:flex-row bg-slate-100 text-slate-800 antialiased lg:overflow-hidden">
      {/* Sidebar Navigation - Fixed height on desktop */}
      <Sidebar
        activeTab={activeTab}
        onTabChange={(tab) => switchTab(tab)}
        onAdmitClick={() => {
          setEditingStudent(null);
          setIsStudentModalOpen(true);
        }}
        onBackupClick={handleExportExcel}
        customLogo={customLogo}
        customSign={customSign}
        onLogoUpload={(url) => {
          setCustomLogo(url);
          showToast("Logo updated!");
          updateLogo(url).catch(console.error);
        }}
        onSignUpload={(url) => {
          setCustomSign(url);
          showToast("Principal Signature updated!");
          updateSignature(url).catch(console.error);
        }}
        isSaved={isDbConnected}
        isOpenOnMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Workspace - Scrollable content area with sticky header */}
      <main className="flex-1 flex flex-col min-w-0 overflow-x-hidden min-h-screen lg:h-screen lg:overflow-hidden">
        <Header
          pageTitle={tabTitles[activeTab] || "School Management System"}
          onExportExcel={handleExportExcel}
          onPrintRegisters={() => switchTab("excelhub")}
          onAdmitStudent={() => {
            setEditingStudent(null);
            setIsStudentModalOpen(true);
          }}
          onToggleMobileMenu={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          customLogo={customLogo}
        />

        {/* Viewport Content Panel */}
        <div className="flex-1 overflow-y-auto min-h-0 flex flex-col">
          {/* Tab 1: Dashboard */}
          {activeTab === "dashboard" && (
            <DashboardView
              students={students}
              teachers={teachers}
              attendanceMap={attendanceMap}
              onAdmitClick={() => {
                setEditingStudent(null);
                setIsStudentModalOpen(true);
              }}
              onPrintSummary={handlePrintExecutiveSummary}
              onPrintStudentRegister={handlePrintStudentRegister}
              onPrintFeeRegister={handlePrintFeeRegister}
              onTabSwitch={(tab, filterClass) => {
                switchTab(tab, filterClass);
              }}

              customLogo={customLogo}
            />
          )}

          {/* Tab 2: Students */}
          {activeTab === "students" && (
            <StudentsView
              students={students}
              onAdmitClick={() => {
                setEditingStudent(null);
                setIsStudentModalOpen(true);
              }}
              onEditStudent={(s) => {
                setEditingStudent(s);
                setIsStudentModalOpen(true);
              }}
              onDeleteStudent={handleDeleteStudent}
              onViewIDCard={() => switchTab("idcards")}
              onViewResult={(s) => {
                const res = examResults.find((r) => r.studentId === s.id);
                if (res) handleViewDMC(res);
                else {
                  setEditingResult({ studentId: s.id });
                  setIsResultModalOpen(true);
                }
              }}
              onViewSLC={() => switchTab("slc")}
              initialClassFilter={studentsClassFilter}
            />
          )}

          {/* Tab 3: Attendance */}
          {activeTab === "attendance" && (
            <AttendanceView
              students={students}
              attendanceMap={attendanceMap}
              onSaveAttendance={handleSaveAttendance}
              onPrintSheet={handlePrintAttendanceSheet}
              onShowToast={showToast}
            />
          )}

          {/* Tab 4: Fees */}
          {activeTab === "fees" && (
            <FeesView
              students={students}
              onOpenPaymentModal={(s) => {
                setPayingStudent(s);
                setIsPaymentModalOpen(true);
              }}
              onViewFeeReceipt={handleViewFeeReceipt}
              onPrintFeeRegister={handlePrintFeeRegister}
              onShowToast={showToast}
              feeReminderTemplate={feeReminderTemplate}
              onUpdateTemplate={(tpl) => {
                setFeeReminderTemplate(tpl);
                updateFeeReminderTemplate(tpl).catch(console.error);
              }}
              monthlyReminderSentLog={monthlyReminderSentLog}
              onMarkReminderSent={(month, stuId) => {
                const updatedLog = {
                  ...monthlyReminderSentLog,
                  [month]: { ...(monthlyReminderSentLog[month] || {}), [stuId]: new Date().toISOString() },
                };
                setMonthlyReminderSentLog(updatedLog);
                updateReminderSentLog(updatedLog).catch(console.error);
              }}
              onResetMonthSentLog={(month) => {
                const updatedLog = { ...monthlyReminderSentLog };
                delete updatedLog[month];
                setMonthlyReminderSentLog(updatedLog);
                updateReminderSentLog(updatedLog).catch(console.error);
              }}
            />
          )}

          {/* Tab 5: Results */}
          {activeTab === "results" && (
            <ExamsView
              examResults={examResults}
              students={students}
              onOpenResultModal={(editRes) => {
                setEditingResult(editRes);
                setIsResultModalOpen(true);
              }}
              onViewDMC={handleViewDMC}
              onDeleteResult={handleDeleteResult}
              onPrintGazette={handlePrintResultGazette}
            />
          )}

          {/* Tab 6: ID Cards */}
          {activeTab === "idcards" && (
            <IDCardStudioView
              students={students}
              teachers={teachers}
              onPrintBatch={() => {
                window.print();
              }}
              customLogo={customLogo}
              customSign={customSign}
            />
          )}

          {/* Tab 7: SLC */}
          {activeTab === "slc" && (
            <SLCView
              students={students}
              onSaveSLC={handleSaveSLC}
              onPrintSLC={() => {
                window.print();
              }}
              onShowToast={showToast}
              customLogo={customLogo}
              customSign={customSign}
            />
          )}

          {/* Tab 8: Staff */}
          {activeTab === "staff" && (
            <StaffView
              teachers={teachers}
              onOpenStaffModal={(t) => {
                setEditingTeacher(t);
                setIsStaffModalOpen(true);
              }}
              onDeleteStaff={handleDeleteStaff}
              onCycleAttendance={handleCycleAttendance}
              onTogglePayStatus={handleTogglePayStatus}
              onViewIDCard={() => switchTab("idcards")}
              onViewPaySlip={handleViewPaySlip}
              onPrintPayrollSheet={handlePrintPayrollRegister}
            />
          )}

          {/* Tab 9: Excel Hub */}
          {activeTab === "excelhub" && (
            <ReportsView
              onExportExcel={handleExportExcel}
              onExportJSON={handleExportJSON}
              onImportJSON={handleImportJSON}
              onPrintStudentRegister={handlePrintStudentRegister}
              onPrintFeeRegister={handlePrintFeeRegister}
              onPrintAttendanceSheet={handlePrintAttendanceSheet}
              onPrintResultGazette={handlePrintResultGazette}
              onPrintPayrollRegister={handlePrintPayrollRegister}
              onPrintExecutiveSummary={handlePrintExecutiveSummary}
            />
          )}
        </div>
      </main>

      {/* Student Admission & Edit Modal */}
      <StudentModal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        onSave={handleSaveStudent}
        onPhotoRemoved={handleStudentPhotoRemoved}
        editStudent={editingStudent}
        allStudents={students}
      />

      {/* Record Fee Payment Modal */}
      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        onSavePayment={handleSavePayment}
        student={payingStudent}
      />

      {/* Exam Marks Entry Modal */}
      <ResultModal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        onSaveResult={handleSaveResult}
        editResult={editingResult}
        students={students}
      />

      {/* Faculty Add & Edit Modal */}
      <StaffModal
        isOpen={isStaffModalOpen}
        onClose={() => setIsStaffModalOpen(false)}
        onSaveTeacher={handleSaveTeacher}
        onPhotoRemoved={handleTeacherPhotoRemoved}
        editTeacher={editingTeacher}
        allTeachers={teachers}
      />

      {/* Universal Document Preview Modal */}
      <DocModal
        isOpen={isDocModalOpen}
        onClose={() => setIsDocModalOpen(false)}
        title={docModalTitle}
        onPrint={handlePrintModalDoc}
        onSavePdf={handleSaveModalDocPdf}
        extraLeftButton={docModalExtraButton}
      >
        <div className="doc-modal-body">{docModalContent}</div>
      </DocModal>

      {/* Operational Toast */}
      <Toast message={toastMessage} isVisible={isToastVisible} type={toastType} />
    </div>
  );
}
