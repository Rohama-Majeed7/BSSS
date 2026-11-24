"use client";

import React, { useRef } from "react";
import { signOut } from "next-auth/react";
import Icon from "../ui/Icon";
import { SCHOOL_INFO } from "@/lib/constants";
import { usePwa } from "../providers/PwaProvider";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  onAdmitClick: () => void;
  onBackupClick?: () => void;
  customLogo?: string;
  customSign?: string;
  onLogoUpload?: (dataUrl: string) => void;
  onSignUpload?: (dataUrl: string) => void;
  isSaved?: boolean;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  onBackupClick,
  customLogo,
  customSign,
  onLogoUpload,
  onSignUpload,
  isSaved = true,
  isOpenOnMobile = false,
  onCloseMobile,
}) => {
  const logoInputRef = useRef<HTMLInputElement>(null);
  const signInputRef = useRef<HTMLInputElement>(null);
  const { isInstallable, isInstalled, promptInstall, mounted } = usePwa();

  const handleFile = (
    e: React.ChangeEvent<HTMLInputElement>,
    callback?: (url: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file || !callback) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const url = ev.target?.result as string;
      if (url) callback(url);
    };
    reader.readAsDataURL(file);
  };

  const navItems = [
    { id: "dashboard", label: "Dashboard", ico: "dashboard", color: "text-gold-400" },
    { id: "students", label: "Students ", ico: "students", color: "text-sky-400" },
    { id: "attendance", label: "Daily Attendance", ico: "attendance", color: "text-emerald-400" },
    { id: "fees", label: "Fees & Receipts", ico: "fees", color: "text-amber-400" },
    { id: "results", label: "Exams & Result Cards", ico: "results", color: "text-gold-400" },
    { id: "idcards", label: "ID Card Studio", ico: "idcard", color: "text-rose-400" },
    { id: "slc", label: "Leaving Cert (SLC)", ico: "cert", color: "text-amber-300" },
    { id: "staff", label: "Faculty & Payroll", ico: "staff", color: "text-purple-400" },
    { id: "excelhub", label: "Excel & Print Hub", ico: "excel", color: "text-emerald-400", special: true },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-950/60 z-30 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      <aside
        className={`w-full lg:w-72 bg-royal-900 text-white flex flex-col justify-between shadow-2xl flex-shrink-0 z-40 transition-all duration-200 ${isOpenOnMobile
          ? "fixed inset-y-0 left-0 max-w-xs overflow-y-auto"
          : "hidden lg:flex lg:h-screen lg:sticky lg:top-0 lg:overflow-y-auto"
          }`}
      >
        <div>
          {/* School Crest & Bilingual Header */}
          <div className="p-4 bg-royal-950/70 border-b border-royal-800 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white p-0.5 border-2 border-gold-400 shadow-lg flex-shrink-0 overflow-hidden flex items-center justify-center">
                <img src={customLogo || "/logo.png"} alt="Logo" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-white leading-snug truncate">
                  {SCHOOL_INFO.name}
                </h1>
                <p className="text-[10px] sm:text-[11px] text-sky-200 font-semibold truncate">
                  EMIS: {SCHOOL_INFO.emis}
                </p>

              </div>
            </div>

            {/* Mobile close button */}
            {onCloseMobile && (
              <button
                type="button"
                onClick={onCloseMobile}
                className="lg:hidden p-1.5 rounded-lg bg-royal-800 text-white hover:bg-royal-700"
              >
                &times;
              </button>
            )}
          </div>

          {/* Navigation Menu */}
          <nav className="p-3 grid grid-cols-1 gap-1 text-xs sm:text-sm font-medium">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              const isSpecial = item.special;
              let btnClass = "";
              if (isSpecial) {
                btnClass = isActive
                  ? "bg-emerald-800 text-white border border-emerald-400 shadow-sm"
                  : "text-emerald-200 hover:bg-emerald-900/70 hover:text-white border border-emerald-500/30";
              } else {
                btnClass = isActive
                  ? "bg-royal-800 text-white shadow-sm font-bold"
                  : "text-royal-200 hover:bg-royal-800 hover:text-white";
              }

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onTabChange(item.id);
                    if (onCloseMobile) onCloseMobile();
                  }}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl transition touch-manipulation ${btnClass}`}
                >
                  <Icon name={item.ico} className={`w-4 h-4 flex-shrink-0 ${item.color}`} />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>


        </div>


      </aside>
    </>
  );
};

export default Sidebar;
