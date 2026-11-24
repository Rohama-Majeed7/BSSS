"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import ActionsDropdown from "@/components/ui/ActionsDropdown";
import { SCHOOL_CLASSES, SCHOOL_INFO } from "@/lib/constants";
import { formatClassLabel, calcExamStats, buildWhatsAppURL, getNameInitials, buildResultCardWhatsAppMsg } from "@/lib/utils";

interface ExamsViewProps {
  examResults: any[];
  students: any[];
  onOpenResultModal: (editResult?: any) => void;
  onViewDMC: (result: any) => void;
  onDeleteResult: (id: number) => void;
  onPrintGazette: () => void;
}

export const ExamsView: React.FC<ExamsViewProps> = ({
  examResults,
  students,
  onOpenResultModal,
  onViewDMC,
  onDeleteResult,
  onPrintGazette,
}) => {
  const [classFilter, setClassFilter] = useState("");
  const [termFilter, setTermFilter] = useState("");

  const filteredResults = examResults.filter((r) => {
    const s = students.find((st) => String(st.id) === String(r.studentId));
    if (!s) return false;
    if (classFilter && s.class !== classFilter) return false;
    if (termFilter && r.term !== termFilter) return false;
    return true;
  });

  const getAvatarHTML = (photo: string | undefined | null, name: string) => {
    if (photo && String(photo).trim() && (photo.startsWith("http") || photo.startsWith("data:") || photo.startsWith("/"))) {
      return (
        <img
          src={photo}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-royal-200 shadow-sm flex-shrink-0"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-royal-100 text-royal-800 border border-royal-200 font-extrabold flex items-center justify-center text-xs tracking-wider shadow-sm flex-shrink-0">
        {getNameInitials(name)}
      </div>
    );
  };

  return (
    <section className="tab-panel p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-royal-900">
            Exams &amp; Printable Result Cards (DMC)
          </h3>
          <p className="text-xs text-slate-500">
            Term results, percentage, grades, class positions &amp; Detailed Marks Certificates.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-royal-500 flex-1 sm:flex-none"
          >
            <option value="">All 14 Classes</option>
            {SCHOOL_CLASSES.map((c) => (
              <option key={c} value={c}>
                {formatClassLabel(c)}
              </option>
            ))}
          </select>
          <select
            value={termFilter}
            onChange={(e) => setTermFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-royal-500 flex-1 sm:flex-none"
          >
            <option value="">All Exam Terms</option>
            <option value="1st Term">1st Term</option>
            <option value="Mid Term">Mid Term</option>
            <option value="Final Term">Final Term</option>
            <option value="Monthly Test">Monthly Test</option>
          </select>
          <button
            type="button"
            onClick={onPrintGazette}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition whitespace-nowrap"
          >
            Print Gazette
          </button>
          <button
            type="button"
            onClick={() => onOpenResultModal(null)}
            className="px-4 py-2 rounded-xl bg-gold-400 hover:bg-gold-300 text-royal-950 font-extrabold text-xs shadow-md transition whitespace-nowrap touch-manipulation"
          >
            + Enter Exam Marks
          </button>
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[380px] max-h-[calc(100vh-270px)] sm:max-h-[calc(100vh-290px)]">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-xs">
              <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                <th className="p-3 font-bold bg-slate-50">Student Name &amp; Adm No</th>
                <th className="p-3 font-bold bg-slate-50">Class</th>
                <th className="p-3 font-bold bg-slate-50">Term &amp; Date</th>
                <th className="p-3 font-bold bg-slate-50 text-center">Marks &amp; %</th>
                <th className="p-3 font-bold bg-slate-50 text-center">Grade &amp; Rank</th>
                <th className="p-3 font-bold bg-slate-50 text-center">Status</th>
                <th className="p-3 font-bold bg-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredResults.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    {examResults.length === 0
                      ? "No exam records available. Click '+ Enter Exam Marks' to add."
                      : "No exam records found matching your filter criteria."}
                  </td>
                </tr>
              ) : (
                filteredResults.map((r) => {
                  const s = students.find((st) => String(st.id) === String(r.studentId));
                  if (!s) return null;
                  const stats = calcExamStats(r.subjects);
                  const clsLabel = formatClassLabel(s.class);

                  const gradeBadge =
                    stats.grade === "A+" || stats.grade === "A"
                      ? "bg-emerald-100 text-emerald-800"
                      : stats.grade === "B" || stats.grade === "C"
                        ? "bg-sky-100 text-sky-800"
                        : "bg-rose-100 text-rose-800";

                  const waURL = buildWhatsAppURL(s.phone, buildResultCardWhatsAppMsg(s, r));

                  return (
                    <tr key={r.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {getAvatarHTML(s.photoUrl || s.photo, s.name)}
                          <div>
                            <div className="font-extrabold text-royal-900">{s.name}</div>
                            <div className="text-[11px] font-mono text-sky-800">
                              Adm #{s.admNo} • Father: {s.father}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-extrabold text-royal-800">{clsLabel}</td>

                      <td className="p-3">
                        <div className="font-bold text-slate-800">{r.term}</div>
                        <div className="text-[10px] text-slate-500">{r.date}</div>
                      </td>

                      <td className="p-3 text-center">
                        <div className="font-extrabold text-slate-900">
                          {stats.obtained} / {stats.total}
                        </div>
                        <div className="text-[11px] font-bold text-sky-700">{stats.pct}%</div>
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-0.5 rounded-full font-extrabold text-xs ${gradeBadge}`}>
                          Grade {stats.grade}
                        </span>
                        {r.rank && (
                          <div className="text-[10px] font-bold text-amber-700 mt-0.5">
                            {r.rank}
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[11px] font-extrabold ${stats.status === "Passed"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-rose-100 text-rose-800"
                            }`}
                        >
                          {stats.status}
                        </span>
                      </td>

                      <td className="p-3 text-right">
                        <ActionsDropdown
                          items={[
                            {
                              label: "View DMC Card",
                              icon: <Icon name="results" className="w-3.5 h-3.5 text-amber-600" />,
                              onClick: () => onViewDMC(r),
                            },
                            {
                              label: "WhatsApp Result",
                              icon: <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />,
                              href: waURL,
                            },
                            {
                              label: "Edit Marks",
                              icon: <Icon name="edit" className="w-3.5 h-3.5 text-slate-600" />,
                              onClick: () => onOpenResultModal(r),
                            },
                            {
                              label: "Delete Result",
                              icon: <Icon name="trash" className="w-3.5 h-3.5 text-rose-600" />,
                              danger: true,
                              confirmMessage: `Are you sure you want to delete the exam record for ${s.name} (${r.term})?`,
                              onClick: () => onDeleteResult(r.id),
                            },
                          ]}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-semibold flex flex-wrap justify-between items-center gap-2 flex-shrink-0">
          <span>Showing {filteredResults.length} exam result records</span>
          <span className="text-[11px] text-slate-400">Internal scrolling active • Header stays fixed</span>
        </div>
      </div>
    </section>
  );
};

export default ExamsView;
