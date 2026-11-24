"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import PhotoAvatar from "@/components/ui/PhotoAvatar";
import { SCHOOL_CLASSES, SCHOOL_INFO } from "@/lib/constants";
import {
  formatClassLabel,
  buildWhatsAppURL,
  buildStudentIDCardWhatsAppMsg,
  buildFacultyIDCardWhatsAppMsg,
} from "@/lib/utils";
import { printOrSavePdf } from "@/lib/exportPdf";

interface IDCardStudioViewProps {
  students: any[];
  teachers: any[];
  onPrintBatch?: (mode: "student" | "staff", classFilter?: string) => void;
  customLogo?: string;
  customSign?: string;
}

export const IDCardStudioView: React.FC<IDCardStudioViewProps> = ({
  students,
  teachers,
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

  const CARD_PRINT_WIDTH = "360px";

  const wrapCardForPrint = (innerHtml: string, extraStyle = "") =>
    `<div class="id-card-print-bw" style="width:${CARD_PRINT_WIDTH};border:1.5px solid #111827;border-radius:16px;overflow:hidden;background:#ffffff;color:#111827;${extraStyle}">${innerHtml}</div>`;

  const handleSaveBatchPdf = () => {
    const targetCards = document.querySelectorAll(".id-card-content");
    if (!targetCards || targetCards.length === 0) return;

    let html = `<div style="display:flex;flex-wrap:wrap;gap:16px;justify-content:center;padding:16px;background:#ffffff;">`;
    targetCards.forEach((c) => {
      html += wrapCardForPrint(c.innerHTML, "page-break-inside:avoid;margin-bottom:12px;");
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
      `<div style="display:flex;justify-content:center;align-items:center;min-height:90vh;padding:24px;background:#ffffff;">
        ${wrapCardForPrint(el.innerHTML)}
      </div>`,
      filename
    );
  };

  const handlePrintSingleTeacher = (t: any) => {
    const el = document.getElementById(`teacher-card-content-${t.id}`);
    if (!el) return;
    const filename = `ID_Card_Faculty_${t.name.replace(/[^a-zA-Z0-9_-]/g, "_")}_${t.empId}.pdf`;
    printOrSavePdf(
      `<div style="display:flex;justify-content:center;align-items:center;min-height:90vh;padding:24px;background:#ffffff;">
        ${wrapCardForPrint(el.innerHTML)}
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
            onClick={handleSaveBatchPdf}
            className="px-4 py-2 rounded-xl bg-royal-800 hover:bg-royal-900 text-white font-bold text-xs shadow-md transition flex items-center gap-1.5"
          >
            <Icon name="print" className="w-3.5 h-3.5" />
            <span>Print All (A4)</span>
          </button>
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
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
                className="w-full max-w-[360px] mx-auto bg-white rounded-2xl shadow-md border-2 border-royal-800 overflow-hidden relative flex flex-col justify-between"
              >
                {/* Printable ID Card Body */}
                <div id={`student-card-content-${s.id}`} className="id-card-content flex-1 flex flex-col justify-between">
                  {/* Header */}
                  <div className="id-card-header bg-gradient-to-r from-royal-950 via-royal-900 to-sky-900 text-white px-3 py-2 flex items-center gap-2.5 text-left">
                    <div className="id-card-logo-box w-9 h-9 rounded-full bg-white p-0.5 border-2 border-gold-400 flex-shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                      <img src={logoSrc} alt="Logo" className="w-full h-full object-cover rounded-full" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-[11px] font-extrabold tracking-tight truncate leading-tight">
                        {SCHOOL_INFO.name}
                      </h4>
                      <p className="id-card-muted text-[9px] text-sky-200 leading-tight">
                        STUDENT ID CARD • EMIS: {SCHOOL_INFO.emis}
                      </p>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="px-3 py-2.5 flex items-center gap-3 text-left">
                    <div className="id-card-photo-box w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden border-2 border-royal-300 shadow-inner bg-royal-50 flex items-center justify-center">
                      <PhotoAvatar
                        photoUrl={s.photoUrl}
                        photo={s.photo}
                        name={s.name}
                        imgClassName="w-full h-full object-cover"
                        fallbackClassName="text-xl font-extrabold text-royal-800 tracking-wider"
                      />
                    </div>
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="id-card-divider border-b border-slate-200 pb-1">
                        <h5 className="font-extrabold text-royal-950 text-sm leading-tight truncate">
                          {s.name}
                        </h5>
                        <p className="id-card-muted text-[11px] font-bold text-sky-800 leading-tight">
                          {formatClassLabel(s.class)} • <span className="font-mono">Adm #{s.admNo}</span>
                        </p>
                      </div>
                      <div className="id-card-muted text-[10px] text-slate-600 space-y-0.5 font-medium leading-tight">
                        <p className="truncate">
                          <strong>Father:</strong> {s.father}
                        </p>
                        <p className="truncate">
                          <strong>DOB:</strong> {s.dob}
                        </p>
                        <p className="truncate">
                          <strong>B-Form:</strong> <span className="font-mono">{s.bform}</span>
                        </p>
                        <p className="truncate">
                          <strong>Emergency:</strong> {s.phone}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Footer with Official Signature */}
                  <div className="id-card-divider bg-slate-50 border-t border-slate-200 px-3 py-1.5 flex justify-between items-center text-[9px]">
                    <div className="id-card-muted text-left text-slate-500 font-semibold truncate pr-2">
                      {SCHOOL_INFO.address}
                    </div>
                    <div className="text-right flex-shrink-0">
                      <img
                        src={signSrc}
                        alt="Principal Sign"
                        className="h-5 max-w-[75px] ml-auto object-contain"
                        style={{ mixBlendMode: "multiply" }}
                      />
                      <span className="id-card-muted block text-[7.5px] text-slate-500 font-bold uppercase leading-none">
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
              className="w-full max-w-[360px] mx-auto bg-white rounded-2xl shadow-md border-2 border-purple-800 overflow-hidden relative flex flex-col justify-between"
            >
              {/* Printable ID Card Body */}
              <div id={`teacher-card-content-${t.id}`} className="id-card-content flex-1 flex flex-col justify-between">
                {/* Header */}
                <div className="id-card-header bg-gradient-to-r from-purple-950 via-purple-900 to-indigo-900 text-white px-3 py-2 flex items-center gap-2.5 text-left">
                  <div className="id-card-logo-box w-9 h-9 rounded-full bg-white p-0.5 border-2 border-gold-400 flex-shrink-0 overflow-hidden shadow-sm flex items-center justify-center">
                    <img src={logoSrc} alt="Logo" className="w-full h-full object-cover rounded-full" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="text-[11px] font-extrabold tracking-tight truncate leading-tight">
                      {SCHOOL_INFO.name}
                    </h4>
                    <p className="id-card-muted text-[9px] text-purple-200 leading-tight">
                      FACULTY &amp; STAFF • EMIS: {SCHOOL_INFO.emis}
                    </p>
                  </div>
                </div>

                {/* Body */}
                <div className="px-3 py-2.5 flex items-center gap-3 text-left">
                  <div className="id-card-photo-box w-20 h-20 rounded-xl flex-shrink-0 overflow-hidden border-2 border-purple-300 shadow-inner bg-purple-50 flex items-center justify-center">
                    <PhotoAvatar
                      photoUrl={t.photoUrl}
                      photo={t.photo}
                      name={t.name}
                      imgClassName="w-full h-full object-cover"
                      fallbackClassName="text-xl font-extrabold text-purple-800 tracking-wider"
                    />
                  </div>
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="id-card-divider border-b border-slate-200 pb-1">
                      <h5 className="font-extrabold text-royal-950 text-sm leading-tight truncate">
                        {t.name}
                      </h5>
                      <p className="id-card-muted text-[11px] font-bold text-purple-800 leading-tight truncate">
                        {t.role}
                      </p>
                    </div>
                    <div className="id-card-muted text-[10px] text-slate-600 space-y-0.5 font-medium leading-tight">
                      <p>
                        <strong>Emp ID:</strong> <span className="font-mono">{t.empId}</span>
                      </p>
                      <p>
                        <strong>CNIC:</strong> <span className="font-mono">{t.cnic}</span>
                      </p>
                      <p className="truncate">
                        <strong>Contact:</strong> {t.phone}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Footer with Official Signature */}
                <div className="id-card-divider bg-slate-50 border-t border-slate-200 px-3 py-1.5 flex justify-between items-center text-[9px]">
                  <div className="id-card-muted text-left text-slate-500 font-semibold truncate pr-2">
                    {SCHOOL_INFO.address}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <img
                      src={signSrc}
                      alt="Principal Sign"
                      className="h-5 max-w-[75px] ml-auto object-contain"
                      style={{ mixBlendMode: "multiply" }}
                    />
                    <span className="id-card-muted block text-[7.5px] text-slate-500 font-bold uppercase leading-none">
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
