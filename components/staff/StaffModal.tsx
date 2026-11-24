"use client";

import React, { useState, useEffect, useRef } from "react";
import { getNameInitials } from "@/lib/utils";
import { Icon } from "@/components/ui/Icon";

interface StaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSaveTeacher: (teacherData: any) => Promise<void> | void;
  editTeacher?: any;
  allTeachers: any[];
}

export const StaffModal: React.FC<StaffModalProps> = ({
  isOpen,
  onClose,
  onSaveTeacher,
  editTeacher,
  allTeachers,
}) => {
  const [empId, setEmpId] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const [cnic, setCnic] = useState("");
  const [phone, setPhone] = useState("");
  const [basic, setBasic] = useState<number>(35000);
  const [allowance, setAllowance] = useState<number>(2500);
  const [deduction, setDeduction] = useState<number>(0);
  const [att, setAtt] = useState("Present");
  const [payStatus, setPayStatus] = useState("Unpaid");
  const [photo, setPhoto] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setSubmitError("");
    if (editTeacher) {
      setEmpId(editTeacher.empId || "");
      setName(editTeacher.name || "");
      setRole(editTeacher.role || "");
      setCnic(editTeacher.cnic || "");
      setPhone(editTeacher.phone || "");
      setBasic(Number(editTeacher.basic || 35000));
      setAllowance(Number(editTeacher.allowance || 0));
      setDeduction(Number(editTeacher.deduction || 0));
      setAtt(editTeacher.att || "Present");
      setPayStatus(editTeacher.payStatus || "Unpaid");
      setPhoto(editTeacher.photo || "");
    } else {
      setEmpId(`BS-STF-0${allTeachers.length + 1}`);
      setName("");
      setRole("Senior Science Teacher");
      setCnic("");
      setPhone("");
      setBasic(35000);
      setAllowance(2500);
      setDeduction(0);
      setAtt("Present");
      setPayStatus("Unpaid");
      setPhoto("");
    }
  }, [editTeacher, isOpen, allTeachers]);

  if (!isOpen) return null;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const maxDim = 400;
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxDim) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          }
        } else {
          if (height > maxDim) {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx?.drawImage(img, 0, 0, width, height);
        setPhoto(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = ev.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setPhoto("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    setSubmitError("");
    setIsSubmitting(true);
    try {
      await onSaveTeacher({
        id: editTeacher?.id,
        empId,
        name,
        role,
        cnic,
        phone,
        basic,
        allowance,
        deduction,
        att,
        payStatus,
        photo,
      });
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to save faculty record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-royal-900">
            {editTeacher ? `Edit Faculty — ${editTeacher.name}` : "Add Teacher / Staff"}
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
          {/* Faculty / Staff Photo Upload Section */}
          <div className="p-3.5 bg-slate-50 border border-purple-200 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-purple-300 bg-white overflow-hidden shadow-inner flex items-center justify-center">
                {photo && photo.trim() ? (
                  <img
                    src={photo}
                    alt="Faculty Photo Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-2">
                    <span className="text-lg sm:text-xl font-extrabold text-purple-700 tracking-wider">
                      {name.trim() ? getNameInitials(name) : "BSS"}
                    </span>
                    <span className="block text-[9px] text-slate-400 font-bold mt-0.5">
                      No Photo
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex-1 text-center sm:text-left space-y-2 w-full">
              <div>
                <label className="block text-xs font-extrabold text-purple-950 uppercase tracking-wider">
                  Faculty Photo (For ID Card &amp; Records)
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Upload a professional portrait. If uploaded, it will appear on the Faculty ID Card; otherwise, name initials will be displayed.
                </p>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-800 hover:bg-purple-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition"
                >
                  <Icon name="camera" className="w-3.5 h-3.5" />
                  <span>{photo ? "Change Photo" : "Upload Photo"}</span>
                </button>

                {photo && (
                  <button
                    type="button"
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition"
                  >
                    <Icon name="trash" className="w-3.5 h-3.5 text-rose-600" />
                    <span>Remove Photo</span>
                  </button>
                )}

                <span className="text-[10px] text-slate-400 font-medium">
                  PNG, JPG or WebP (Auto-optimized)
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Sir Muhammad Tariq"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Designation *</label>
              <input
                type="text"
                required
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="e.g. Senior Science Teacher"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">CNIC No. *</label>
              <input
                type="text"
                required
                value={cnic}
                onChange={(e) => setCnic(e.target.value)}
                placeholder="32303-1234567-1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Phone / WhatsApp *</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="03001234567"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Monthly Salary (Rs.) *</label>
              <input
                type="number"
                required
                min={0}
                value={basic}
                onChange={(e) => setBasic(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Allowances (Rs.)</label>
              <input
                type="number"
                value={allowance}
                onChange={(e) => setAllowance(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Deductions (Rs.)</label>
              <input
                type="number"
                value={deduction}
                onChange={(e) => setDeduction(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Daily Attendance Status</label>
              <select
                value={att}
                onChange={(e) => setAtt(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-royal-500"
              >
                <option value="Present">Present</option>
                <option value="Absent">Absent</option>
                <option value="Leave">On Leave</option>
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Salary Payment Status</label>
              <select
                value={payStatus}
                onChange={(e) => setPayStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold focus:outline-none focus:ring-2 focus:ring-royal-500"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
          </div>

          <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 rounded-xl bg-purple-900 hover:bg-purple-950 text-white font-bold shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isSubmitting ? "Saving Faculty…" : "Save Faculty Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StaffModal;
