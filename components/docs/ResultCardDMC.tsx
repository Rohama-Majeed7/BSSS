"use client";

import React from "react";
import { SCHOOL_INFO } from "@/lib/constants";
import { formatClassLabel, calcExamStats } from "@/lib/utils";

interface ResultCardDMCProps {
  result: any;
  student: any;
  customLogo?: string;
  customSign?: string;
}

export const ResultCardDMC: React.FC<ResultCardDMCProps> = ({
  result,
  student,
  customLogo,
  customSign,
}) => {
  if (!result || !student) return null;

  const stats = calcExamStats(result.subjects);
  const clsLabel = formatClassLabel(student.class);

  return (
    <div className="w-full max-w-[640px] bg-white p-6 rounded-2xl shadow-md border-2 border-royal-900 text-slate-800 text-xs space-y-3 doc-watermark relative">
      {/* Header */}
      <div className="text-center border-b-2 border-royal-900 pb-2">
        <div className="w-14 h-14 rounded-full bg-white p-0.5 border-2 border-gold-400 mx-auto overflow-hidden shadow-sm flex items-center justify-center">
          {customLogo ? (
            <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-[9px] font-extrabold text-royal-900">BSS</span>
          )}
        </div>
        <h3 className="font-extrabold text-royal-950 text-sm uppercase mt-1">
          {SCHOOL_INFO.nameUpper}
        </h3>
        <p className="font-urdu text-xs text-gold-600 mt-0.5">{SCHOOL_INFO.urduName}</p>
        <p className="text-[10px] text-slate-500">
          EMIS: {SCHOOL_INFO.emis} • {SCHOOL_INFO.address}
        </p>
        <div className="inline-block px-3 py-0.5 rounded-full bg-royal-900 text-gold-300 font-extrabold text-[10px] tracking-wider uppercase mt-1">
          DETAILED MARKS CERTIFICATE (DMC) — {result.term}
        </div>
      </div>

      {/* Student Details Grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-[11px] border-b border-slate-200 pb-2 font-medium">
        <p>
          <strong>Student Name:</strong> {student.name}
        </p>
        <p>
          <strong>Admission No:</strong> <span className="font-mono font-bold">{student.admNo}</span>
        </p>
        <p>
          <strong>Father Name:</strong> {student.father}
        </p>
        <p>
          <strong>Class:</strong> {clsLabel}
        </p>
        <p>
          <strong>Exam Date:</strong> {result.date}
        </p>
        <p>
          <strong>Class Position:</strong>{" "}
          <strong className="text-amber-800">{result.rank || "—"}</strong>
        </p>
      </div>

      {/* Subject Marks Table */}
      <table className="w-full border-collapse border border-slate-300 text-[11px] my-2">
        <thead>
          <tr className="bg-royal-900 text-white font-extrabold">
            <th className="p-1.5 border border-slate-300 text-left">Subject</th>
            <th className="p-1.5 border border-slate-300 text-center">Total Marks</th>
            <th className="p-1.5 border border-slate-300 text-center">Passing Marks (33%)</th>
            <th className="p-1.5 border border-slate-300 text-center">Marks Obtained</th>
            <th className="p-1.5 border border-slate-300 text-center">Status</th>
          </tr>
        </thead>
        <tbody>
          {(result.subjects || []).map((sub: any, i: number) => {
            const isPass = (sub.obtained / sub.total) * 100 >= 33;
            return (
              <tr key={i} className="hover:bg-slate-50 border-b border-slate-200">
                <td className="p-1.5 font-bold">{sub.name}</td>
                <td className="p-1.5 text-center font-mono">{sub.total}</td>
                <td className="p-1.5 text-center font-mono text-slate-500">
                  {Math.round(sub.total * 0.33)}
                </td>
                <td className="p-1.5 text-center font-mono font-extrabold text-royal-900">
                  {sub.obtained}
                </td>
                <td className="p-1.5 text-center">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold ${
                      isPass ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {isPass ? "Pass" : "Fail"}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr className="bg-slate-100 font-extrabold border-t-2 border-slate-300">
            <td className="p-2">Grand Total:</td>
            <td className="p-2 text-center font-mono">{stats.total}</td>
            <td className="p-2 text-center font-mono">—</td>
            <td className="p-2 text-center font-mono text-emerald-800 text-sm">
              {stats.obtained}
            </td>
            <td className="p-2 text-center">
              <span
                className={`px-2.5 py-0.5 rounded-full font-extrabold text-[10px] ${
                  stats.status === "Passed"
                    ? "bg-emerald-100 text-emerald-800"
                    : "bg-rose-100 text-rose-800"
                }`}
              >
                {stats.status}
              </span>
            </td>
          </tr>
        </tfoot>
      </table>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-3 gap-2 text-center font-bold text-[11px] p-2 bg-royal-50 rounded-xl border border-royal-200">
        <div>
          <span className="block text-[9px] text-slate-500 uppercase">Percentage</span>
          <span className="text-sky-800 font-extrabold text-sm">{stats.pct}%</span>
        </div>
        <div>
          <span className="block text-[9px] text-slate-500 uppercase">Grade</span>
          <span className="text-royal-900 font-extrabold text-sm">Grade {stats.grade}</span>
        </div>
        <div>
          <span className="block text-[9px] text-slate-500 uppercase">Final Result</span>
          <span
            className={`font-extrabold text-sm ${
              stats.status === "Passed" ? "text-emerald-700" : "text-rose-600"
            }`}
          >
            {stats.status}
          </span>
        </div>
      </div>

      {result.remarks && (
        <p className="text-[10px] text-slate-600 italic">Teacher Remarks: &quot;{result.remarks}&quot;</p>
      )}

      {/* Signatures */}
      <div className="pt-6 flex justify-between items-end text-[10px] text-slate-600">
        <div className="text-center">
          <div className="w-24 border-b border-slate-400 mx-auto mb-1"></div>
          <span className="font-bold">Class Teacher</span>
        </div>
        <div className="text-center">
          <div className="w-24 border-b border-slate-400 mx-auto mb-1"></div>
          <span className="font-bold">Controller of Exams</span>
        </div>
        <div className="text-center">
          {customSign ? (
            <img src={customSign} alt="Sign" className="h-6 mx-auto object-contain" />
          ) : (
            <div className="text-[10px] text-blue-800 font-serif italic">Rahmatullah Dogar</div>
          )}
          <span className="font-bold text-royal-950 uppercase text-[9px]">Principal (Seal)</span>
        </div>
      </div>
    </div>
  );
};

export default ResultCardDMC;
