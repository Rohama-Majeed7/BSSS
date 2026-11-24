"use client";

import React, { useState, useEffect, useRef } from "react";
import { SCHOOL_CLASSES } from "@/lib/constants";
import { formatClassLabel, calculateAge, getNameInitials } from "@/lib/utils";
import {
  uploadPhotoToNeon,
  deletePhotoFromServer,
  resolveDisplayPhotoUrl,
} from "@/lib/photoUpload";
import { Icon } from "@/components/ui/Icon";

interface StudentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (studentData: any) => Promise<void> | void;
  onPhotoRemoved?: (studentId: number) => void;
  editStudent?: any;
  allStudents: any[];
}

export const StudentModal: React.FC<StudentModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onPhotoRemoved,
  editStudent,
  allStudents,
}) => {
  const [name, setName] = useState("");
  const [admNo, setAdmNo] = useState("");
  const [father, setFather] = useState("");
  const [fatherCnic, setFatherCnic] = useState("");
  const [cls, setCls] = useState("Nursery");
  const [gender, setGender] = useState("Male");
  const [dob, setDob] = useState("");
  const [bform, setBform] = useState("");
  const [admClass, setAdmClass] = useState("Nursery");
  const [admDate, setAdmDate] = useState(new Date().toISOString().split("T")[0]);
  const [leaveClass, setLeaveClass] = useState("");
  const [leaveDate, setLeaveDate] = useState("");
  const [phone, setPhone] = useState("");
  const [fee, setFee] = useState<number>(2000);
  const [address, setAddress] = useState("");
  const [status, setStatus] = useState("Active");
  const [photo, setPhoto] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [photoKey, setPhotoKey] = useState("");
  const [savedPhotoKey, setSavedPhotoKey] = useState("");
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isRemovingPhoto, setIsRemovingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const blobPreviewRef = useRef<string | null>(null);

  const revokeBlobPreview = () => {
    if (blobPreviewRef.current) {
      URL.revokeObjectURL(blobPreviewRef.current);
      blobPreviewRef.current = null;
    }
  };

  useEffect(() => {
    return () => revokeBlobPreview();
  }, []);

  const editStudentId = editStudent?.id ?? null;

  useEffect(() => {
    if (!isOpen) return;
    revokeBlobPreview();

    if (editStudent) {
      setName(editStudent.name || "");
      setAdmNo(editStudent.admNo || "");
      setFather(editStudent.father || "");
      setFatherCnic(editStudent.fatherCnic || "");
      setCls(editStudent.class || "Nursery");
      setGender(editStudent.gender || "Male");
      setDob(editStudent.dob || "");
      setBform(editStudent.bform || "");
      setAdmClass(editStudent.admClass || editStudent.class || "Nursery");
      setAdmDate(editStudent.admDate || new Date().toISOString().split("T")[0]);
      setLeaveClass(editStudent.leaveClass || "");
      setLeaveDate(editStudent.leaveDate || "");
      setPhone(editStudent.phone || "");
      setFee(Number(editStudent.fee || 2000));
      setAddress(editStudent.address || "");
      setStatus(editStudent.status || "Active");
      // Preserve S3 object key in photoKey/savedPhotoKey, and renderable URL in photo
      const dbPhotoKey = editStudent.photo || "";
      setSavedPhotoKey(dbPhotoKey);
      setPhotoKey(dbPhotoKey);
      setPhoto(resolveDisplayPhotoUrl(editStudent));
    } else {
      setName("");
      setFather("");
      setFatherCnic("");
      setCls("Nursery");
      setGender("Male");
      setDob("");
      setBform("");
      setAdmClass("Nursery");
      setAdmDate(new Date().toISOString().split("T")[0]);
      setLeaveClass("");
      setLeaveDate("");
      setPhone("");
      setFee(2000);
      setAddress("Basti Jaisal Wain, Jhang Road, Muzaffargarh");
      setStatus("Active");
      setSavedPhotoKey("");
      setPhotoKey("");
      setPhoto("");

      // Suggest next Adm No
      let maxNum = 100;
      allStudents.forEach((s) => {
        const n = parseInt(String(s.admNo).replace(/\D/g, ""), 10);
        if (!isNaN(n) && n > maxNum) maxNum = n;
      });
      setAdmNo(String(maxNum + 1));
    }
    setSubmitError("");
    setPhotoError("");
    setIsUploadingPhoto(false);
    setIsRemovingPhoto(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editStudentId, isOpen]);

  if (!isOpen) return null;

  const handleSuggestAdmNo = () => {
    let maxNum = 100;
    allStudents.forEach((s) => {
      const n = parseInt(String(s.admNo).replace(/\D/g, ""), 10);
      if (!isNaN(n) && n > maxNum) maxNum = n;
    });
    setAdmNo(String(maxNum + 1));
  };

  const handlePhotoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setPhotoError("");
    const prevUnsavedKey = photoKey && photoKey !== savedPhotoKey ? photoKey : "";

    try {
      setIsUploadingPhoto(true);
      const { objectKey, previewUrl } = await uploadPhotoToNeon(file, "students");

      revokeBlobPreview();
      blobPreviewRef.current = previewUrl;
      setPhotoKey(objectKey);
      setPhoto(previewUrl);
      setPhotoError("");

      // Clean up a previously uploaded unsaved photo from this modal session
      if (prevUnsavedKey && prevUnsavedKey !== objectKey) {
        deletePhotoFromServer({
          photoKey: prevUnsavedKey,
          category: "students",
        }).catch((err) => console.warn("Failed to clean up replaced unsaved photo:", err));
      }
    } catch (error: any) {
      console.error("Photo upload error:", error);
      setPhotoError(error?.message || "Failed to upload photo. Please try again.");
    } finally {
      setIsUploadingPhoto(false);
      if (e.target) e.target.value = "";
    }
  };

  const handleRemovePhoto = async () => {
    if (isUploadingPhoto || isRemovingPhoto || isSubmitting) return;

    try {
      setPhotoError("");
      setIsRemovingPhoto(true);

      const hasUnsavedUpload = Boolean(photoKey && photoKey !== savedPhotoKey);
      if (hasUnsavedUpload) {
        await deletePhotoFromServer({
          photoKey,
          category: "students",
        });
      }

      if (editStudent?.id && savedPhotoKey) {
        await deletePhotoFromServer({
          photoKey: savedPhotoKey,
          category: "students",
          recordId: editStudent.id,
        });
        setSavedPhotoKey("");
        onPhotoRemoved?.(editStudent.id);
      }

      revokeBlobPreview();
      setPhoto("");
      setPhotoKey("");
      setPhotoError("");

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error: any) {
      console.error("Remove photo error:", error);
      setPhotoError(error?.message || "Could not remove photo. Please try again.");
    } finally {
      setIsRemovingPhoto(false);
    }
  };

  const handleModalClose = () => {
    if (isSubmitting || isUploadingPhoto || isRemovingPhoto) return;
    if (photoKey && photoKey !== savedPhotoKey) {
      deletePhotoFromServer({
        photoKey,
        category: "students",
      }).catch((err) => console.warn("Failed to clean up cancelled upload:", err));
    }
    revokeBlobPreview();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting || isUploadingPhoto || isRemovingPhoto) return;

    if (!admNo.trim() || !name.trim() || !father.trim() || !cls) {
      setSubmitError("Admission No, Student Name, Father Name and Class are all required.");
      return;
    }

    setSubmitError("");
    setIsSubmitting(true);
    try {
      await onSave({
        id: editStudent?.id,
        name,
        admNo,
        father,
        fatherCnic,
        class: cls,
        gender,
        dob,
        bform,
        admClass,
        admDate,
        leaveClass,
        leaveDate,
        phone,
        fee,
        address,
        status,
        photo: photoKey || null,
      });
      revokeBlobPreview();
      onClose();
    } catch (err: any) {
      setSubmitError(err?.message || "Failed to save student record. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const ageObj = calculateAge(dob);

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5 border-b border-slate-100 pb-3">
          <h3 className="text-lg font-extrabold text-royal-900">
            {editStudent ? `Edit Student — ${editStudent.name}` : "New Student Admission"}
          </h3>
          <button
            type="button"
            onClick={handleModalClose}
            disabled={isSubmitting || isUploadingPhoto || isRemovingPhoto}
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
          {/* Student Photo Upload Section */}
          <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center sm:items-start gap-4">
            <div className="relative flex-shrink-0">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl border-2 border-dashed border-royal-300 bg-white overflow-hidden shadow-inner flex items-center justify-center">
                {photo && photo.trim() ? (
                  <img
                    src={photo}
                    alt="Student Photo Preview"
                    className="w-full h-full object-cover"
                    onError={() => setPhoto("")}
                  />
                ) : (
                  <div className="text-center p-2">
                    <span className="text-lg sm:text-xl font-extrabold text-royal-700 tracking-wider">
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
                <label className="block text-xs font-extrabold text-royal-950 uppercase tracking-wider">
                  Student Photo (For ID Card &amp; Records)
                </label>

              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/jpg"
                onChange={handlePhotoUpload}
                className="hidden"
              />

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                {!(photo || photoKey) || isUploadingPhoto ? (
                  <button
                    type="button"
                    disabled={isUploadingPhoto || isRemovingPhoto || isSubmitting}
                    onClick={() => fileInputRef.current?.click()}
                    className="px-3.5 py-1.5 rounded-xl bg-royal-800 hover:bg-royal-900 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
                  >
                    <Icon name="camera" className="w-3.5 h-3.5" />
                    <span>{isUploadingPhoto ? "Uploading..." : "Upload Photo"}</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    disabled={isRemovingPhoto || isSubmitting}
                    onClick={handleRemovePhoto}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold text-xs flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Icon name="trash" className="w-3.5 h-3.5 text-rose-600" />
                    <span>{isRemovingPhoto ? "Removing..." : "Remove Photo"}</span>
                  </button>
                )}

                {isUploadingPhoto && (
                  <span className="text-[11px] text-royal-700 font-bold flex items-center gap-1.5">
                    <svg className="animate-spin w-3.5 h-3.5 text-royal-700" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    Uploading ...
                  </span>
                )}

                {!isUploadingPhoto && (
                  <span className="text-[10px] text-slate-400 font-medium">
                    PNG, JPG or WebP (Auto-optimized)
                  </span>
                )}
              </div>

              {photoError && (
                <p className="text-[11px] font-bold text-rose-600 mt-1">
                  ⚠ {photoError}
                </p>
              )}
            </div>
          </div>

          {/* Admission No, Name & Father */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Manual Adm # *</label>
                <button
                  type="button"
                  onClick={handleSuggestAdmNo}
                  className="text-[10px] text-royal-700 font-bold hover:underline"
                >
                  Suggest Next
                </button>
              </div>
              <input
                type="text"
                required
                value={admNo}
                onChange={(e) => setAdmNo(e.target.value)}
                placeholder="e.g. 101 or BS-101"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500 font-mono font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Student Full Name *</label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Muhammad Bilal"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500 font-bold"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Father Name *</label>
              <input
                type="text"
                required
                value={father}
                onChange={(e) => setFather(e.target.value)}
                placeholder="e.g. Haji Abdul Rehman"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
          </div>

          {/* Current Class, Gender & DOB */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Current Class *</label>
              <select
                required
                value={cls}
                onChange={(e) => setCls(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-royal-500"
              >
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {formatClassLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender *</label>
              <select
                required
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-royal-500"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">Date of Birth *</label>

              </div>
              <input
                type="date"
                required
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
          </div>

          {/* Admission & Withdrawal History (for SLC) */}
          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 grid grid-cols-1 sm:grid-cols-4 gap-2.5 text-xs">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Adm Class *</label>
              <select
                required
                value={admClass}
                onChange={(e) => setAdmClass(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white font-semibold focus:outline-none focus:ring-2 focus:ring-royal-500"
              >
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {formatClassLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Adm Date *</label>
              <input
                type="date"
                required
                value={admDate}
                onChange={(e) => setAdmDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Withdraw Class</label>
              <select
                value={leaveClass}
                onChange={(e) => setLeaveClass(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-royal-500"
              >
                <option value="">-- None --</option>
                {SCHOOL_CLASSES.map((c) => (
                  <option key={c} value={c}>
                    {formatClassLabel(c)}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Withdraw Date</label>
              <input
                type="date"
                value={leaveDate}
                onChange={(e) => setLeaveDate(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
          </div>

          {/* B-Form, Father CNIC & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Student B-Form # *</label>
              <input
                type="text"
                required
                value={bform}
                onChange={(e) => setBform(e.target.value)}
                placeholder="32303-1234567-1"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500 font-mono"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Father CNIC No *</label>
              <input
                type="text"
                required
                value={fatherCnic}
                onChange={(e) => setFatherCnic(e.target.value)}
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

          {/* Fee, Address & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Monthly Fee (Rs.) *</label>
              <input
                type="number"
                required
                min={0}
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500 font-bold"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Residential Address *</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Basti Jaisal Wain, Jhang Road, Muzaffargarh"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-royal-500"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 mb-1">Admission Status *</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-royal-500"
              >
                <option value="Active">Active Student</option>
                <option value="Left">Left / SLC Issued</option>
              </select>
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleModalClose}
              disabled={isSubmitting || isUploadingPhoto || isRemovingPhoto}
              className="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isUploadingPhoto || isRemovingPhoto}
              className="px-6 py-2.5 rounded-xl bg-royal-800 hover:bg-royal-900 text-white font-bold shadow-md transition disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isSubmitting && (
                <svg className="animate-spin w-4 h-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              )}
              {isSubmitting ? "Saving Student…" : "Save Student Record"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
