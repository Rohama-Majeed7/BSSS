"use client";

import React, { useRef } from "react";

interface ReportsViewProps {
  onExportExcel: () => void;
  onExportJSON: () => void;
  onImportJSON: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onPrintStudentRegister: () => void;
  onPrintFeeRegister: () => void;
  onPrintAttendanceSheet: () => void;
  onPrintResultGazette: () => void;
  onPrintPayrollRegister: () => void;
  onPrintExecutiveSummary: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  onExportExcel,
  onExportJSON,
  onImportJSON,
  onPrintStudentRegister,
  onPrintFeeRegister,
  onPrintAttendanceSheet,
  onPrintResultGazette,
  onPrintPayrollRegister,
  onPrintExecutiveSummary,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const masterRegisters = [
    {
      title: "1. Student Admission Register",
      desc: "All students with Admission No, Father CNIC, B-Form, DOB, Age & Class",
      onClick: onPrintStudentRegister,
      btnClass: "bg-royal-50 border-royal-200 text-royal-900 hover:bg-royal-100",
    },
    {
      title: "2. Monthly Fee & Dues Register",
      desc: "Tuition fees, discounts/fines, paid amounts & balances across all 14 classes",
      onClick: onPrintFeeRegister,
      btnClass: "bg-emerald-50 border-emerald-200 text-emerald-950 hover:bg-emerald-100",
    },
    {
      title: "3. Daily Attendance Register",
      desc: "Date-wise Present, Absent & Leave status for active students",
      onClick: onPrintAttendanceSheet,
      btnClass: "bg-sky-50 border-sky-200 text-sky-950 hover:bg-sky-100",
    },
    {
      title: "4. Exam Result Gazette",
      desc: "Consolidated marks, percentages, grades & class positions",
      onClick: onPrintResultGazette,
      btnClass: "bg-gold-50 border-gold-200 text-royal-950 hover:bg-gold-100",
    },
    {
      title: "5. Faculty Payroll Register",
      desc: "Teachers roster, designations, deductions & net monthly salaries",
      onClick: onPrintPayrollRegister,
      btnClass: "bg-purple-50 border-purple-200 text-purple-950 hover:bg-purple-100",
    },
    {
      title: "6. Monthly Executive Summary",
      desc: "Overall strength, attendance %, fee collections & net payroll summary",
      onClick: onPrintExecutiveSummary,
      btnClass: "bg-slate-100 border-slate-300 text-slate-900 hover:bg-slate-200",
    },
  ];

  return (
    <section className="tab-panel p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      {/* Backup & Restore Bar */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <h3 className="text-base sm:text-lg font-extrabold text-royal-900 mb-1">
          Export &amp; Restore School Data (.xlsx / .csv / .json)
        </h3>
        <p className="text-xs text-slate-500 mb-4 sm:mb-5">
          Download complete school records with 7 dedicated Excel sheets or create portable JSON snapshots.
        </p>
        <div className="flex flex-wrap gap-2.5 sm:gap-3">
          <button
            type="button"
            onClick={onExportExcel}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <span>Download 7-Sheet Excel (.xlsx)</span>
          </button>
          <button
            type="button"
            onClick={onExportJSON}
            className="flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl bg-royal-800 hover:bg-royal-900 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center"
          >
            Download JSON Backup
          </button>
          <label className="cursor-pointer flex-1 sm:flex-none px-4 sm:px-5 py-2.5 sm:py-3 rounded-2xl border-2 border-dashed border-slate-300 hover:border-royal-500 text-slate-700 hover:text-royal-900 font-extrabold text-xs sm:text-sm transition flex items-center justify-center gap-2">
            <span>Restore JSON Backup</span>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={onImportJSON}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* 6 Master Registers */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200">
        <h3 className="text-base sm:text-lg font-extrabold text-royal-900 mb-1">
          One-Click Printable A4 Master Registers
        </h3>
        <p className="text-xs text-slate-500 mb-4 sm:mb-5">
          Pre-formatted institutional reports conforming to official board and school filing standards.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {masterRegisters.map((reg, i) => (
            <button
              key={i}
              type="button"
              onClick={reg.onClick}
              className={`p-4 sm:p-5 rounded-2xl border text-left transition flex flex-col justify-between space-y-2 touch-manipulation ${reg.btnClass}`}
            >
              <div>
                <h4 className="font-extrabold text-xs sm:text-sm">{reg.title}</h4>
                <p className="text-[11px] sm:text-xs opacity-80 mt-1 leading-snug">{reg.desc}</p>
              </div>
              <div className="text-[10px] sm:text-[11px] font-extrabold underline pt-1 sm:pt-2">
                Click to Print A4 &rarr;
              </div>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ReportsView;
