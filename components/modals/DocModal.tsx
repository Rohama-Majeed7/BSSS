"use client";

import React from "react";

interface DocModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  onPrint: () => void;
  extraLeftButton?: React.ReactNode;
  children: React.ReactNode;
}

export const DocModal: React.FC<DocModalProps> = ({
  isOpen,
  onClose,
  title,
  onPrint,
  extraLeftButton,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-950/75 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl border border-slate-200 my-4 max-h-[95vh] flex flex-col justify-between">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-200">
          <h3 className="text-base sm:text-lg font-extrabold text-royal-900">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 text-2xl font-bold leading-none"
          >
            &times;
          </button>
        </div>

        {/* Document Content Viewport */}
        <div className="py-4 overflow-y-auto flex justify-center">{children}</div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-200 gap-2">
          <div>{extraLeftButton}</div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs"
            >
              Close
            </button>
            <button
              type="button"
              onClick={onPrint}
              className="px-5 py-2 rounded-xl bg-royal-800 hover:bg-royal-900 text-white font-extrabold text-xs shadow-md transition"
            >
              Print Document (A4)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocModal;
