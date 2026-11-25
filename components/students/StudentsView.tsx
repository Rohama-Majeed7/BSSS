"use client";

import React, { useState, useMemo } from "react";
import Icon from "@/components/ui/Icon";
import PhotoAvatar from "@/components/ui/PhotoAvatar";
import ActionsDropdown from "@/components/ui/ActionsDropdown";
import { SCHOOL_CLASSES } from "@/lib/constants";
import {
  formatClassLabel,
  calculateAge,
  getNetStudentFee,
  getFeeStatus,
  buildWhatsAppURL,
  buildStudentIDCardWhatsAppMsg,
} from "@/lib/utils";
import { SCHOOL_INFO } from "@/lib/constants";

interface StudentsViewProps {
  students: any[];
  onAdmitClick: () => void;
  onEditStudent: (student: any) => void;
  onDeleteStudent: (id: number) => void;
  onViewIDCard: (student: any) => void;
  onViewResult: (student: any) => void;
  onViewSLC: (student: any) => void;
  initialClassFilter?: string;
}

export const StudentsView: React.FC<StudentsViewProps> = ({
  students,
  onAdmitClick,
  onEditStudent,
  onDeleteStudent,
  onViewIDCard,
  onViewResult,
  onViewSLC,
  initialClassFilter = "",
}) => {
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState(initialClassFilter);
  const [statusFilter, setStatusFilter] = useState("");
  const [groupByClass, setGroupByClass] = useState(false);

  const filteredStudents = useMemo(() => {
    const q = search.toLowerCase().trim();
    return students.filter((s) => {
      const matchSearch =
        !q ||
        (s.name && s.name.toLowerCase().includes(q)) ||
        (s.admNo && String(s.admNo).toLowerCase().includes(q)) ||
        (s.father && s.father.toLowerCase().includes(q)) ||
        (s.phone && String(s.phone).includes(q)) ||
        (s.bform && String(s.bform).includes(q));

      const matchClass = !classFilter || s.class === classFilter;
      const matchStatus = !statusFilter || s.status === statusFilter;

      return matchSearch && matchClass && matchStatus;
    });
  }, [students, search, classFilter, statusFilter]);

  const renderStudentRow = (s: any) => {
    const ageObj = calculateAge(s.dob);
    const feeSt = getFeeStatus(s);
    const netFee = getNetStudentFee(s);
    const due = Math.max(0, netFee - Number(s.paid || 0));
    const clsLabel = formatClassLabel(s.class);

    const waMsg = `Assalam-o-Alaikum Respected ${s.father}, this is a message from ${SCHOOL_INFO.name} (EMIS: ${SCHOOL_INFO.emis}), Muzaffargarh regarding your child ${s.name} (${clsLabel}, Adm #${s.admNo}).`;
    const waURL = buildWhatsAppURL(s.phone, waMsg);

    const statusBadge =
      s.status === "Active" ? (
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
          Active
        </span>
      ) : (
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
          Left
        </span>
      );

    const feeBadge =
      feeSt === "Paid" ? (
        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
          Paid
        </span>
      ) : feeSt === "Partial" ? (
        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
          Due Rs.{due}
        </span>
      ) : (
        <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px]">
          Unpaid Rs.{due}
        </span>
      );

    return (
      <tr key={s.id} className="hover:bg-slate-50 transition align-middle">
        <td className="p-3">
          <div className="flex items-center gap-3">
            <PhotoAvatar photoUrl={s.photoUrl} photo={s.photo} name={s.name} />
            <div>
              <div className="font-extrabold text-royal-900">{s.name}</div>
              <div className="text-[11px] font-mono font-bold text-sky-800">
                Adm #: {s.admNo} • {s.gender}
              </div>
            </div>
          </div>
        </td>

        <td className="p-3">
          <div className="text-[11px] text-slate-600">
            DOB: <strong>{s.dob}</strong>
          </div>
          <span className="inline-block my-0.5 px-2 py-0.5 rounded-md bg-sky-50 text-royal-800 border border-sky-200 font-bold text-[10px]">
            Age: {ageObj.text}
          </span>
          <div className="font-mono text-[11px] text-slate-500">
            B-Form: {s.bform}
          </div>
        </td>

        <td className="p-3">
          <div className="font-bold text-slate-800">{s.father}</div>
          {s.fatherCnic && (
            <div className="font-mono text-[11px] text-royal-800 font-semibold">
              CNIC: {s.fatherCnic}
            </div>
          )}
          <div
            className="text-[11px] text-slate-500 max-w-[180px] truncate"
            title={s.address}
          >
            {s.address}
          </div>
        </td>

        <td className="p-3">
          <div className="font-extrabold text-royal-800">{clsLabel}</div>
          <div className="mt-1">{statusBadge}</div>
          {s.admDate && (
            <div className="text-[10px] text-slate-500 mt-0.5">
              Adm: {formatClassLabel(s.admClass || s.class)} ({s.admDate})
            </div>
          )}
          {(s.leaveClass || s.leaveDate) && (
            <div className="text-[10px] text-amber-700 font-semibold">
              Withdrawn: {formatClassLabel(s.leaveClass || s.class)}{" "}
              {s.leaveDate ? `(${s.leaveDate})` : ""}
            </div>
          )}
        </td>

        <td className="p-3">
          <div className="font-mono text-xs font-semibold text-slate-800">
            {s.phone}
          </div>
          <a
            href={waURL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-1 inline-block px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px]"
          >
            WhatsApp
          </a>
        </td>

        <td className="p-3">
          <div className="font-extrabold text-slate-900">
            Rs. {netFee.toLocaleString()}
          </div>
          <div className="mt-1">{feeBadge}</div>
        </td>

        <td className="p-3 text-right">
          <ActionsDropdown
            items={[
              {
                label: "Edit Student",
                icon: <Icon name="edit" className="w-3.5 h-3.5 text-slate-500" />,
                onClick: () => onEditStudent(s),
              },
              {
                label: "View ID Card",
                icon: <Icon name="idcard" className="w-3.5 h-3.5 text-royal-600" />,
                onClick: () => onViewIDCard(s),
              },
              {
                label: "WhatsApp ID Card",
                icon: <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />,
                href: buildWhatsAppURL(s.phone, buildStudentIDCardWhatsAppMsg(s)),
              },
              {
                label: "Exam Result (DMC)",
                icon: <Icon name="results" className="w-3.5 h-3.5 text-amber-600" />,
                onClick: () => onViewResult(s),
              },
              {
                label: "Leaving Certificate",
                icon: <Icon name="cert" className="w-3.5 h-3.5 text-amber-700" />,
                onClick: () => onViewSLC(s),
              },
              {
                label: "WhatsApp Message",
                icon: <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />,
                href: waURL,
              },
              {
                label: "Delete Student",
                icon: <Icon name="trash" className="w-3.5 h-3.5 text-rose-600" />,
                danger: true,
                confirmMessage: `Are you sure you want to delete student "${s.name}" (Adm #${s.admNo})? All associated records will be removed.`,
                onClick: () => onDeleteStudent(s.id),
              },
            ]}
          />
        </td>
      </tr>
    );
  };

  return (
    <section className="tab-panel p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      {/* Top Filter & Search Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-royal-900">
            Students Directory (Nursery, Prep &amp; Class 1–12)
          </h3>
          <p className="text-xs text-slate-500">
            Manual Admission Numbers, Father CNIC, B-Form, DOB, Age &amp; WhatsApp reminders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search by Name, Adm #, Phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs w-full sm:w-60 focus:outline-none focus:ring-2 focus:ring-royal-500"
          />
          <select
            value={classFilter}
            onChange={(e) => setClassFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-royal-500 flex-1 sm:flex-none"
          >
            <option value="">All 14 Classes</option>
            {SCHOOL_CLASSES.map((c) => (
              <option key={c} value={c}>
                {formatClassLabel(c)}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-royal-500 flex-1 sm:flex-none"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active Only</option>
            <option value="Left">Left / Withdrawn</option>
          </select>
          <button
            type="button"
            aria-pressed={groupByClass}
            onClick={() => setGroupByClass((prev) => !prev)}
            className={`px-3 py-2 rounded-xl text-xs font-bold border transition touch-manipulation whitespace-nowrap flex items-center gap-1.5 ${
              groupByClass
                ? "bg-royal-800 text-white border-royal-800 shadow-sm"
                : "bg-sky-50 hover:bg-sky-100 text-royal-900 border-sky-200"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                groupByClass ? "bg-gold-400" : "bg-royal-400"
              }`}
            />
            <span>Group by Class</span>
          </button>
          <button
            type="button"
            onClick={onAdmitClick}
            className="bg-royal-800 hover:bg-royal-900 text-white font-bold text-xs px-4 py-2 rounded-xl shadow-md transition touch-manipulation whitespace-nowrap"
          >
            + Admit Student
          </button>
        </div>
      </div>

      {/* Class Pills Navigation */}
      <div className="flex items-center gap-1.5 pb-2 overflow-x-auto no-scrollbar">
        <button
          type="button"
          onClick={() => setClassFilter("")}
          className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 touch-manipulation ${!classFilter
            ? "bg-royal-800 text-white shadow-sm"
            : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
            }`}
        >
          All Classes ({students.length})
        </button>
        {SCHOOL_CLASSES.map((c) => {
          const count = students.filter((s) => s.class === c).length;
          const isActive = classFilter === c;
          return (
            <button
              key={c}
              type="button"
              onClick={() => setClassFilter(c)}
              className={`px-3 py-1.5 rounded-full text-xs font-bold transition flex-shrink-0 touch-manipulation ${isActive
                ? "bg-royal-800 text-white shadow-sm"
                : "bg-white text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
            >
              {formatClassLabel(c)} ({count})
            </button>
          );
        })}
      </div>

      {/* Students Data Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[380px] max-h-[calc(100vh-320px)] sm:max-h-[calc(100vh-340px)]">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse text-xs min-w-[760px]">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-xs">
              <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                <th className="p-3 font-bold bg-slate-50">Student &amp; Adm No</th>
                <th className="p-3 font-bold bg-slate-50">DOB, Age &amp; B-Form</th>
                <th className="p-3 font-bold bg-slate-50">Father Name &amp; CNIC</th>
                <th className="p-3 font-bold bg-slate-50">Class &amp; Status</th>
                <th className="p-3 font-bold bg-slate-50">Phone / WhatsApp</th>
                <th className="p-3 font-bold bg-slate-50">Monthly Fee</th>
                <th className="p-3 font-bold bg-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    {students.length === 0
                      ? "No students found. Click '+ Admit Student' to add the first student record."
                      : "No students found matching your search and filter criteria."}
                  </td>
                </tr>
              ) : groupByClass ? (
                <>
                  {SCHOOL_CLASSES.map((c) => {
                    const clsList = filteredStudents.filter((s) => s.class === c);
                    if (clsList.length === 0) return null;
                    return (
                      <React.Fragment key={`group-${c}`}>
                        <tr className="bg-royal-900 text-white">
                          <td
                            colSpan={7}
                            className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider"
                          >
                            {formatClassLabel(c)} — Total Students: {clsList.length}
                          </td>
                        </tr>
                        {clsList.map((s) => renderStudentRow(s))}
                      </React.Fragment>
                    );
                  })}
                  {(() => {
                    const known = new Set<string>(SCHOOL_CLASSES);
                    const otherList = filteredStudents.filter((s) => !known.has(s.class));
                    if (otherList.length === 0) return null;
                    return (
                      <React.Fragment key="group-other">
                        <tr className="bg-royal-900 text-white">
                          <td
                            colSpan={7}
                            className="px-4 py-2 text-xs font-extrabold uppercase tracking-wider"
                          >
                            Other Classes — Total Students: {otherList.length}
                          </td>
                        </tr>
                        {otherList.map((s) => renderStudentRow(s))}
                      </React.Fragment>
                    );
                  })()}
                </>
              ) : (
                filteredStudents.map((s) => renderStudentRow(s))
              )}
            </tbody>
          </table>
        </div>
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 font-semibold flex flex-wrap justify-between items-center gap-2 flex-shrink-0">
          <span>Showing {filteredStudents.length} of {students.length} students</span>
          <span className="text-[11px] text-slate-400">Internal scrolling active • Header stays fixed</span>
        </div>
      </div>
    </section>
  );
};

export default StudentsView;
