"use client";

import React from "react";
import { SCHOOL_INFO } from "@/lib/constants";

interface TeacherPaySlipProps {
  teacher: any;
  month?: string;
  customLogo?: string;
  customSign?: string;
}

export const TeacherPaySlip: React.FC<TeacherPaySlipProps> = ({
  teacher,
  month = "November 2026",
  customLogo,
  customSign,
}) => {
  if (!teacher) return null;

  const basic = Number(teacher.basic || 0);
  const ded = Number(teacher.deduction || 0);
  const net = Math.max(0, basic - ded);

  return (
    <div className="w-full max-w-[540px] bg-white p-6 rounded-2xl shadow-md border-2 border-purple-900 text-slate-800 text-xs space-y-3 doc-watermark relative">
      {/* Header */}
      <div className="text-center border-b-2 border-purple-900 pb-2">
        <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-gold-400 mx-auto overflow-hidden shadow-sm flex items-center justify-center">
          {customLogo ? (
            <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[9px] font-extrabold text-purple-900">BSS</span>
          )}
        </div>
        <h3 className="font-extrabold text-royal-950 text-sm uppercase mt-1">
          {SCHOOL_INFO.nameUpper}
        </h3>
        <p className="font-urdu text-xs text-gold-600 mt-0.5">{SCHOOL_INFO.urduName}</p>
        <p className="text-[10px] text-slate-500">
          EMIS: {SCHOOL_INFO.emis} • {SCHOOL_INFO.address}
        </p>
        <div className="inline-block px-3 py-0.5 rounded-full bg-purple-900 text-white font-extrabold text-[10px] tracking-wider uppercase mt-1">
          MONTHLY SALARY DISBURSEMENT SLIP — {month}
        </div>
      </div>

      {/* Employee Info */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-b border-slate-200 pb-2 font-medium">
        <p>
          <strong>Employee Name:</strong> {teacher.name}
        </p>
        <p>
          <strong>Staff ID:</strong> <span className="font-mono font-bold">{teacher.empId}</span>
        </p>
        <p>
          <strong>Designation:</strong> {teacher.role}
        </p>
        <p>
          <strong>CNIC:</strong> <span className="font-mono">{teacher.cnic}</span>
        </p>
        <p>
          <strong>Phone:</strong> {teacher.phone}
        </p>
        <p>
          <strong>Attendance:</strong>{" "}
          <span className="font-extrabold text-emerald-800">{teacher.att || "Present"}</span>
        </p>
      </div>

      {/* Salary Breakdown Table */}
      <table className="w-full border-collapse border border-slate-300 text-[11px] my-2">
        <thead>
          <tr className="bg-purple-900 text-white font-extrabold">
            <th className="p-1.5 border border-slate-300 text-left">Salary Component</th>
            <th className="p-1.5 border border-slate-300 text-right">Amount (Rs.)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="p-1.5 border border-slate-300">Basic Monthly Salary</td>
            <td className="p-1.5 border border-slate-300 text-right font-mono">
              Rs. {basic.toLocaleString()}
            </td>
          </tr>
          <tr>
            <td className="p-1.5 border border-slate-300">Deductions (Leaves / Advances)</td>
            <td className="p-1.5 border border-slate-300 text-right font-mono text-rose-600">
              - Rs. {ded.toLocaleString()}
            </td>
          </tr>
        </tbody>
        <tfoot>
          <tr className="bg-purple-50 font-extrabold border-t-2 border-purple-900 text-purple-950">
            <td className="p-2 text-sm">Net Monthly Payable Salary:</td>
            <td className="p-2 text-right font-mono text-base text-emerald-800">
              Rs. {net.toLocaleString()}
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Signatures */}
      <div className="pt-6 flex justify-between items-end text-[10px] text-slate-600">
        <div className="text-center">
          <div className="w-24 border-b border-slate-400 mx-auto mb-1"></div>
          <span className="font-bold">Faculty Signature</span>
        </div>
        <div className="text-center">
          <div className="w-24 border-b border-slate-400 mx-auto mb-1"></div>
          <span className="font-bold">Accounts Officer</span>
        </div>
        <div className="text-center">
          {customSign ? (
            <img src={customSign} alt="Sign" className="h-6 mx-auto object-contain" />
          ) : (
            <div className="text-[10px] text-blue-800 font-serif italic">Rahmatullah Dogar</div>
          )}
          <span className="font-bold text-royal-950 uppercase text-[9px]">Principal</span>
        </div>
      </div>
    </div>
  );
};

export default TeacherPaySlip;
