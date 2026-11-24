"use client";

import React, { useState, useEffect } from "react";
import { formatClassLabel, getNetStudentFee } from "@/lib/utils";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSavePayment: (paymentData: any) => Promise<void> | void;
  student?: any;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  onSavePayment,
  student,
}) => {
  const [amount, setAmount] = useState<number>(0);
  const [adj, setAdj] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [method, setMethod] = useState("Cash");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    if (student) {
      setAdj(Number(student.adj || 0));
      setAmount(getNetStudentFee(student));
      setDate(new Date().toISOString().split("T")[0]);
      setMethod(student.payMethod || "Cash");
      setRemarks(student.payRemarks || "Paid in full");
      setSubmitError("");
    }
  }, [student, isOpen]);

  if (!isOpen || !student) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await onSavePayment({
        studentId: student.id,
        amount,
        adj,
        date,
        method,
        remarks,
      });
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || "Payment could not be recorded. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl border border-slate-200">
        <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-royal-900">Record Fee Collection</h3>
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
          <div className="mb-3 px-4 py-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-start gap-2">
            <span className="text-rose-500 mt-0.5">⚠</span>
            <span>{submitError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
          <div className="p-3 bg-royal-50 rounded-2xl border border-royal-100">
            <p className="font-extrabold text-royal-900">
              {student.name} ({formatClassLabel(student.class)}, Adm #{student.admNo})
            </p>
            <p className="text-xs text-slate-600 mt-0.5">
              Father: {student.father} • Base Fee: Rs. {Number(student.fee).toLocaleString()}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Amount Paid (Rs.) *</label>
              <input
                type="number"
                required
                min={0}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 font-extrabold text-royal-900 focus:outline-none focus:ring-2 focus:ring-royal-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Fee Adjust (+/-)</label>
              <input
                type="number"
                value={adj}
                onChange={(e) => setAdj(Number(e.target.value))}
                placeholder="Discount / Fine"
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500 disabled:bg-slate-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Date *</label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500 disabled:bg-slate-50"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Payment Method *</label>
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value)}
                disabled={isSubmitting}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-royal-500 disabled:bg-slate-50"
              >
                <option value="Cash">Cash at Counter</option>
                <option value="JazzCash">JazzCash</option>
                <option value="EasyPaisa">EasyPaisa</option>
                <option value="Bank">Bank Deposit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">Payment Remarks</label>
            <input
              type="text"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="e.g. Monthly tuition fee received"
              disabled={isSubmitting}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500 disabled:bg-slate-50"
            />
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
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isSubmitting ? "Saving…" : "Save & View Receipt"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;
