"use client";

import React from "react";
import Icon from "../ui/Icon";
import { SCHOOL_INFO, SCHOOL_CLASSES } from "@/lib/constants";
import { formatClassLabel, calculateAge, getNetStudentFee } from "@/lib/utils";

interface DashboardViewProps {
  students: any[];
  teachers: any[];
  attendanceMap: Record<string, Record<string, string>>;
  onAdmitClick: () => void;
  onPrintSummary: () => void;
  onPrintStudentRegister: () => void;
  onPrintFeeRegister: () => void;
  onTabSwitch: (tab: string, filterClass?: string) => void;
  customLogo?: string;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  students,
  teachers,
  attendanceMap,
  onAdmitClick,
  onPrintSummary,
  onPrintStudentRegister,
  onPrintFeeRegister,
  onTabSwitch,
  customLogo,
}) => {
  const activeStudents = students.filter((s) => s.status === "Active");
  const leftStudents = students.filter((s) => s.status === "Left");

  const todayISO = new Date().toISOString().split("T")[0];
  const todayAtt = attendanceMap[todayISO] || {};

  let presentCount = 0;
  let absentCount = 0;
  activeStudents.forEach((s) => {
    const st = todayAtt[s.id] || "Present";
    if (st === "Present") presentCount++;
    else if (st === "Absent") absentCount++;
  });

  const attPct =
    activeStudents.length > 0
      ? Math.round((presentCount / activeStudents.length) * 100)
      : 0;

  const totalFeeExpected = activeStudents.reduce((sum, s) => sum + getNetStudentFee(s), 0);
  const totalFeeCollected = activeStudents.reduce((sum, s) => sum + Number(s.paid || 0), 0);
  const totalFeePending = Math.max(0, totalFeeExpected - totalFeeCollected);
  const feeRate =
    totalFeeExpected > 0 ? Math.round((totalFeeCollected / totalFeeExpected) * 100) : 0;

  const totalNetPayroll = teachers.reduce((sum, t) => {
    const net = Math.max(0, Number(t.basic || 0) + Number(t.allowance || 0) - Number(t.deduction || 0));
    return sum + net;
  }, 0);

  const staffPresentCount = teachers.filter((t) => (t.att || "Present") === "Present").length;

  const avgStudentAge = activeStudents.length
    ? (
      activeStudents.reduce((acc, s) => acc + calculateAge(s.dob).years, 0) /
      activeStudents.length
    ).toFixed(1)
    : "0";

  return (
    <section className="tab-panel p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-royal-900 via-royal-800 to-sky-800 text-white rounded-3xl p-5 sm:p-6 lg:p-8 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5 sm:gap-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5 max-w-2xl min-w-0">

          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
              <span className="px-2.5 sm:px-3 py-0.5 rounded-full bg-gold-400 text-royal-950 font-extrabold text-[10px] sm:text-[11px] uppercase">
                EMIS: {SCHOOL_INFO.emis}
              </span>
              <span className="px-2.5 sm:px-3 py-0.5 rounded-full bg-white/15 text-sky-200 font-semibold text-[10px] sm:text-[11px]">
                Principal: {SCHOOL_INFO.principal}
              </span>
            </div>
            <h3 className="text-lg sm:text-2xl lg:text-3xl font-extrabold tracking-tight leading-tight">
              {SCHOOL_INFO.name}
            </h3>
            <p className="font-urdu text-sm sm:text-base text-gold-300 mt-0.5 sm:mt-1">
              {SCHOOL_INFO.urduName} — {SCHOOL_INFO.urduAddress}
            </p>

          </div>
        </div>
        <div className="flex flex-wrap gap-2 w-full lg:w-auto">
          <button
            type="button"
            onClick={onAdmitClick}
            className="flex-1 sm:flex-none text-center bg-gold-400 hover:bg-gold-300 text-royal-950 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold shadow-md transition touch-manipulation"
          >
            + New Admission
          </button>
          <button
            type="button"
            onClick={onPrintSummary}
            className="flex-1 sm:flex-none text-center bg-white/15 hover:bg-white/25 border border-white/25 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition touch-manipulation"
          >
            Print Summary
          </button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
        {/* Active Students */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Total Active Students</p>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-royal-900 mt-1">{activeStudents.length}</h4>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              {leftStudents.length} Left • Avg Age: {avgStudentAge} Yrs
            </p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-royal-100 text-royal-800">
            <Icon name="students" className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Attendance % */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Today&apos;s Attendance %</p>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-sky-700 mt-1">{attPct}%</h4>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              {presentCount} Present • {absentCount} Absent
            </p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-sky-100 text-sky-700">
            <Icon name="attendance" className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Fee Collected */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Monthly Fee Collected</p>
            <h4 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-700 mt-1">
              Rs. {totalFeeCollected.toLocaleString()}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">{feeRate}% Collected</p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-emerald-100 text-emerald-700">
            <Icon name="fees" className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Pending Fee */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Pending Fee Balance</p>
            <h4 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-rose-600 mt-1">
              Rs. {totalFeePending.toLocaleString()}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">Send WhatsApp reminders in Fees</p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-rose-100 text-rose-700">
            <Icon name="alert" className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Faculty */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Total Faculty &amp; Staff</p>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-royal-900 mt-1">{teachers.length}</h4>
            <p className="text-xs text-purple-700 font-semibold mt-1">
              {staffPresentCount} / {teachers.length} Present Today
            </p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-purple-100 text-purple-700">
            <Icon name="staff" className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>

        {/* Monthly Payroll */}
        <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">Monthly Payroll</p>
            <h4 className="text-xl sm:text-2xl lg:text-3xl font-extrabold text-emerald-700 mt-1">
              Rs. {totalNetPayroll.toLocaleString()}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">Net payable after leave deductions</p>
          </div>
          <div className="p-3 sm:p-3.5 rounded-2xl bg-amber-100 text-amber-800">
            <Icon name="cert" className="w-5 h-5 sm:w-6 sm:h-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={onAdmitClick}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-royal-800 hover:bg-royal-900 text-white font-bold text-xs transition touch-manipulation"
          >
            + Admit Student
          </button>
          <button
            type="button"
            onClick={() => onTabSwitch("attendance")}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-royal-900 font-bold text-xs transition touch-manipulation"
          >
            Daily Attendance
          </button>
          <button
            type="button"
            onClick={() => onTabSwitch("fees")}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs transition touch-manipulation"
          >
            Fee Ledger &amp; Receipts
          </button>
          <button
            type="button"
            onClick={() => onTabSwitch("results")}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-gold-300 hover:bg-gold-400 text-royal-950 font-extrabold text-xs transition touch-manipulation"
          >
            + Enter Exam Marks
          </button>
          <button
            type="button"
            onClick={() => onTabSwitch("idcards")}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-xs transition touch-manipulation"
          >
            ID Card Studio
          </button>
          <button
            type="button"
            onClick={() => onTabSwitch("slc")}
            className="px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs transition touch-manipulation"
          >
            Leaving Cert (SLC)
          </button>
        </div>
      </div>

      {/* 14 Separate Classes Breakdown & Monthly Fee Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div>
              <h4 className="text-sm sm:text-base font-extrabold text-royal-900">
                Complete 14-Class Breakdown (Nursery to Class 12)
              </h4>
              <p className="text-xs text-slate-500">
                Click any class row to open Students filtered directly to that class.
              </p>
            </div>
            <button
              type="button"
              onClick={onPrintStudentRegister}
              className="text-xs font-bold text-royal-700 underline"
            >
              Print Register
            </button>
          </div>
          <div className="overflow-x-auto overflow-y-auto max-h-[460px] rounded-2xl border border-slate-100">
            <table className="w-full text-left border-collapse text-xs min-w-[600px]">
              <thead className="sticky top-0 z-10 bg-slate-50 shadow-xs">
                <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                  <th className="p-2.5 font-bold bg-slate-50">Class</th>
                  <th className="p-2.5 font-bold bg-slate-50 text-center">Active</th>
                  <th className="p-2.5 font-bold bg-slate-50 text-center">Present / Absent</th>
                  <th className="p-2.5 font-bold bg-slate-50 text-right">Fee Collected</th>
                  <th className="p-2.5 font-bold bg-slate-50 text-right">Fee Due</th>
                  <th className="p-2.5 font-bold bg-slate-50 text-center">Avg. Age</th>
                  <th className="p-2.5 font-bold bg-slate-50 text-center">Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SCHOOL_CLASSES.map((cls) => {
                  const list = students.filter((s) => s.class === cls);
                  const act = list.filter((s) => s.status === "Active");
                  const left = list.filter((s) => s.status === "Left");
                  const collected = act.reduce((sum, s) => sum + Number(s.paid || 0), 0);
                  const due = act.reduce(
                    (sum, s) => sum + Math.max(0, getNetStudentFee(s) - Number(s.paid || 0)),
                    0
                  );
                  let pres = 0;
                  let abs = 0;
                  act.forEach((s) => {
                    const st = todayAtt[s.id] || "Present";
                    if (st === "Present") pres++;
                    else if (st === "Absent") abs++;
                  });
                  const avgAge = act.length
                    ? (
                      act.reduce((acc, s) => acc + calculateAge(s.dob).years, 0) / act.length
                    ).toFixed(1) + " Y"
                    : "—";

                  return (
                    <tr
                      key={cls}
                      onClick={() => onTabSwitch("students", cls)}
                      className="hover:bg-slate-50 cursor-pointer transition"
                    >
                      <td className="p-2.5 font-extrabold text-royal-900">{formatClassLabel(cls)}</td>
                      <td className="p-2.5 text-center font-bold">{act.length}</td>
                      <td className="p-2.5 text-center">
                        <span className="text-emerald-700 font-bold">{pres}</span> /{" "}
                        <span className="text-rose-600 font-bold">{abs}</span>
                      </td>
                      <td className="p-2.5 text-right font-semibold text-emerald-700">
                        Rs. {collected.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-right font-semibold text-rose-600">
                        Rs. {due.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-center text-slate-500 font-medium">{avgAge}</td>
                      <td className="p-2.5 text-center text-amber-700 font-semibold">{left.length}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Fee Progress */}
        <div className="bg-white rounded-3xl p-4 sm:p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-base font-extrabold text-royal-900">Monthly Fee Progress</h4>
              <button
                type="button"
                onClick={onPrintFeeRegister}
                className="text-xs font-bold text-emerald-700 underline"
              >
                Print Fee Sheet
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Expected billing, collected fees &amp; remaining dues across all 14 classes
            </p>
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-royal-50 border border-royal-100">
                <div className="flex justify-between text-xs font-bold text-royal-900">
                  <span>Total Expected Revenue</span>
                  <span>Rs. {totalFeeExpected.toLocaleString()}</span>
                </div>
                <div className="mt-2 w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-600 h-2.5 rounded-full transition-all"
                    style={{ width: `${Math.min(100, feeRate)}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600 mt-2">
                  <span className="font-semibold text-emerald-700">
                    Collected: Rs. {totalFeeCollected.toLocaleString()} ({feeRate}%)
                  </span>
                  <span className="font-semibold text-rose-600">
                    Due: Rs. {totalFeePending.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 pt-4 border-t border-slate-100 flex justify-between items-center text-xs">
            <span className="text-slate-500">Send WhatsApp reminders:</span>
            <button
              type="button"
              onClick={() => onTabSwitch("fees")}
              className="font-bold text-royal-700 underline"
            >
              Open Fee Ledger &rarr;
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DashboardView;
