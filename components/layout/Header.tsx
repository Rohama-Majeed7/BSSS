"use client";

import React from "react";
import { signOut } from "next-auth/react";
import Icon from "../ui/Icon";
import { SCHOOL_INFO } from "@/lib/constants";
import { usePwa } from "../providers/PwaProvider";

interface HeaderProps {
  pageTitle: string;
  onExportExcel: () => void;
  onPrintRegisters: () => void;
  onAdmitStudent: () => void;
  onToggleMobileMenu?: () => void;
  customLogo?: string;
}

export const Header: React.FC<HeaderProps> = ({
  pageTitle,
  onExportExcel,
  onPrintRegisters,
  onAdmitStudent,
  onToggleMobileMenu,
  customLogo,
}) => {
  const { isInstallable, isInstalled, promptInstall } = usePwa();

  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-6 lg:px-8 py-3 flex flex-wrap justify-between items-center gap-3 sticky top-0 z-20 shadow-sm">
      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
        {/* Mobile Hamburger Button */}
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="lg:hidden p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 flex-shrink-0"
            aria-label="Toggle Navigation"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        )}

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white border-2 border-royal-900 p-0.5 shadow-sm overflow-hidden flex-shrink-0 flex items-center justify-center">
          {customLogo ? (
            <img src={customLogo} alt="Logo" className="w-full h-full object-cover rounded-full" />
          ) : (
            <div className="w-full h-full rounded-full bg-royal-900 flex flex-col items-center justify-center text-center">
              <span className="text-[6px] font-extrabold text-gold-400 leading-none">BSS</span>
              <span className="text-[4px] text-white leading-none">ACADEMY</span>
            </div>
          )}
        </div>
        <div className="min-w-0">
          <h2 className="text-sm sm:text-lg lg:text-xl font-extrabold text-royal-900 leading-tight truncate">
            {pageTitle}
          </h2>

        </div>
      </div>

      <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
        {isInstallable && !isInstalled && (
          <button
            type="button"
            onClick={promptInstall}
            className="inline-flex items-center gap-1 sm:gap-1.5 bg-amber-400 hover:bg-amber-300 text-royal-950 text-[11px] sm:text-xs font-extrabold px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl shadow-xs transition touch-manipulation"
            title="Install Bright Stars SMS as an App"
          >
            <Icon name="download" className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Install App</span>
          </button>
        )}

        <button
          type="button"
          onClick={onExportExcel}
          className="inline-flex items-center gap-1 sm:gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] sm:text-xs font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl shadow-sm transition touch-manipulation"
        >
          <Icon name="excel" className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export Excel</span>
          <span className="sm:hidden">Excel</span>
        </button>

        <button
          type="button"
          onClick={onPrintRegisters}
          className="inline-flex items-center gap-1 sm:gap-1.5 bg-sky-50 hover:bg-sky-100 text-royal-900 border border-sky-200 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition touch-manipulation"
        >
          <Icon name="print" className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Print Registers</span>
          <span className="md:hidden">Print</span>
        </button>

        <button
          type="button"
          onClick={onAdmitStudent}
          className="inline-flex items-center gap-1 sm:gap-1.5 bg-royal-800 hover:bg-royal-900 text-white text-[11px] sm:text-xs font-bold px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl shadow-md transition touch-manipulation"
        >
          <Icon name="plus" className="w-3.5 h-3.5 text-gold-400" />
          <span>Admit</span>
        </button>

        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="inline-flex items-center gap-1 sm:gap-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-[11px] sm:text-xs font-bold px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl transition touch-manipulation"
          title="Sign Out"
        >
          <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
