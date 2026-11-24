"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import { SCHOOL_CLASSES, SCHOOL_INFO } from "@/lib/constants";
import {
  formatClassLabel,
  getNameInitials,
  buildWhatsAppURL,
  buildStudentIDCardWhatsAppMsg,
  buildFacultyIDCardWhatsAppMsg,
} from "@/lib/utils";
import { printOrSavePdf } from "@/lib/exportPdf";

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
  const [search, setSearch] = useState("");

  const logoSrc = customLogo || "/logo.png";
  const signSrc = customSign || "/principal-sign.jpg";

  const activeStudents = students.filter((s) => {
    const matchStatus = s.status === "Active";
    const matchClass = !classFilter || s.class === classFilter;
    const q = search.trim().toLowerCase();
    const matchSearch =
      !q ||
      String(s.name || "").toLowerCase().includes(q) ||
      String(s.admNo || "").toLowerCase().includes(q) ||
      String(s.father || "").toLowerCase().includes(q);
    return matchStatus && matchClass && matchSearch;
  });

  const filteredTeachers = teachers.filter((t) => {
    const q = search.trim().toLowerCase();
    return (
      !q ||
      String(t.name || "").toLowerCase().includes(q) ||
      String(t.empId || "").toLowerCase().includes(q) ||
      String(t.role || "").toLowerCase().includes(q)
    );
  });

  const handleSaveBatchPdf = () => {
    const targetCards = document.querySelectorAll(".id-card-content");
    if (!targetCards || targetCards.length === 0) return;

    let html = `<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;padding:16px;">`;
    targetCards.forEach((c) => {
      html += `<div style="width:280px;page-break-inside:avoid;margin-bottom:12px;">${c.innerHTML}</div>`;
    });
    html += `</div>`;

    const filename = `${mode === "student" ? "Student" : "Faculty"}_ID_Cards_${classFilter || "All"}.pdf`;
    printOrSavePdf(html, filename);
  };

  const handlePrintSingleStudent = (s: any) => {
    const el = document.getElementById(`student-card-content-${s.id}`);
    if (!el) return;
    const filename = `ID_Card_Student_${s.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_${s.admNo}.pdf`;
    printOrSavePdf(
      `<div style="display:flex;justify-content:center;align-items:center;min-height:90vh;padding:24px;">
        <div style="width:280px;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          ${el.innerHTML}
        </div>
      </div>`,
      filename
    );
  };

  const handlePrintSingleTeacher = (t: any) => {
    const el = document.getElementById(`teacher-card-content-${t.id}`);
    if (!el) return;
    const filename = `ID_Card_Faculty_${t.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_${t.empId}.pdf`;
    printOrSavePdf(
      `<div style="display:flex;justify-content:center;align-items:center;min-height:90vh;padding:24px;">
        <div style="width:280px;border-radius:16px;overflow:hidden;box-shadow:0 4px 12px rgba(0,0,0,0.15);">
          ${el.innerHTML}
        </div>
      </div>`,
      filename
    );
  };

  return (
    <section className="tab-panel p-4 sm:p-8 space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-wrap justify-between items-center gap-4">
        <div>
          <h3 className="text-lg font-extrabold text-royal-900">
            Student &amp; Faculty ID Card Studio
          </h3>
          <p className="text-xs text-slate-500">
            High-resolution portrait ID badges with photo preview or name initials, circular crest, barcodes &amp; Principal signature.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={mode === "student" ? "Search name, adm #..." : "Search staff name, ID..."}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-royal-500 w-40 sm:w-52"
          />

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
            onClick={handleSaveBatchPdf}
            className="px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Icon name="download" className="w-3.5 h-3.5" />
            <span>Save All as PDF</span>
          </button>

          <button
            type="button"
            onClick={() => onPrintBatch(mode, classFilter)}
            className="px-4 py-2 rounded-xl bg-royal-800 hover:bg-royal-900 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Icon name="print" className="w-3.5 h-3.5" />
            <span>Print All (A4)</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
        {mode === "student" ? (
          activeStudents.length === 0 ? (
            <p className="text-slate-400 col-span-full text-center py-12">
              No students found matching your filters.
            </p>
          ) : (
            activeStudents.map((s) => (
              <div
                key={s.id}
                id={`student-card-${s.id}`}
                className="w-full max-w-[280px] mx-auto bg-white rounded-2xl shadow-md border-2 border-royal-800 overflow-hidden text-center relative flex flex-col justify-between"
              >
                {/* Printable ID Card Body */}
                <div id={`student-card-content-${s.id}`} className="id-card-content flex-1 flex flex-col justify-between">
                  {/* Header */}
                  <div className="bg-gradient-to-r from-royal-950 via-royal-900 to-sky-900 text-white p-3">
                    <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-gold-400 mx-auto mb-1.5 overflow-hidden shadow-sm flex items-center justify-center">
                      <img src={logoSrc} alt="Logo" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <h4 className="text-[11px] font-extrabold tracking-tight truncate">
                      {SCHOOL_INFO.name}
                    </h4>
                    <p className="text-[9px] text-sky-200">EMIS: {SCHOOL_INFO.emis}</p>
                  </div>

                  {/* Body */}
                  <div className="p-3 space-y-2">
                    <div className="w-20 h-20 rounded-2xl mx-auto overflow-hidden border-2 border-royal-300 shadow-inner bg-royal-50 flex items-center justify-center">
                      {s.photo && String(s.photo).trim() ? (
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

                  {/* Footer with Official Signature */}
                  <div className="bg-slate-50 border-t border-slate-200 p-2 flex justify-between items-center text-[10px]">
                    <div className="text-left">
                      <span className="font-mono font-bold text-slate-500">
                        ||| |||| || ||||
                      </span>
                    </div>
                    <div className="text-right">
                      <img
                        src={signSrc}
                        alt="Principal Sign"
                        className="h-7 max-w-[85px] mx-auto object-contain"
                        style={{ mixBlendMode: "multiply" }}
                      />
                      <span className="block text-[8px] text-slate-500 font-bold uppercase">
                        Principal
                      </span>
                    </div>
                  </div>
                </div>

                {/* Individual Card Action Toolbar */}
                <div className="bg-slate-100 border-t border-slate-200 p-2 flex flex-wrap items-center justify-center gap-1.5 no-print">
                  <a
                    href={buildWhatsAppURL(s.phone, buildStudentIDCardWhatsAppMsg(s))}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition"
                    title="Send Student ID Card via WhatsApp"
                  >
                    <Icon name="whatsapp" className="w-3 h-3" />
                    <span>WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => handlePrintSingleStudent(s)}
                    className="px-2.5 py-1 rounded-lg bg-royal-800 hover:bg-royal-900 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition"
                  >
                    <Icon name="print" className="w-3 h-3" />
                    <span>Print</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handlePrintSingleStudent(s)}
                    className="px-2.5 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition"
                  >
                    <Icon name="download" className="w-3 h-3" />
                    <span>PDF</span>
                  </button>
                </div>
              </div>
            ))
          )
        ) : filteredTeachers.length === 0 ? (
          <p className="text-slate-400 col-span-full text-center py-12">
            No faculty records found matching your filters.
          </p>
        ) : (
          filteredTeachers.map((t) => (
            <div
              key={t.id}
              id={`teacher-card-${t.id}`}
              className="w-full max-w-[280px] mx-auto bg-white rounded-2xl shadow-md border-2 border-purple-800 overflow-hidden text-center relative flex flex-col justify-between"
            >
              {/* Printable ID Card Body */}
              <div id={`teacher-card-content-${t.id}`} className="id-card-content flex-1 flex flex-col justify-between">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-900 text-white p-3">
                  <div className="w-12 h-12 rounded-full bg-white p-0.5 border-2 border-gold-400 mx-auto mb-1.5 overflow-hidden shadow-sm flex items-center justify-center">
                    <img src={logoSrc} alt="Logo" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <h4 className="text-[11px] font-extrabold tracking-tight truncate">
                    {SCHOOL_INFO.name}
                  </h4>
                  <p className="text-[9px] text-purple-200">FACULTY &amp; STAFF</p>
                </div>

                {/* Body */}
                <div className="p-3 space-y-2">
                  <div className="w-20 h-20 rounded-2xl mx-auto overflow-hidden border-2 border-purple-300 shadow-inner bg-purple-50 flex items-center justify-center">
                    {t.photo && String(t.photo).trim() ? (
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

                {/* Footer with Official Signature */}
                <div className="bg-slate-50 border-t border-slate-200 p-2 flex justify-between items-center text-[10px]">
                  <div className="text-left font-mono font-bold text-slate-500">||| |||| || ||||</div>
                  <div className="text-right">
                    <img
                      src={signSrc}
                      alt="Principal Sign"
                      className="h-7 max-w-[85px] mx-auto object-contain"
                      style={{ mixBlendMode: "multiply" }}
                    />
                    <span className="block text-[8px] text-slate-500 font-bold uppercase">
                      Principal
                    </span>
                  </div>
                </div>
              </div>

              {/* Individual Card Action Toolbar */}
              <div className="bg-slate-100 border-t border-slate-200 p-2 flex flex-wrap items-center justify-center gap-1.5 no-print">
                <a
                  href={buildWhatsAppURL(t.phone, buildFacultyIDCardWhatsAppMsg(t))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition"
                  title="Send Faculty ID Card via WhatsApp"
                >
                  <Icon name="whatsapp" className="w-3 h-3" />
                  <span>WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => handlePrintSingleTeacher(t)}
                  className="px-2.5 py-1 rounded-lg bg-purple-800 hover:bg-purple-900 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition"
                >
                  <Icon name="print" className="w-3 h-3" />
                  <span>Print</span>
                </button>
                <button
                  type="button"
                  onClick={() => handlePrintSingleTeacher(t)}
                  className="px-2.5 py-1 rounded-lg bg-sky-700 hover:bg-sky-800 text-white text-[10px] font-bold flex items-center gap-1 shadow-sm transition"
                >
                  <Icon name="download" className="w-3 h-3" />
                  <span>PDF</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default IDCardStudioView;
