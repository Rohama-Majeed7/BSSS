"use client";

import React, { useState, useEffect } from "react";
import { formatClassLabel, calcExamStats } from "@/lib/utils";

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveResult: (resultData: any) => Promise<void> | void;
  editResult?: any;
  students: any[];
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  onSaveResult,
  editResult,
  students,
}) => {
  const [studentId, setStudentId] = useState<number | "">("");
  const [term, setTerm] = useState("Final Term");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [rank, setRank] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [subjects, setSubjects] = useState<Array<{ name: string; total: number; obtained: number }>>([
    { name: "English", total: 75, obtained: 0 },
    { name: "Urdu", total: 75, obtained: 0 },
    { name: "Mathematics", total: 75, obtained: 0 },
    { name: "Science / Physics", total: 60, obtained: 0 },
    { name: "Islamiat / Pak Studies", total: 100, obtained: 0 },
    { name: "Computer / Bio", total: 60, obtained: 0 },
  ]);

  useEffect(() => {
    if (editResult) {
      setStudentId(editResult.studentId);
      setTerm(editResult.term || "Final Term");
      setDate(editResult.date || new Date().toISOString().split("T")[0]);
      setRank(editResult.rank || "");
      setRemarks(editResult.remarks || "");
      setSubjects(
        editResult.subjects && editResult.subjects.length > 0
          ? editResult.subjects
          : [
              { name: "English", total: 75, obtained: 0 },
              { name: "Urdu", total: 75, obtained: 0 },
              { name: "Mathematics", total: 75, obtained: 0 },
              { name: "Science / Physics", total: 60, obtained: 0 },
            ]
      );
    } else {
      setStudentId(students[0]?.id || "");
      setTerm("Final Term");
      setDate(new Date().toISOString().split("T")[0]);
      setRank("");
      setRemarks("");
      setSubjects([
        { name: "English", total: 75, obtained: 0 },
        { name: "Urdu", total: 75, obtained: 0 },
        { name: "Mathematics", total: 75, obtained: 0 },
        { name: "Science / Physics", total: 60, obtained: 0 },
        { name: "Islamiat / Pak Studies", total: 100, obtained: 0 },
        { name: "Computer / Bio", total: 60, obtained: 0 },
      ]);
    }
    setSubmitError("");
  }, [editResult, isOpen, students]);

  if (!isOpen) return null;

  const handleSubjectChange = (
    index: number,
    field: "name" | "total" | "obtained",
    value: string | number
  ) => {
    const next = [...subjects];
    if (field === "name") {
      next[index].name = String(value);
    } else {
      next[index][field] = Number(value || 0);
    }
    setSubjects(next);
  };

  const handleAddSubject = () => {
    setSubjects([...subjects, { name: "New Subject", total: 75, obtained: 0 }]);
  };

  const handleRemoveSubject = (index: number) => {
    if (subjects.length <= 1) return;
    setSubjects(subjects.filter((_, i) => i !== index));
  };

  const stats = calcExamStats(subjects);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentId || isSubmitting) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await onSaveResult({
        id: editResult?.id,
        studentId: Number(studentId),
        term,
        date,
        rank,
        remarks,
        subjects,
      });
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to save exam result. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-royal-900">
            {editResult ? "Edit Exam Record" : "Enter Student Exam Marks"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none disabled:opacity-40"
          >
            &times;
          </button>
        </div>

        {submitError && (
          <div className="mb-4 px-4 py-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm font-semibold flex items-start gap-2.5">
            <span className="text-rose-500 font-bold text-base leading-none">⚠</span>
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Select Student *</label>
              <select
                required
                value={studentId}
                onChange={(e) => setStudentId(Number(e.target.value))}
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
            <div>
              <label className="block font-bold text-slate-700 mb-1">Exam Term *</label>
              <select
                required
                value={term}
                onChange={(e) => setTerm(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-royal-500"
              >
                <option value="1st Term">1st Term Examination</option>
                <option value="Mid Term">Mid Term Examination</option>
                <option value="Final Term">Final Term Examination</option>
                <option value="Monthly Test">Monthly Assessment Test</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Exam Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Class Position / Rank</label>
              <input
                type="text"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. 1st in Class"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Teacher Remarks</label>
              <input
                type="text"
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="e.g. Outstanding performance!"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
          </div>

          {/* Dynamic Subject Marks */}
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex justify-between items-center">
              <span className="font-extrabold text-royal-900 text-xs">
                Subject-Wise Marks Breakdown
              </span>
              <button
                type="button"
                onClick={handleAddSubject}
                className="px-3 py-1 rounded-lg bg-royal-800 hover:bg-royal-900 text-white font-bold text-xs"
              >
                + Add Subject
              </button>
            </div>

            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {subjects.map((sub, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    required
                    value={sub.name}
                    onChange={(e) => handleSubjectChange(idx, "name", e.target.value)}
                    placeholder="Subject Name"
                    className="flex-1 px-3 py-2 rounded-xl border border-slate-300 text-xs focus:outline-none focus:ring-2 focus:ring-royal-500"
                  />
                  <div className="w-24">
                    <input
                      type="number"
                      required
                      min={1}
                      value={sub.total}
                      onChange={(e) => handleSubjectChange(idx, "total", e.target.value)}
                      placeholder="Total"
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-royal-500"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      required
                      min={0}
                      max={sub.total}
                      value={sub.obtained}
                      onChange={(e) => handleSubjectChange(idx, "obtained", e.target.value)}
                      placeholder="Obt"
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 text-xs text-center font-bold text-royal-900 focus:outline-none focus:ring-2 focus:ring-royal-500"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveSubject(idx)}
                    className="text-rose-500 hover:text-rose-700 px-2 text-base font-bold"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>

            {/* Live Calculation Chips */}
            <div className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-200 text-center font-bold text-xs">
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="block text-[10px] text-slate-500 uppercase">Total Marks</span>
                <span className="text-royal-900 font-extrabold">{stats.total}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="block text-[10px] text-slate-500 uppercase">Obtained</span>
                <span className="text-emerald-700 font-extrabold">{stats.obtained}</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="block text-[10px] text-slate-500 uppercase">Percentage</span>
                <span className="text-sky-700 font-extrabold">{stats.pct}%</span>
              </div>
              <div className="p-2 rounded-xl bg-white border border-slate-200">
                <span className="block text-[10px] text-slate-500 uppercase">Grade &amp; Result</span>
                <span
                  className={`font-extrabold ${
                    stats.status === "Passed" ? "text-emerald-700" : "text-rose-600"
                  }`}
                >
                  {stats.grade} ({stats.status})
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 rounded-xl bg-gold-400 hover:bg-gold-300 text-royal-950 font-extrabold shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <svg className="animate-spin w-4 h-4 text-royal-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isSubmitting ? "Saving Marks…" : "Save Exam Result"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResultModal;
