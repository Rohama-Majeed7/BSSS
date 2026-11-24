"use client";

import React from "react";
import Icon from "@/components/ui/Icon";
import ActionsDropdown from "@/components/ui/ActionsDropdown";
import { calcTeacherNetPay, getNameInitials, buildWhatsAppURL, buildFacultyIDCardWhatsAppMsg } from "@/lib/utils";

interface StaffViewProps {
  teachers: any[];
  onOpenStaffModal: (editTeacher?: any) => void;
  onDeleteStaff: (id: number) => void;
  onCycleAttendance: (id: number) => void;
  onTogglePayStatus: (id: number) => void;
  onViewIDCard: (teacher: any) => void;
  onViewPaySlip: (teacher: any) => void;
  onPrintPayrollSheet: () => void;
}

export const StaffView: React.FC<StaffViewProps> = ({
  teachers,
  onOpenStaffModal,
  onDeleteStaff,
  onCycleAttendance,
  onTogglePayStatus,
  onViewIDCard,
  onViewPaySlip,
  onPrintPayrollSheet,
}) => {
  const getAvatarHTML = (photo: string, name: string) => {
    if (photo && String(photo).trim()) {
      return (
        <img
          src={photo}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-purple-200 shadow-sm flex-shrink-0"
        />
      );
    }
    return (
      <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-800 border border-purple-200 font-extrabold flex items-center justify-center text-xs tracking-wider shadow-sm flex-shrink-0">
        {getNameInitials(name)}
      </div>
    );
  };

  return (
    <section className="tab-panel p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      {/* Top Header */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3 sm:gap-4">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-royal-900">Faculty &amp; Payroll Management</h3>
          <p className="text-xs text-slate-500">
            Teaching staff directory, designations, CNIC, daily attendance, allowances, deductions &amp; net salary slips.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <button
            type="button"
            onClick={onPrintPayrollSheet}
            className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition whitespace-nowrap"
          >
            Print Payroll Sheet
          </button>
          <button
            type="button"
            onClick={() => onOpenStaffModal(null)}
            className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-royal-800 hover:bg-royal-900 text-white font-bold text-xs shadow-md transition whitespace-nowrap touch-manipulation"
          >
            + Add Teacher / Staff
          </button>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[380px] max-h-[calc(100vh-270px)] sm:max-h-[calc(100vh-290px)]">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse text-xs min-w-[650px]">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-xs">
              <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                <th className="p-3 font-bold bg-slate-50">Faculty Member</th>
                <th className="p-3 font-bold bg-slate-50">Designation &amp; CNIC</th>
                <th className="p-3 font-bold bg-slate-50 text-center">Attendance</th>
                <th className="p-3 font-bold bg-slate-50">Net Monthly Pay</th>
                <th className="p-3 font-bold bg-slate-50 text-center">Pay Status</th>
                <th className="p-3 font-bold bg-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {teachers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No faculty records available. Click &quot;+ Add Faculty Member&quot; to register staff.
                  </td>
                </tr>
              ) : (
                teachers.map((t) => {
                  const pay = calcTeacherNetPay(t);
                  const attBadge =
                    t.att === "Present"
                      ? "bg-emerald-100 text-emerald-800"
                      : t.att === "Absent"
                        ? "bg-rose-100 text-rose-800"
                        : "bg-amber-100 text-amber-800";

                  const payBadge =
                    t.payStatus === "Paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : "bg-rose-100 text-rose-800";

                  return (
                    <tr key={t.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {getAvatarHTML(t.photo, t.name)}
                          <div>
                            <div className="font-extrabold text-royal-900">{t.name}</div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {t.empId} • {t.phone}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-bold text-royal-800">{t.role}</div>
                        <div className="text-[11px] font-mono text-slate-500">CNIC: {t.cnic}</div>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => onCycleAttendance(t.id)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold ${attBadge}`}
                        >
                          {t.att}
                        </button>
                        <div className="text-[10px] text-slate-500 mt-1">
                          Deductions: Rs.{pay.ded.toLocaleString()}
                        </div>
                      </td>

                      <td className="p-3">
                        <div className="font-extrabold text-slate-900">
                          Rs. {pay.net.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          Salary: {pay.basic.toLocaleString()} + {pay.allow.toLocaleString()}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <button
                          type="button"
                          onClick={() => onTogglePayStatus(t.id)}
                          className={`px-3 py-1 rounded-full text-xs font-extrabold ${payBadge}`}
                        >
                          {t.payStatus}
                        </button>
                      </td>

                      <td className="p-3 text-right">
                        <ActionsDropdown
                          items={[
                            {
                              label: "View ID Card",
                              icon: <Icon name="idcard" className="w-3.5 h-3.5 text-royal-600" />,
                              onClick: () => onViewIDCard(t),
                            },
                            {
                              label: "WhatsApp ID Card",
                              icon: <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />,
                              href: buildWhatsAppURL(t.phone, buildFacultyIDCardWhatsAppMsg(t)),
                            },
                            {
                              label: "View Pay Slip",
                              icon: <Icon name="print" className="w-3.5 h-3.5 text-purple-600" />,
                              onClick: () => onViewPaySlip(t),
                            },
                            {
                              label: "Edit Profile",
                              icon: <Icon name="edit" className="w-3.5 h-3.5 text-slate-600" />,
                              onClick: () => onOpenStaffModal(t),
                            },
                            {
                              label: `Cycle Attendance (${t.att || "Present"})`,
                              icon: <Icon name="attendance" className="w-3.5 h-3.5 text-sky-600" />,
                              onClick: () => onCycleAttendance(t.id),
                            },
                            {
                              label: `Toggle Pay (${t.payStatus || "Unpaid"})`,
                              icon: <Icon name="fees" className="w-3.5 h-3.5 text-emerald-600" />,
                              onClick: () => onTogglePayStatus(t.id),
                            },
                            {
                              label: "Delete Faculty",
                              icon: <Icon name="trash" className="w-3.5 h-3.5 text-rose-600" />,
                              danger: true,
                              confirmMessage: `Are you sure you want to delete faculty member "${t.name}"?`,
                              onClick: () => onDeleteStaff(t.id),
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
          <span>{teachers.length} faculty and staff members</span>
          <span className="text-[11px] text-slate-400">Internal scrolling active • Header stays fixed</span>
        </div>
      </div>
    </section>
  );
};

export default StaffView;
