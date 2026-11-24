"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import ActionsDropdown from "@/components/ui/ActionsDropdown";
import { SCHOOL_CLASSES, SCHOOL_INFO } from "@/lib/constants";
import { formatClassLabel, buildWhatsAppURL, getNameInitials } from "@/lib/utils";

interface AttendanceViewProps {
  students: any[];
  attendanceMap: Record<string, Record<string, string>>;
  onSaveAttendance: (date: string, mapForDate: Record<string, string>) => void;
  onPrintSheet: () => void;
  onShowToast: (msg: string) => void;
}

export const AttendanceView: React.FC<AttendanceViewProps> = ({
  students,
  attendanceMap,
  onSaveAttendance,
  onPrintSheet,
  onShowToast,
}) => {
  const todayISO = new Date().toISOString().split("T")[0];
  const [date, setDate] = useState(todayISO);
  const [classFilter, setClassFilter] = useState("");
  const [localDateMap, setLocalDateMap] = useState<Record<string, string>>(
    attendanceMap[todayISO] || {}
  );

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
    setLocalDateMap(attendanceMap[newDate] || {});
  };

  const handleSetStatus = (stuId: number, status: string) => {
    const next = { ...localDateMap, [stuId]: status };
    setLocalDateMap(next);
    onSaveAttendance(date, next);
  };

  const handleMarkAll = (status: string) => {
    const next = { ...localDateMap };
    activeStudents.forEach((s) => {
      next[s.id] = status;
    });
    setLocalDateMap(next);
    onSaveAttendance(date, next);
    onShowToast(`Marked all visible students as ${status}!`);
  };

  const activeStudents = students.filter(
    (s) => s.status === "Active" && (!classFilter || s.class === classFilter)
  );

  const getAvatarHTML = (photo: string | undefined | null, name: string) => {
    if (photo && String(photo).trim() && (photo.startsWith("http") || photo.startsWith("data:") || photo.startsWith("/"))) {
      return (
        <img
          src={photo}
          alt={name}
          className="w-9 h-9 rounded-full object-cover border border-royal-200 shadow-sm flex-shrink-0"
        />
      );
    }
    return (
      <div className="w-9 h-9 rounded-full bg-royal-100 text-royal-800 border border-royal-200 font-extrabold flex items-center justify-center text-[11px] tracking-wider shadow-sm flex-shrink-0">
        {getNameInitials(name)}
      </div>
    );
  };

  return (
    <section className="tab-panel p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-royal-900">
            Daily Student Attendance &amp; Absent WhatsApp Alerts
          </h3>
          <p className="text-xs text-slate-500">
            Click status pills to toggle Present, Absent, or Leave. Send immediate WhatsApp notices to parents.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-slate-300 text-xs bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-royal-500"
          />
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
          <button
            type="button"
            onClick={() => handleMarkAll("Present")}
            className="px-3 py-2 rounded-xl bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs transition"
          >
            All Present
          </button>
          <button
            type="button"
            onClick={() => handleMarkAll("Absent")}
            className="px-3 py-2 rounded-xl bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-xs transition"
          >
            All Absent
          </button>
          <button
            type="button"
            onClick={() => {
              onSaveAttendance(date, localDateMap);
              onShowToast("Daily attendance saved!");
            }}
            className="px-4 py-2 rounded-xl bg-royal-800 hover:bg-royal-900 text-white font-bold text-xs transition"
          >
            Save Attendance
          </button>
          <button
            type="button"
            onClick={onPrintSheet}
            className="px-3 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
          >
            Print Sheet
          </button>
        </div>
      </div>

      {/* Attendance Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[380px] max-h-[calc(100vh-270px)] sm:max-h-[calc(100vh-290px)]">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse text-xs min-w-[620px]">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-xs">
              <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                <th className="p-3 font-bold bg-slate-50">Student Name &amp; Father</th>
                <th className="p-3 font-bold bg-slate-50">Class</th>
                <th className="p-3 font-bold bg-slate-50">Parent Phone</th>
                <th className="p-3 font-bold bg-slate-50 text-center">Attendance Status</th>
                <th className="p-3 font-bold bg-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {activeStudents.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    No attendance records available. Please admit active students first.
                  </td>
                </tr>
              ) : (
                activeStudents.map((s) => {
                  const st = localDateMap[s.id] || "Present";
                  const clsLabel = formatClassLabel(s.class);
                  const absentMsg = `Assalam-o-Alaikum Respected ${s.father}, urgent attendance alert from ${SCHOOL_INFO.name} (EMIS: ${SCHOOL_INFO.emis}), Muzaffargarh: Your child ${s.name} (${clsLabel}, Adm #${s.admNo}) is ABSENT from school today (${date}). Please inform the school office.`;
                  const waURL = buildWhatsAppURL(s.phone, absentMsg);

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {getAvatarHTML(s.photoUrl || s.photo, s.name)}
                          <div>
                            <div className="font-bold text-royal-900">
                              {s.name}{" "}
                              <span className="text-[11px] font-mono text-sky-800">
                                (Adm #{s.admNo})
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500">Father: {s.father}</div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-extrabold text-royal-800">{clsLabel}</td>

                      <td className="p-3 font-mono text-xs text-slate-700">{s.phone}</td>

                      <td className="p-3 text-center">
                        <div className="inline-flex rounded-xl bg-slate-100 p-1 gap-1">
                          <button
                            type="button"
                            onClick={() => handleSetStatus(s.id, "Present")}
                            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-extrabold transition ${st === "Present"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "text-slate-600 hover:bg-white"
                              }`}
                          >
                            Present
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(s.id, "Absent")}
                            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-extrabold transition ${st === "Absent"
                              ? "bg-rose-600 text-white shadow-sm"
                              : "text-slate-600 hover:bg-white"
                              }`}
                          >
                            Absent
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSetStatus(s.id, "Leave")}
                            className={`px-2.5 sm:px-3 py-1 rounded-lg text-xs font-extrabold transition ${st === "Leave"
                              ? "bg-amber-500 text-royal-950 shadow-sm"
                              : "text-slate-600 hover:bg-white"
                              }`}
                          >
                            Leave
                          </button>
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <ActionsDropdown
                          items={[
                            {
                              label: "WhatsApp Absent Alert",
                              icon: <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />,
                              href: waURL,
                            },
                            {
                              label: "Mark as Present",
                              icon: <Icon name="check" className="w-3.5 h-3.5 text-emerald-600" />,
                              onClick: () => handleSetStatus(s.id, "Present"),
                            },
                            {
                              label: "Mark as Absent",
                              icon: <Icon name="alert" className="w-3.5 h-3.5 text-rose-600" />,
                              onClick: () => handleSetStatus(s.id, "Absent"),
                            },
                            {
                              label: "Mark as Leave",
                              icon: <Icon name="attendance" className="w-3.5 h-3.5 text-amber-600" />,
                              onClick: () => handleSetStatus(s.id, "Leave"),
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
          <span>{activeStudents.length} active students in selected class register</span>
          <span className="text-[11px] text-slate-400">Internal scrolling active • Header stays fixed</span>
        </div>
      </div>
    </section>
  );
};

export default AttendanceView;
