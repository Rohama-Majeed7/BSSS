"use client";

import React, { useState } from "react";
import { SCHOOL_CLASSES, SCHOOL_INFO } from "@/lib/constants";
import { formatClassLabel, getNameInitials } from "@/lib/utils";

interface IDCardStudioViewProps {
  students: any[];
  teachers: any[];
  onPrintBatch: (mode: "student" | "staff", classFilter?: string) => void;
  customLogo?: string;
  customSign?: string;
}

export const IDCardStudioView: React.FC<IDCardStudioViewProps> = ({
  students,
  teachers,
  onPrintBatch,
  customLogo,
  customSign,
}) => {
  const [mode, setMode] = useState<"student" | "staff">("student");
  const [classFilter, setClassFilter] = useState("");

  const activeStudents = students.filter(
    (s) => s.status === "Active" && (!classFilter || s.class === classFilter)
  );

  return (
    <section className="tab-panel p-4 sm:p-8 space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-royal-900">
            Student &amp; Faculty ID Card Studio
          </h3>
          <p className="text-xs text-slate-500">
            High-resolution portrait ID badges with circular crest, student photo, barcodes &amp; Principal signature.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as "student" | "staff")}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-royal-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
          >
            <option value="student">Student ID Cards</option>
            <option value="staff">Faculty ID Cards</option>
          </select>

          {mode === "student" && (
            <select
              value={classFilter}
              onChange={(e) => setClassFilter(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-royal-500"
            >
              <option value="">All 14 Classes</option>
              {SCHOOL_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {formatClassLabel(c)}
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => onPrintBatch(mode, classFilter)}
            className="px-4 py-2 rounded-xl bg-royal-800 hover:bg-royal-900 text-white font-bold text-xs shadow-md transition"
          >
            Print All Cards (A4)
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {mode === "student" ? (
          activeStudents.length === 0 ? (
            <p className="text-slate-400 col-span-full text-center py-12">
              No students found. Admit active students to generate ID cards.
            </p>
          ) : (
            activeStudents.map((s) => (
              <div
                key={s.id}
                className="w-full max-w-[280px] mx-auto bg-white rounded-2xl shadow-md border-2 border-royal-800 overflow-hidden text-center relative flex flex-col justify-between"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-royal-950 via-royal-900 to-sky-900 text-white p-3">
                  {customLogo && (
                    <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-gold-400 mx-auto mb-1.5 overflow-hidden shadow-sm flex items-center justify-center">
                      <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <h4 className="text-[11px] font-extrabold tracking-tight truncate">
                    {SCHOOL_INFO.name}
                  </h4>
                  <p className="text-[9px] text-sky-200">EMIS: {SCHOOL_INFO.emis}</p>
                </div>

                {/* Body */}
                <div className="p-3 space-y-2">
                  <div className="w-20 h-20 rounded-2xl mx-auto overflow-hidden border-2 border-royal-300 shadow-inner bg-royal-50 flex items-center justify-center">
                    {s.photo ? (
                      <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-xl font-extrabold text-royal-800 tracking-wider">
                        {getNameInitials(s.name)}
                      </span>
                    )}
                  </div>
                  <div>
                    <h5 className="font-extrabold text-royal-950 text-sm leading-tight">
                      {s.name}
                    </h5>
                    <p className="text-xs font-bold text-sky-800 mt-0.5">
                      {formatClassLabel(s.class)}
                    </p>
                  </div>
                  <div className="text-[11px] text-slate-600 space-y-0.5 text-left border-t border-slate-200 pt-2 font-medium">
                    <p>
                      <strong>Adm #:</strong> <span className="font-mono">{s.admNo}</span>
                    </p>
                    <p className="truncate">
                      <strong>Father:</strong> {s.father}
                    </p>
                    <p>
                      <strong>DOB:</strong> {s.dob}
                    </p>
                    <p>
                      <strong>B-Form:</strong> <span className="font-mono">{s.bform}</span>
                    </p>
                    <p>
                      <strong>Emergency:</strong> {s.phone}
                    </p>
                  </div>
                </div>

                {/* Footer with Signature */}
                <div className="bg-slate-50 border-t border-slate-200 p-2 flex justify-between items-center text-[10px]">
                  <div className="text-left">
                    <span className="font-mono font-bold text-slate-500">
                      ||| |||| || ||||
                    </span>
                  </div>
                  <div className="text-right">
                    {customSign ? (
                      <img src={customSign} alt="Sign" className="h-6 mx-auto object-contain" />
                    ) : (
                      <div className="text-[10px] text-blue-800 font-serif italic">
                        Rahmatullah
                      </div>
                    )}
                    <span className="block text-[8px] text-slate-500 font-bold uppercase">
                      Principal
                    </span>
                  </div>
                </div>
              </div>
            ))
          )
        ) : teachers.length === 0 ? (
          <p className="text-slate-400 col-span-full text-center py-12">
            No faculty records available. Add staff members to generate faculty ID cards.
          </p>
        ) : (
          teachers.map((t) => (
            <div
              key={t.id}
              className="w-full max-w-[280px] mx-auto bg-white rounded-2xl shadow-md border-2 border-purple-800 overflow-hidden text-center relative flex flex-col justify-between"
            >
              <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-900 text-white p-3">
                {customLogo && (
                  <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-gold-400 mx-auto mb-1.5 overflow-hidden shadow-sm flex items-center justify-center">
                    <img src={customLogo} alt="Logo" className="w-full h-full object-cover" />
                  </div>
                )}
                <h4 className="text-[11px] font-extrabold tracking-tight truncate">
                  {SCHOOL_INFO.name}
                </h4>
                <p className="text-[9px] text-purple-200">FACULTY &amp; STAFF</p>
              </div>

              <div className="p-3 space-y-2">
                <div className="w-20 h-20 rounded-2xl mx-auto overflow-hidden border-2 border-purple-300 shadow-inner bg-purple-50 flex items-center justify-center">
                  {t.photo ? (
                    <img src={t.photo} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xl font-extrabold text-purple-800 tracking-wider">
                      {getNameInitials(t.name)}
                    </span>
                  )}
                </div>
                <div>
                  <h5 className="font-extrabold text-royal-950 text-sm leading-tight">{t.name}</h5>
                  <p className="text-xs font-bold text-purple-800 mt-0.5">{t.role}</p>
                </div>
                <div className="text-[11px] text-slate-600 space-y-0.5 text-left border-t border-slate-200 pt-2 font-medium">
                  <p>
                    <strong>Emp ID:</strong> <span className="font-mono">{t.empId}</span>
                  </p>
                  <p>
                    <strong>CNIC:</strong> <span className="font-mono">{t.cnic}</span>
                  </p>
                  <p>
                    <strong>Contact:</strong> {t.phone}
                  </p>
                </div>
              </div>

              <div className="bg-slate-50 border-t border-slate-200 p-2 flex justify-between items-center text-[10px]">
                <div className="text-left font-mono font-bold text-slate-500">||| |||| || ||||</div>
                <div className="text-right">
                  {customSign ? (
                    <img src={customSign} alt="Sign" className="h-6 mx-auto object-contain" />
                  ) : (
                    <div className="text-[10px] text-blue-800 font-serif italic">Rahmatullah</div>
                  )}
                  <span className="block text-[8px] text-slate-500 font-bold uppercase">
                    Principal
                  </span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default IDCardStudioView;
