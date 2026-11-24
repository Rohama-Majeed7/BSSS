"use client";

import React from "react";
import { SCHOOL_INFO } from "@/lib/constants";
import { formatClassLabel, getNetStudentFee, getFeeStatus } from "@/lib/utils";

interface TwinFeeReceiptProps {
  student: any;
  customLogo?: string;
  customSign?: string;
}

export const TwinFeeReceipt: React.FC<TwinFeeReceiptProps> = ({
  student,
  customLogo,
  customSign,
}) => {
  if (!student) return null;

  const netFee = getNetStudentFee(student);
  const paid = Number(student.paid || 0);
  const due = Math.max(0, netFee - paid);
  const feeSt = getFeeStatus(student);
  const clsLabel = formatClassLabel(student.class);

  const renderHalfReceipt = (copyTitle: string) => (
    <div className="w-full sm:w-1/2 print:!w-1/2 p-3 sm:p-4 bg-white border border-slate-300 rounded-xl relative space-y-2 text-slate-800 text-[11px] doc-watermark">
      {/* Header */}
      <div className="text-center border-b border-royal-900 pb-2">
        <div className="flex items-center justify-center gap-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white p-0.5 border border-gold-400 overflow-hidden flex-shrink-0 flex items-center justify-center">
            {customLogo ? (
              <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <span className="text-[8px] font-extrabold text-royal-900">BSS</span>
            )}
          </div>
          <div>
            <h4 className="font-extrabold text-royal-950 text-xs uppercase leading-tight">
              {SCHOOL_INFO.nameUpper}
            </h4>
            <p className="font-urdu text-[10px] text-gold-600 leading-none mt-0.5">
              {SCHOOL_INFO.urduName}
            </p>
            <p className="text-[9px] text-slate-500">
              EMIS: {SCHOOL_INFO.emis} • {SCHOOL_INFO.address}
            </p>
          </div>
        </div>
        <div className="mt-1.5 flex justify-between items-center px-1">
          <span className="px-2 py-0.5 rounded-full bg-royal-900 text-white font-extrabold text-[9px] uppercase tracking-wider">
            {copyTitle}
          </span>
          <span className="font-mono font-bold text-slate-600 text-[10px]">
            Receipt: {student.receiptNo || `REC-${student.id}`}
          </span>
        </div>
      </div>

      {/* Student Info */}
      <div className="grid grid-cols-2 gap-x-2 gap-y-1 text-[10px] border-b border-slate-200 pb-2">
        <p>
          <strong>Student:</strong> {student.name}
        </p>
        <p>
          <strong>Adm #:</strong> <span className="font-mono font-bold">{student.admNo}</span>
        </p>
        <p>
          <strong>Father:</strong> {student.father}
        </p>
        <p>
          <strong>Class:</strong> {clsLabel}
        </p>
        <p>
          <strong>Date:</strong> {student.payDate || new Date().toISOString().split("T")[0]}
        </p>
        <p>
          <strong>Method:</strong> {student.payMethod || "Cash"}
        </p>
      </div>

      {/* Fee Breakdown Table */}
      <table className="w-full border-collapse border border-slate-300 text-[10px] my-1">
        <thead>
          <tr className="bg-slate-100 text-slate-700">
            <th className="p-1 border border-slate-300 text-left">Description</th>
            <th className="p-1 border border-slate-300 text-right">Amount (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-1 border border-slate-300">Monthly Tuition Fee</td>
            <td className="p-1 border border-slate-300 text-right">
              {Number(student.fee).toLocaleString()}
            </td>
          </tr>
          {Number(student.adj || 0) !== 0 && (
            <tr>
              <td className="p-1 border border-slate-300">Adjustment (Discount / Fine)</td>
              <td className="p-1 border border-slate-300 text-right">
                {Number(student.adj) > 0 ? `+${student.adj}` : student.adj}
              </td>
            </tr>
          )}
          <tr className="font-bold bg-slate-50">
            <td className="p-1 border border-slate-300">Net Payable Fee</td>
            <td className="p-1 border border-slate-300 text-right">
              {netFee.toLocaleString()}
            </td>
          </tr>
          <tr className="font-extrabold text-emerald-800 bg-emerald-50/60">
            <td className="p-1 border border-slate-300">Amount Received</td>
            <td className="p-1 border border-slate-300 text-right">
              {paid.toLocaleString()}
            </td>
          </tr>
          <tr className="font-extrabold text-rose-700 bg-rose-50/60">
            <td className="p-1 border border-slate-300">Remaining Balance</td>
            <td className="p-1 border border-slate-300 text-right">
              {due.toLocaleString()}
            </td>
          </tr>
        </tbody>
      </table>

      {student.payRemarks && (
        <p className="text-[9px] text-slate-500 italic">Remarks: {student.payRemarks}</p>
      )}

      {/* Signatures */}
      <div className="pt-3 flex justify-between items-end text-[9px] text-slate-600">
        <div className="text-center">
          <div className="w-16 sm:w-20 border-b border-slate-400 mx-auto mb-0.5"></div>
          <span>Accountant</span>
        </div>
        <div className="text-center">
          {customSign ? (
            <img src={customSign} alt="Sign" className="h-5 mx-auto object-contain" />
          ) : (
            <div className="text-[10px] text-blue-800 font-serif italic">Rahmatullah</div>
          )}
          <span className="font-bold text-royal-950 uppercase text-[8px]">Principal</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-[760px] bg-white p-2 sm:p-3 rounded-2xl shadow-sm border border-slate-200">
      <div className="flex flex-col sm:flex-row print:!flex-row gap-3 sm:gap-4">
        {renderHalfReceipt("School Copy")}
        <div className="hidden sm:block print:!block border-r border-dashed border-slate-300"></div>
        {renderHalfReceipt("Student / Parent Copy")}
      </div>
    </div>
  );
};

export default TwinFeeReceipt;
