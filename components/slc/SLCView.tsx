"use client";

import React, { useState, useEffect } from "react";
import { SCHOOL_CLASSES, SCHOOL_INFO } from "@/lib/constants";
import { formatClassLabel } from "@/lib/utils";

interface SLCViewProps {
  students: any[];
  onSaveSLC: (studentId: number, slcData: any) => void;
  onPrintSLC: (student: any, extra: any) => void;
  onShowToast: (msg: string) => void;
  customLogo?: string;
  customSign?: string;
}

export const SLCView: React.FC<SLCViewProps> = ({
  students,
  onSaveSLC,
  onPrintSLC,
  onShowToast,
  customLogo,
  customSign,
}) => {
  const [selectedStuId, setSelectedStuId] = useState<number | "">("");
  const [admClass, setAdmClass] = useState("");
  const [leaveClass, setLeaveClass] = useState("");
  const [leaveDate, setLeaveDate] = useState(new Date().toISOString().split("T")[0]);
  const [conduct, setConduct] = useState("Excellent");
  const [reasonPreset, setReasonPreset] = useState("Family Relocation to Another City");
  const [reason, setReason] = useState("Family Relocation to Another City");
  const [markLeft, setMarkLeft] = useState(true);

  const selectedStudent = students.find((s) => s.id === Number(selectedStuId));

  useEffect(() => {
    if (selectedStudent) {
      setAdmClass(selectedStudent.admClass || selectedStudent.class);
      setLeaveClass(selectedStudent.leaveClass || selectedStudent.class);
      if (selectedStudent.leaveDate) setLeaveDate(selectedStudent.leaveDate);
      if (selectedStudent.conduct) setConduct(selectedStudent.conduct);
      if (selectedStudent.leaveReason) {
        setReason(selectedStudent.leaveReason);
        setReasonPreset(selectedStudent.leaveReason);
      }
    }
  }, [selectedStudent]);

  const handlePresetChange = (preset: string) => {
    setReasonPreset(preset);
    if (preset !== "Other (Type Below)") {
      setReason(preset);
    }
  };

  const handleSave = () => {
    if (!selectedStudent) {
      onShowToast("Please select a student first.");
      return;
    }
    const slcData = {
      admClass,
      leaveClass,
      leaveDate,
      conduct,
      leaveReason: reason,
      markLeft,
    };
    onSaveSLC(selectedStudent.id, slcData);
    onShowToast(`SLC saved for ${selectedStudent.name}.`);
  };

  const handlePrint = () => {
    if (!selectedStudent) {
      onShowToast("Please select a student first.");
      return;
    }
    onPrintSLC(selectedStudent, {
      admClass,
      leaveClass,
      leaveDate,
      conduct,
      reason,
    });
  };

  return (
    <section className="tab-panel p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-royal-900">
            School Leaving Certificate (SLC) Generator
          </h3>
          <p className="text-xs text-slate-500">
            Generate official A4 School Leaving &amp; Character Certificates with admission and withdrawal history.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-royal-800 hover:bg-royal-900 text-white font-bold text-xs shadow-md transition"
          >
            Save SLC to Record
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-royal-950 font-extrabold text-xs shadow-md transition"
          >
            Print Official SLC (A4)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-200 space-y-4 text-xs sm:text-sm">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Select Student *</label>
            <select
              value={selectedStuId}
              onChange={(e) => setSelectedStuId(e.target.value ? Number(e.target.value) : "")}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-royal-500"
            >
              <option value="">-- Choose Student --</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({formatClassLabel(s.class)}, Adm #{s.admNo})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Class Admitted *</label>
              <select
                value={admClass}
                onChange={(e) => setAdmClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-royal-500"
              >
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {formatClassLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Class Left *</label>
              <select
                value={leaveClass}
                onChange={(e) => setLeaveClass(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-royal-500"
              >
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {formatClassLabel(c)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Withdrawal Date *</label>
              <input
                type="date"
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">General Conduct *</label>
              <select
                value={conduct}
                onChange={(e) => setConduct(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs focus:outline-none focus:ring-2 focus:ring-royal-500"
              >
                <option value="Excellent">Excellent</option>
                <option value="Very Good">Very Good</option>
                <option value="Good">Good</option>
                <option value="Satisfactory">Satisfactory</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Reason for Leaving *</label>
            <select
              value={reasonPreset}
              onChange={(e) => handlePresetChange(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs mb-2 focus:outline-none focus:ring-2 focus:ring-royal-500"
            >
              <option value="Family Relocation to Another City">Family Relocation to Another City</option>
              <option value="Course of Study Completed">Course of Study Completed</option>
              <option value="Admission into Higher College / Institution">Admission into Higher College / Institution</option>
              <option value="Domestic / Private Reasons">Domestic / Private Reasons</option>
              <option value="Other (Type Below)">Other (Type Below)</option>
            </select>
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="e.g. Relocating with parents"
              className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-royal-500"
            />
          </div>

          <div className="pt-2">
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={markLeft}
                onChange={(e) => setMarkLeft(e.target.checked)}
                className="rounded border-slate-300 text-royal-600 focus:ring-royal-500 w-4 h-4"
              />
              <span className="text-xs font-bold text-slate-700">
                Mark Student Status as &quot;Left / Withdrawn&quot;
              </span>
            </label>
          </div>
        </div>

        {/* Right Live Preview */}
        <div className="lg:col-span-2 bg-slate-50 rounded-3xl p-4 sm:p-6 border border-slate-200 overflow-x-auto flex justify-center">
          {selectedStudent ? (
            <div className="w-full max-w-[620px] bg-white p-5 sm:p-8 rounded-2xl shadow-lg border-2 border-royal-900 text-slate-900 text-xs relative space-y-4 doc-watermark min-w-[320px]">
              {/* Header */}
              <div className="text-center border-b-2 border-royal-900 pb-3">
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white p-0.5 border-2 border-gold-400 mx-auto overflow-hidden shadow-sm flex items-center justify-center">
                  <img src={customLogo || "/logo.png"} alt="Logo" className="w-full h-full object-cover" />
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-royal-950 uppercase mt-1">
                  {SCHOOL_INFO.nameUpper}
                </h3>
                <p className="font-urdu text-xs text-gold-600 mt-0.5">{SCHOOL_INFO.urduName}</p>
                <p className="text-[10px] sm:text-[11px] text-slate-600 mt-0.5">
                  EMIS Code: {SCHOOL_INFO.emis} • {SCHOOL_INFO.address}
                </p>
                <div className="inline-block px-3 sm:px-4 py-1 rounded-full bg-royal-900 text-gold-300 font-extrabold text-[11px] sm:text-xs tracking-wider uppercase mt-2">
                  SCHOOL LEAVING &amp; CHARACTER CERTIFICATE
                </div>
              </div>

              {/* Certificate Body */}
              <div className="space-y-3 leading-relaxed text-[11px] sm:text-xs">
                <div className="flex justify-between items-center text-xs">
                  <span>Certificate No: <strong className="font-mono">SLC-2026-{selectedStudent.id}</strong></span>
                  <span>Date of Issue: <strong>{leaveDate}</strong></span>
                </div>
                <p>
                  This is to certify that <strong>{selectedStudent.name}</strong>, Son/Daughter of{" "}
                  <strong>{selectedStudent.father}</strong> (Father CNIC:{" "}
                  <span className="font-mono">{selectedStudent.fatherCnic || "N/A"}</span>), was a bona
                  fide student of this institution.
                </p>
                <table className="w-full border-collapse border border-slate-300 text-[10px] sm:text-[11px] my-3">
                  <tbody>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50 w-1/3">Admission Number</td>
                      <td className="p-2 font-mono font-bold">{selectedStudent.admNo}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">Date of Birth (in Records)</td>
                      <td className="p-2"><strong>{selectedStudent.dob}</strong></td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">Student B-Form / CNIC</td>
                      <td className="p-2 font-mono">{selectedStudent.bform}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">Class to which Admitted</td>
                      <td className="p-2 font-bold">{formatClassLabel(admClass)}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">Date of Admission</td>
                      <td className="p-2">{selectedStudent.admDate || "—"}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">Class from which Withdrawn</td>
                      <td className="p-2 font-bold">{formatClassLabel(leaveClass)}</td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">Date of Leaving School</td>
                      <td className="p-2"><strong>{leaveDate}</strong></td>
                    </tr>
                    <tr className="border-b border-slate-200">
                      <td className="p-2 font-bold bg-slate-50">General Conduct</td>
                      <td className="p-2 font-bold text-emerald-800">{conduct}</td>
                    </tr>
                    <tr>
                      <td className="p-2 font-bold bg-slate-50">Reason for Leaving</td>
                      <td className="p-2">{reason}</td>
                    </tr>
                  </tbody>
                </table>
                <p className="text-[10px] sm:text-[11px] text-slate-600 italic">
                  All school dues have been cleared up to the date of leaving. We wish him/her success
                  in future academic pursuits.
                </p>
              </div>

              {/* Signatures */}
              <div className="pt-6 sm:pt-8 flex justify-between items-end border-t border-slate-200 text-center text-[10px] sm:text-xs">
                <div>
                  <div className="w-20 sm:w-28 border-b border-slate-400 mx-auto mb-1"></div>
                  <span className="font-bold text-slate-700">Class Incharge</span>
                </div>
                <div>
                  <div className="w-20 sm:w-28 border-b border-slate-400 mx-auto mb-1"></div>
                  <span className="font-bold text-slate-700">Office Clerk</span>
                </div>
                <div>
                  <img
                    src={customSign || "/principal-sign.jpg"}
                    alt="Principal Sign"
                    className="h-7 sm:h-9 max-w-[110px] mx-auto object-contain"
                    style={{ mixBlendMode: "multiply" }}
                  />
                  <span className="font-bold text-royal-950 uppercase text-[9px] sm:text-[10px]">
                    Principal (Seal &amp; Sign)
                  </span>
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
