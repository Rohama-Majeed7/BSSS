"use client";

import React, { useState } from "react";
import Icon from "@/components/ui/Icon";
import ActionsDropdown from "@/components/ui/ActionsDropdown";
import { SCHOOL_CLASSES, DEFAULT_FEE_REMINDER_TEMPLATE, SCHOOL_INFO } from "@/lib/constants";
import {
  formatClassLabel,
  getNetStudentFee,
  getFeeStatus,
  buildWhatsAppURL,
} from "@/lib/utils";

interface FeesViewProps {
  students: any[];
  onOpenPaymentModal: (student: any) => void;
  onViewFeeReceipt: (student: any) => void;
  onPrintFeeRegister: () => void;
  onShowToast: (msg: string) => void;
  feeReminderTemplate: string;
  onUpdateTemplate: (tpl: string) => void;
  monthlyReminderSentLog: Record<string, Record<string, string>>;
  onMarkReminderSent: (billingMonth: string, stuId: number) => void;
  onResetMonthSentLog: (billingMonth: string) => void;
}

export const FeesView: React.FC<FeesViewProps> = ({
  students,
  onOpenPaymentModal,
  onViewFeeReceipt,
  onPrintFeeRegister,
  onShowToast,
  feeReminderTemplate,
  onUpdateTemplate,
  monthlyReminderSentLog,
  onMarkReminderSent,
  onResetMonthSentLog,
}) => {
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const now = new Date();
  const currentMonthStr = `${months[now.getMonth()]} ${now.getFullYear()}`;

  const [billingMonth, setBillingMonth] = useState(currentMonthStr);
  const [classFilter, setClassFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [showAutoQueue, setShowAutoQueue] = useState(false);

  const activeStudents = students.filter(
    (s) => s.status === "Active" && (!classFilter || s.class === classFilter)
  );

  const filteredStudents = activeStudents.filter((s) => {
    if (!statusFilter) return true;
    const st = getFeeStatus(s);
    return st === statusFilter;
  });

  const sentForMonth = monthlyReminderSentLog[billingMonth] || {};

  const reminderQueue = activeStudents.map((s) => {
    const totalFee = getNetStudentFee(s);
    const paid = Number(s.paid || 0);
    const balance = Math.max(0, totalFee - paid);
    const tpl = feeReminderTemplate || DEFAULT_FEE_REMINDER_TEMPLATE;
    const msg = tpl
      .replace(/\{school\}/g, SCHOOL_INFO.name)
      .replace(/\{emis\}/g, SCHOOL_INFO.emis)
      .replace(/\{father\}/g, s.father || "Parent")
      .replace(/\{student\}/g, s.name || "Student")
      .replace(/\{admNo\}/g, s.admNo || "")
      .replace(/\{class\}/g, formatClassLabel(s.class))
      .replace(/\{month\}/g, billingMonth)
      .replace(/\{totalFee\}/g, totalFee.toLocaleString())
      .replace(/\{paid\}/g, paid.toLocaleString())
      .replace(/\{balance\}/g, balance.toLocaleString());

    return {
      student: s,
      balance,
      sentDate: sentForMonth[s.id] || null,
      waUrl: buildWhatsAppURL(s.phone, msg),
      msg,
    };
  });

  const pendingReminders = reminderQueue.filter((item) => item.balance > 0 && !item.sentDate);

  const handleOpenNextReminder = () => {
    if (pendingReminders.length === 0) {
      onShowToast(`All ${billingMonth} fee reminders have already been sent!`);
      return;
    }
    const next = pendingReminders[0];
    onMarkReminderSent(billingMonth, next.student.id);
    window.open(next.waUrl, "_blank", "noopener,noreferrer");
  };

  const getAvatarHTML = (photo: string, name: string) => {
    if (photo) {
      return (
        <img
          src={photo}
          alt={name}
          className="w-10 h-10 rounded-full object-cover border border-royal-200 shadow-sm flex-shrink-0"
        />
      );
    }
    const initial = (name || "S").trim().charAt(0).toUpperCase();
    return (
      <div className="w-10 h-10 rounded-full bg-royal-100 text-royal-800 border border-royal-200 font-extrabold flex items-center justify-center text-sm shadow-sm flex-shrink-0">
        {initial}
      </div>
    );
  };

  return (
    <section className="tab-panel p-3 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
      {/* Top Filter Bar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-extrabold text-royal-900">
            Fee Ledger &amp; Twin-Copy A4 Fee Receipts
          </h3>
          <p className="text-xs text-slate-500">
            Select billing month, record payments, print official twin receipts &amp; trigger WhatsApp reminders.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={billingMonth}
            onChange={(e) => setBillingMonth(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white font-bold text-royal-900 focus:outline-none focus:ring-2 focus:ring-royal-500 flex-1 sm:flex-none"
          >
            {months.map((m) => (
              <option key={m} value={`${m} 2026`}>
                {m} 2026
              </option>
            ))}
          </select>
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
            <option value="Paid">Paid</option>
            <option value="Partial">Partial</option>
            <option value="Unpaid">Unpaid</option>
          </select>
          <button
            type="button"
            onClick={() => setShowAutoQueue(!showAutoQueue)}
            className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-royal-950 font-extrabold text-xs transition"
          >
            1st-of-Month Queue ({pendingReminders.length})
          </button>
          <button
            type="button"
            onClick={onPrintFeeRegister}
            className="px-3.5 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs transition"
          >
            Print Register
          </button>
        </div>
      </div>

      {/* Collapsible 1st-of-Month Auto Reminder Queue */}
      {showAutoQueue && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-3xl p-4 sm:p-5 space-y-3">
          <div className="flex flex-wrap justify-between items-center gap-2">
            <div>
              <h4 className="text-sm font-extrabold text-amber-950">
                1st-of-Month Auto Fee Reminder Queue ({billingMonth})
              </h4>
              <p className="text-xs text-amber-800">
                Personalized Urdu/English messages with student name, Admission #, class &amp; balance due.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleOpenNextReminder}
                className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
              >
                Open Next Pending Chat ({pendingReminders.length})
              </button>
              <button
                type="button"
                onClick={() => {
                  onResetMonthSentLog(billingMonth);
                  onShowToast(`Reset reminder status for ${billingMonth}.`);
                }}
                className="px-3 py-1.5 rounded-xl border border-amber-300 bg-white hover:bg-amber-100 text-amber-900 font-bold text-xs transition"
              >
                Reset Month Log
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-amber-950 mb-1">
              Custom WhatsApp Template:
            </label>
            <textarea
              rows={3}
              value={feeReminderTemplate}
              onChange={(e) => onUpdateTemplate(e.target.value)}
              className="w-full p-2.5 rounded-xl border border-amber-300 text-xs bg-white text-slate-800 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>
      )}

      {/* Fee Ledger Table */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col flex-1 min-h-[380px] max-h-[calc(100vh-280px)] sm:max-h-[calc(100vh-300px)]">
        <div className="overflow-x-auto overflow-y-auto flex-1">
          <table className="w-full text-left border-collapse text-xs min-w-[700px]">
            <thead className="sticky top-0 z-10 bg-slate-50 shadow-xs">
              <tr className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                <th className="p-3 font-bold bg-slate-50">Student &amp; Admission #</th>
                <th className="p-3 font-bold bg-slate-50">Father Name</th>
                <th className="p-3 font-bold bg-slate-50">Fee Structure</th>
                <th className="p-3 font-bold bg-slate-50">Payment Details</th>
                <th className="p-3 font-bold bg-slate-50 text-center">Status</th>
                <th className="p-3 font-bold bg-slate-50 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    {students.length === 0
                      ? "No fee records available. Admit students to begin recording payments."
                      : "No fee records found matching your filter criteria."}
                  </td>
                </tr>
              ) : (
                filteredStudents.map((s) => {
                  const netFee = getNetStudentFee(s);
                  const paid = Number(s.paid || 0);
                  const due = Math.max(0, netFee - paid);
                  const feeSt = getFeeStatus(s);
                  const clsLabel = formatClassLabel(s.class);
                  const adj = Number(s.adj || 0);

                  const remMsg = `Assalam-o-Alaikum Respected ${s.father}, fee reminder from ${SCHOOL_INFO.name} for ${s.name} (${clsLabel}, Adm #${s.admNo}): Total fee is Rs.${netFee}, Paid Rs.${paid}, Balance Due Rs.${due}. Kindly clear at earliest. JazakAllah!`;
                  const waURL = buildWhatsAppURL(s.phone, remMsg);

                  const badgeCls =
                    feeSt === "Paid"
                      ? "bg-emerald-100 text-emerald-800"
                      : feeSt === "Partial"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800";

                  return (
                    <tr key={s.id} className="hover:bg-slate-50 transition">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {getAvatarHTML(s.photo, s.name)}
                          <div>
                            <div className="font-bold text-royal-900">{s.name}</div>
                            <div className="text-[11px] text-slate-500">
                              {clsLabel} • Adm #{s.admNo} • {s.receiptNo || `REC-${s.id}`}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="p-3 font-semibold text-slate-700">{s.father}</td>

                      <td className="p-3">
                        <div className="font-extrabold text-slate-900">
                          Rs. {netFee.toLocaleString()}
                        </div>
                        {adj !== 0 && (
                          <div
                            className={`text-[10px] font-semibold ${adj < 0 ? "text-emerald-700" : "text-rose-600"
                              }`}
                          >
                            Base {s.fee} ({adj > 0 ? `+${adj}` : adj})
                          </div>
                        )}
                      </td>

                      <td className="p-3 text-xs">
                        <div className="font-bold text-emerald-700">
                          Paid: Rs. {paid.toLocaleString()}
                        </div>
                        <div className="font-bold text-rose-600">
                          Due: Rs. {due.toLocaleString()}
                        </div>
                      </td>

                      <td className="p-3 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${badgeCls}`}>
                          {feeSt}
                        </span>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {s.payMethod || "Cash"} {s.payDate ? `• ${s.payDate}` : ""}
                        </div>
                      </td>

                      <td className="p-3 text-right">
                        <ActionsDropdown
                          items={[
                            {
                              label: "Record Payment",
                              icon: <Icon name="fees" className="w-3.5 h-3.5 text-royal-700" />,
                              onClick: () => onOpenPaymentModal(s),
                            },
                            {
                              label: "Print Fee Receipt",
                              icon: <Icon name="print" className="w-3.5 h-3.5 text-slate-600" />,
                              onClick: () => onViewFeeReceipt(s),
                            },
                            {
                              label: "WhatsApp Reminder",
                              icon: <Icon name="whatsapp" className="w-3.5 h-3.5 text-emerald-600" />,
                              href: waURL,
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
          <span>Showing {filteredStudents.length} of {students.length} student fee records</span>
          <span className="text-[11px] text-slate-400">Internal scrolling active • Header stays fixed</span>
        </div>
      </div>
    </section>
  );
};

export default FeesView;
