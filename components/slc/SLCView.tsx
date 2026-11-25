"use client";

import React, { useState, useEffect, useRef } from "react";
import { SCHOOL_CLASSES, SCHOOL_INFO } from "@/lib/constants";
import { formatClassLabel, formatCNIC } from "@/lib/utils";
import { printOrSavePdf } from "@/lib/exportPdf";

const REASON_PRESETS = [
  { label: "School Change", value: "School Change" },
  { label: "Relocation / Family Shifting", value: "Relocation / Family Shifting" },
  {
    label: "Completed Session",
    value: "Completed Academic Session / Passed Examination",
  },
  { label: "Personal Reasons", value: "Personal / Domestic Reasons" },
];

interface SLCViewProps {
  students: any[];
  initialStudentId?: number | null;
  initialSelectKey?: number;
  onSaveSLC: (studentId: number, slcData: any) => Promise<void> | void;
  onPrintSLC?: (student: any, extra: any) => void;
  onShowToast: (msg: string, type?: "success" | "error" | "warning" | "info") => void;
  customLogo?: string;
  customSign?: string;
}

export const SLCView: React.FC<SLCViewProps> = ({
  students,
  initialStudentId,
  initialSelectKey,
  onSaveSLC,
  onShowToast,
  customLogo,
  customSign,
}) => {
  const [selectedStuId, setSelectedStuId] = useState<number | "">("");
  const [admClass, setAdmClass] = useState("Nursery");
  const [leaveClass, setLeaveClass] = useState("Nursery");
  const [leaveDate, setLeaveDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [conduct, setConduct] = useState("Excellent");
  const [reasonPreset, setReasonPreset] = useState("School Change");
  const [reason, setReason] = useState("School Change");
  const [markLeft, setMarkLeft] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const previewCardRef = useRef<HTMLDivElement>(null);
  const lastAppliedKeyRef = useRef<string>("");

  const logoSrc = customLogo || "/logo.png";
  const signSrc = customSign || "/principal-sign.jpg";

  // Select requested student once per navigation trigger, or default to the first student
  useEffect(() => {
    const triggerKey = `${initialStudentId ?? ""}:${initialSelectKey ?? 0}`;
    if (
      initialStudentId &&
      lastAppliedKeyRef.current !== triggerKey &&
      students.some((s) => s.id === initialStudentId)
    ) {
      lastAppliedKeyRef.current = triggerKey;
      setSelectedStuId(initialStudentId);
      return;
    }

    if (
      (!selectedStuId || !students.some((s) => s.id === Number(selectedStuId))) &&
      students.length > 0
    ) {
      setSelectedStuId(students[0].id);
    }
  }, [initialStudentId, initialSelectKey, students, selectedStuId]);

  const selectedStudent = students.find((s) => s.id === Number(selectedStuId));

  // Sync form fields whenever the selected student changes
  useEffect(() => {
    if (!selectedStudent) return;
    setAdmClass(selectedStudent.admClass || selectedStudent.class || "Nursery");
    setLeaveClass(selectedStudent.leaveClass || selectedStudent.class || "Nursery");
    setLeaveDate(
      selectedStudent.leaveDate || new Date().toISOString().split("T")[0]
    );
    setConduct(selectedStudent.conduct || "Excellent");
    const reasonVal = selectedStudent.leaveReason || "School Change";
    setReason(reasonVal);
    const matchingPreset = REASON_PRESETS.find((p) => p.value === reasonVal);
    if (matchingPreset) {
      setReasonPreset(matchingPreset.value);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedStudent?.id]);

  const handlePresetChange = (presetVal: string) => {
    setReasonPreset(presetVal);
    setReason(presetVal);
  };

  const handleSave = async () => {
    if (!selectedStudent) {
      onShowToast("Please select a student first.", "warning");
      return;
    }
    if (isSaving) return;
    setIsSaving(true);
    try {
      await onSaveSLC(selectedStudent.id, {
        admClass,
        leaveClass,
        leaveDate,
        conduct,
        leaveReason: reason.trim() || "School Change",
        markLeft,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrint = () => {
    if (!selectedStudent || !previewCardRef.current) {
      onShowToast("Please select a student first.", "warning");
      return;
    }
    const cleanName = String(selectedStudent.name || "Student").replace(
      /[^a-zA-Z0-9_-]/g,
      "_"
    );
    const filename = `SLC_${cleanName}_${selectedStudent.admNo}.pdf`;
    printOrSavePdf(
      `<div style="display:flex;justify-content:center;padding-top:10px;">${previewCardRef.current.outerHTML}</div>`,
      filename
    );
  };

  const slcNo = selectedStudent
    ? `BS-SLC-2026-${100 + (Number(selectedStudent.id) % 899)}`
    : "";

  const displayBform = selectedStudent?.bform
    ? /^\d/.test(String(selectedStudent.bform))
      ? formatCNIC(selectedStudent.bform)
      : selectedStudent.bform
    : "—";

  return (
    <section className="tab-panel p-4 sm:p-8 space-y-6">
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-200 space-y-6">
        {/* Header */}
        <div className="pb-4 border-b border-slate-200">
          <h3 className="text-lg font-extrabold text-royal-900">
            School Leaving Certificate (SLC) Generator
          </h3>
          <p className="text-xs text-slate-500">
            Select a student, customize Admission Class, Leaving Class, Leaving Date, Conduct &amp; Reason (defaults to &quot;School Change&quot;), save to record, and print official A4 SLC.
          </p>
        </div>

        {/* 3-Column Form Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Select Student *
            </label>
            <select
              value={selectedStuId}
              onChange={(e) =>
                setSelectedStuId(e.target.value ? Number(e.target.value) : "")
              }
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-royal-900 outline-none focus:ring-2 focus:ring-royal-500"
            >
              {students.length === 0 ? (
                <option value="">-- No Students Available --</option>
              ) : (
                students.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} — {formatClassLabel(s.class)} (Adm #{s.admNo})
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Admission Class
            </label>
            <select
              value={admClass}
              onChange={(e) => setAdmClass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-royal-500"
            >
              {SCHOOL_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {formatClassLabel(c)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Leaving Class
            </label>
            <select
              value={leaveClass}
              onChange={(e) => setLeaveClass(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-royal-500"
            >
              {SCHOOL_CLASSES.map((c) => (
                <option key={c} value={c}>
                  {formatClassLabel(c)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Leaving Date
            </label>
            <input
              type="date"
              value={leaveDate}
              onChange={(e) => setLeaveDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-royal-500"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">
              Conduct &amp; Character
            </label>
            <select
              value={conduct}
              onChange={(e) => setConduct(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-royal-500"
            >
              <option value="Excellent">Excellent</option>
              {conduct === "Very Good" && (
                <option value="Very Good">Very Good</option>
              )}
              <option value="Good">Good</option>
              <option value="Satisfactory">Satisfactory</option>
            </select>
          </div>

          <div>
            <div className="flex justify-between items-center gap-2 mb-1">
              <label className="font-bold text-slate-700">
                Reason for Leaving
              </label>
              <select
                value={reasonPreset}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="px-2 py-0.5 rounded-lg border border-slate-300 bg-white text-[11px] font-bold text-royal-900 outline-none"
              >
                {REASON_PRESETS.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </select>
            </div>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="School Change"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white outline-none focus:ring-2 focus:ring-royal-500"
            />
          </div>
        </div>

        {/* Amber Action Bar */}
        <div className="flex flex-wrap justify-between items-center gap-3 bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200">
          <label className="inline-flex items-center gap-2 text-xs font-bold text-amber-950 cursor-pointer">
            <input
              type="checkbox"
              checked={markLeft}
              onChange={(e) => setMarkLeft(e.target.checked)}
              className="rounded text-royal-800 focus:ring-royal-500"
            />
            <span>Mark student status as &quot;Left&quot; when saving SLC record</span>
          </label>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !selectedStudent}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-sm transition disabled:opacity-50"
            >
              {isSaving ? "Saving..." : "Save SLC to Record"}
            </button>
            <button
              type="button"
              onClick={handlePrint}
              disabled={!selectedStudent}
              className="px-5 py-2.5 rounded-xl bg-royal-800 hover:bg-royal-900 text-white font-bold text-xs sm:text-sm shadow-md transition disabled:opacity-50"
            >
              Print Official SLC (A4)
            </button>
          </div>
        </div>

        {/* Centered Live Certificate Preview */}
        <div className="flex justify-center pt-2">
          {selectedStudent ? (
            <div
              ref={previewCardRef}
              className="w-full max-w-2xl border-4 border-double border-royal-900 rounded-3xl p-6 sm:p-8 bg-white doc-watermark"
            >
              <img
                src={logoSrc}
                alt="Watermark"
                className="doc-watermark-bg rounded-full object-contain"
                style={{ width: "240px", height: "240px" }}
              />
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-4 pb-4 border-b-2 border-royal-800 text-center">
                  <div className="w-16 h-16 rounded-full bg-white border-2 border-gold-400 p-0.5 overflow-hidden flex-shrink-0 flex items-center justify-center">
                    <img
                      src={logoSrc}
                      alt="School Crest"
                      className="w-full h-full object-cover rounded-full"
                    />
                  </div>
                  <div>
                    <h4 className="text-lg sm:text-xl font-extrabold text-royal-900">
                      {SCHOOL_INFO.nameUpper}
                    </h4>
                    <p className="text-xs text-slate-600 font-semibold">
                      {SCHOOL_INFO.address} • EMIS: {SCHOOL_INFO.emis}
                    </p>
                    <p className="font-urdu text-xs text-royal-800 mt-0.5">
                      {SCHOOL_INFO.urduName}، مظفرگڑھ
                    </p>
                  </div>
                </div>

                <div className="text-center my-4">
                  <span className="px-4 py-1.5 rounded-lg bg-royal-900 text-gold-400 font-extrabold text-xs uppercase tracking-widest">
                    School Leaving Certificate
                  </span>
                </div>

                <div className="flex flex-wrap justify-between gap-2 text-xs font-mono text-slate-600 mb-4 pb-2 border-b border-slate-200">
                  <span>
                    Certificate No:{" "}
                    <strong className="text-royal-900">{slcNo}</strong>
                  </span>
                  <span>
                    Admission No:{" "}
                    <strong className="text-royal-900">
                      {selectedStudent.admNo}
                    </strong>
                  </span>
                  <span>
                    Date of Leaving:{" "}
                    <strong className="text-royal-900">{leaveDate}</strong>
                  </span>
                </div>

                <div className="space-y-3.5 text-xs sm:text-sm text-slate-800 leading-relaxed">
                  <p>
                    This is to certify that{" "}
                    <strong className="text-royal-900 underline">
                      {selectedStudent.name}
                    </strong>
                    , son/daughter of{" "}
                    <strong className="text-royal-900 underline">
                      {selectedStudent.father}
                    </strong>
                    , bearing Student B-Form / CNIC No.{" "}
                    <strong className="font-mono text-royal-900">
                      {displayBform}
                    </strong>
                    , has been a regular and bonafide student of{" "}
                    <strong>
                      {SCHOOL_INFO.name} (EMIS: {SCHOOL_INFO.emis})
                    </strong>
                    .
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50/90 p-4 rounded-xl border border-slate-200 text-xs">
                    <div>
                      <span className="text-slate-500 block">
                        Date of Birth:
                      </span>
                      <strong className="text-royal-900">
                        {selectedStudent.dob || "—"}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">
                        Admission Class:
                      </span>
                      <strong className="text-royal-900">
                        {formatClassLabel(admClass)}
                      </strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">
                        Leaving Class:
                      </span>
                      <strong className="text-royal-900">
                        {formatClassLabel(leaveClass)}
                      </strong>
                    </div>
                  </div>

                  <p>
                    <strong>Reason for Leaving:</strong>{" "}
                    {reason.trim() || "School Change"}. All school dues have
                    been cleared up to date. During their stay at this
                    institution, their character and conduct remained{" "}
                    <strong className="text-emerald-700">{conduct}</strong>.
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-300 flex justify-between items-end text-xs font-bold text-slate-700">
                  <div>
                    <span className="border-t border-slate-400 pt-1 px-3 inline-block">
                      Admission Incharge
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="w-32 h-11 mx-auto flex items-center justify-center overflow-hidden">
                      <img
                        src={signSrc}
                        alt="Principal Signature"
                        className="max-h-full max-w-full object-contain"
                        style={{ mixBlendMode: "multiply" }}
                      />
                    </div>
                    <span className="border-t border-slate-400 pt-1 px-4 inline-block text-royal-900">
                      Principal Signature &amp; Official Stamp
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center text-slate-400">
              Select a student from the dropdown to preview and print the official School Leaving Certificate.
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default SLCView;
