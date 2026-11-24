"use client";

import React from "react";

interface ToastProps {
  message: string;
  isVisible: boolean;
  type?: "success" | "error" | "warning" | "info";
}

export const Toast: React.FC<ToastProps> = ({ message, isVisible, type = "success" }) => {
  if (!isVisible) return null;

  const styles = {
    success: {
      wrapper: "bg-royal-900 border-royal-700",
      dot: "bg-emerald-400",
    },
    error: {
      wrapper: "bg-rose-900 border-rose-700",
      dot: "bg-rose-300",
    },
    warning: {
      wrapper: "bg-amber-800 border-amber-600",
      dot: "bg-amber-300",
    },
    info: {
      wrapper: "bg-sky-900 border-sky-700",
      dot: "bg-sky-300",
    },
  }[type];

  return (
    <div
      className={`fixed bottom-5 right-5 z-[110] max-w-sm ${styles.wrapper} text-white px-5 py-3.5 rounded-2xl shadow-2xl border flex items-start gap-3 animate-bounce`}
      role="alert"
      aria-live="assertive"
    >
      <span className={`w-2.5 h-2.5 mt-0.5 rounded-full ${styles.dot} animate-pulse flex-shrink-0`} />
      <span className="text-xs sm:text-sm font-semibold leading-snug">{message}</span>
    </div>
  );
};

export default Toast;
