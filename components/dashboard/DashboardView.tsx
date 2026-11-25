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
  onEnterMarksClick?: () => void;
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
  onEnterMarksClick,
  onPrintSummary,
  onPrintStudentRegister,
  onPrintFeeRegister,
  onTabSwitch,
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

  const totalFeeExpected = activeStudents.reduce(
    (sum, s) => sum + getNetStudentFee(s),
    0
  );
  const totalFeeCollected = activeStudents.reduce(
    (sum, s) => sum + Number(s.paid || 0),
    0
  );
  const totalFeePending = Math.max(0, totalFeeExpected - totalFeeCollected);
  const feeRate =
    totalFeeExpected > 0
      ? Math.round((totalFeeCollected / totalFeeExpected) * 100)
      : 0;

  const totalNetPayroll = teachers.reduce((sum, t) => {
    const net = Math.max(
      0,
      Number(t.basic || 0) + Number(t.allowance || 0) - Number(t.deduction || 0)
    );
    return sum + net;
  }, 0);

  const staffPresentCount = teachers.filter(
    (t) => (t.att || "Present") === "Present"
  ).length;

  const avgStudentAge = activeStudents.length
    ? (
        activeStudents.reduce((acc, s) => acc + calculateAge(s.dob).years, 0) /
        activeStudents.length
      ).toFixed(1)
    : "0";

  return (
    <section className="tab-panel p-4 sm:p-8 space-y-6">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-royal-900 via-royal-800 to-sky-800 text-white rounded-3xl p-6 sm:p-8 shadow-xl flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="max-w-2xl min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="px-3 py-0.5 rounded-full bg-gold-400 text-royal-950 font-extrabold text-[11px] uppercase">
              EMIS: {SCHOOL_INFO.emis}
            </span>
            <span className="px-3 py-0.5 rounded-full bg-white/15 text-sky-200 font-semibold text-[11px]">
              Principal: {SCHOOL_INFO.principal}
            </span>
          </div>
          <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight leading-tight">
            {SCHOOL_INFO.name}
          </h3>
          <p className="font-urdu text-base text-gold-300 mt-1">
            {SCHOOL_INFO.urduName} — {SCHOOL_INFO.urduAddress}
          </p>
        </div>
        <div className="flex flex-wrap gap-2.5 w-full lg:w-auto">
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
            Print Monthly Summary
          </button>
        </div>
      </div>

      {/* 6 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {/* Active Students */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">
              Total Active Students
            </p>
            <h4 className="text-3xl font-extrabold text-royal-900 mt-1">
              {activeStudents.length}
            </h4>
            <p className="text-xs text-emerald-600 font-semibold mt-1">
              {leftStudents.length} Left • Avg Age: {avgStudentAge} Yrs
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-royal-100 text-royal-800">
            <Icon name="students" className="w-6 h-6" />
          </div>
        </div>

        {/* Today's Attendance % */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">
              Today&apos;s Attendance %
            </p>
            <h4 className="text-3xl font-extrabold text-sky-700 mt-1">
              {attPct}%
            </h4>
            <p className="text-xs text-slate-600 font-semibold mt-1">
              {presentCount} Present • {absentCount} Absent
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-sky-100 text-sky-700">
            <Icon name="attendance" className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Fee Collected */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">
              Monthly Fee Collected
            </p>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
              Rs. {totalFeeCollected.toLocaleString()}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              {feeRate}% of Rs. {totalFeeExpected.toLocaleString()}
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-emerald-100 text-emerald-700">
            <Icon name="fees" className="w-6 h-6" />
          </div>
        </div>

        {/* Pending Fee Balance */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">
              Pending Fee Balance
            </p>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-rose-600 mt-1">
              Rs. {totalFeePending.toLocaleString()}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Send WhatsApp reminders in Fees
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-rose-100 text-rose-700">
            <Icon name="alert" className="w-6 h-6" />
          </div>
        </div>

        {/* Total Faculty & Staff */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">
              Total Faculty &amp; Staff
            </p>
            <h4 className="text-3xl font-extrabold text-royal-900 mt-1">
              {teachers.length}
            </h4>
            <p className="text-xs text-purple-700 font-semibold mt-1">
              {staffPresentCount} / {teachers.length} Present Today
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-purple-100 text-purple-700">
            <Icon name="staff" className="w-6 h-6" />
          </div>
        </div>

        {/* Monthly Payroll */}
        <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase text-slate-500">
              Monthly Payroll
            </p>
            <h4 className="text-2xl sm:text-3xl font-extrabold text-emerald-700 mt-1">
              Rs. {totalNetPayroll.toLocaleString()}
            </h4>
            <p className="text-xs text-slate-500 font-semibold mt-1">
              Net payable after leave deductions
            </p>
          </div>
          <div className="p-3.5 rounded-2xl bg-amber-100 text-amber-800">
            <Icon name="cert" className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Quick Actions Bar */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-3">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onAdmitClick}
            className="px-4 py-2.5 rounded-xl bg-royal-800 hover:bg-royal-900 text-white font-bold text-xs transition touch-manipulation"
          >
            + Admit Student
          </button>
          <button
            type="button"
            onClick={() => onTabSwitch("attendance")}
            className="px-4 py-2.5 rounded-xl bg-sky-100 hover:bg-sky-200 text-royal-900 font-bold text-xs transition touch-manipulation"
          >
            Daily Attendance
          </button>
          <button
            type="button"
            onClick={() => onTabSwitch("fees")}
            className="px-4 py-2.5 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold text-xs transition touch-manipulation"
          >
            Fee Ledger &amp; Receipts
          </button>
          <button
            type="button"
            onClick={() =>
              onEnterMarksClick ? onEnterMarksClick() : onTabSwitch("results")
            }
            className="px-4 py-2.5 rounded-xl bg-gold-300 hover:bg-gold-400 text-royal-950 font-extrabold text-xs transition touch-manipulation"
          >
            + Enter Exam Marks
          </button>
          <button
            type="button"
            onClick={() => onTabSwitch("idcards")}
            className="px-4 py-2.5 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-900 font-bold text-xs transition touch-manipulation"
          >
            ID Card Studio
          </button>
          <button
            type="button"
            onClick={() => onTabSwitch("slc")}
            className="px-4 py-2.5 rounded-xl bg-amber-100 hover:bg-amber-200 text-amber-950 font-bold text-xs transition touch-manipulation"
          >
            Leaving Cert (SLC)
          </button>
        </div>
      </div>

      {/* 14 Separate Classes Breakdown & Monthly Fee Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-slate-200">
          <div className="flex flex-wrap justify-between items-center gap-2 mb-4">
            <div>
              <h4 className="text-base font-extrabold text-royal-900">
                Complete 14-Class Breakdown (Nursery to Class 12)
              </h4>
              <p className="text-xs text-slate-500">
                Click any class row to open Students filtered directly to that
                class.
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
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                  <th className="p-2.5 font-bold">Class</th>
                  <th className="p-2.5 font-bold text-center">Active</th>
                  <th className="p-2.5 font-bold text-center">
                    Present / Absent
                  </th>
                  <th className="p-2.5 font-bold text-right">Fee Collected</th>
                  <th className="p-2.5 font-bold text-right">Fee Due</th>
                  <th className="p-2.5 font-bold text-center">Avg. Age</th>
                  <th className="p-2.5 font-bold text-center">Left</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {SCHOOL_CLASSES.map((cls) => {
                  const list = students.filter((s) => s.class === cls);
                  const act = list.filter((s) => s.status === "Active");
                  const left = list.filter((s) => s.status === "Left");
                  const collected = act.reduce(
                    (sum, s) => sum + Number(s.paid || 0),
                    0
                  );
                  const due = act.reduce(
                    (sum, s) =>
                      sum + Math.max(0, getNetStudentFee(s) - Number(s.paid || 0)),
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
                        act.reduce(
                          (acc, s) => acc + calculateAge(s.dob).years,
                          0
                        ) / act.length
                      ).toFixed(1) + " Yrs"
                    : "—";

                  return (
                    <tr
                      key={cls}
                      onClick={() => onTabSwitch("students", cls)}
                      className="hover:bg-royal-50/70 cursor-pointer transition"
                    >
                      <td className="p-2.5 font-extrabold text-royal-900">
                        {formatClassLabel(cls)}
                      </td>
                      <td className="p-2.5 text-center font-extrabold text-emerald-700">
                        {act.length}
                      </td>
                      <td className="p-2.5 text-center font-bold text-sky-700">
                        {pres} P / <span className="text-rose-600">{abs} A</span>
                      </td>
                      <td className="p-2.5 text-right font-bold text-emerald-700">
                        Rs. {collected.toLocaleString()}
                      </td>
                      <td
                        className={`p-2.5 text-right font-bold ${
                          due > 0 ? "text-rose-600" : "text-slate-400"
                        }`}
                      >
                        Rs. {due.toLocaleString()}
                      </td>
                      <td className="p-2.5 text-center font-semibold text-slate-700">
                        {avgAge}
                      </td>
                      <td className="p-2.5 text-center font-semibold text-amber-700">
                        {left.length}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Monthly Fee Progress */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-1">
              <h4 className="text-base font-extrabold text-royal-900">
                Monthly Fee Progress
              </h4>
              <button
                type="button"
                onClick={onPrintFeeRegister}
                className="text-xs font-bold text-emerald-700 underline"
              >
                Print Fee Sheet
              </button>
            </div>
            <p className="text-xs text-slate-500 mb-5">
              Expected billing, collected fees &amp; remaining dues across all
              14 classes
            </p>
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-600">
                    Total Expected Billing
                  </span>
                  <strong className="text-sm font-extrabold text-royal-900">
                    Rs. {totalFeeExpected.toLocaleString()}
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-emerald-800">
                    Total Fee Collected
                  </span>
                  <strong className="text-sm font-extrabold text-emerald-800">
                    Rs. {totalFeeCollected.toLocaleString()}
                  </strong>
                </div>
                <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 flex justify-between items-center">
                  <span className="text-xs font-bold text-rose-800">
                    Pending Fee Balance
                  </span>
                  <strong className="text-sm font-extrabold text-rose-700">
                    Rs. {totalFeePending.toLocaleString()}
                  </strong>
                </div>
              </div>
              <div className="pt-2">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-600">Collection Rate</span>
                  <span className="text-emerald-700">{feeRate}% Collected</span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full transition-all"
                    style={{ width: `${Math.min(100, feeRate)}%` }}
                  ></div>
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
