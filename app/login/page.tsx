"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { SCHOOL_INFO } from "@/lib/constants";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        password,
        redirect: false,
      });

      if (res?.error) {
        setError(res.error);
        setIsLoading(false);
      } else if (res?.ok) {
        router.push("/");
        router.refresh();
      } else {
        setError("Invalid email/username or password. Please try again.");
        setIsLoading(false);
      }
    } catch (err: any) {
      setError("An unexpected error occurred during login. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-royal-950 via-royal-900 to-sky-950 flex items-center justify-center p-4 sm:p-6 text-slate-800">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-royal-800/20 overflow-hidden">
        {/* Top Branding Banner */}
        <div className="bg-gradient-to-r from-royal-950 via-royal-900 to-sky-900 text-white p-6 sm:p-8 text-center relative">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white p-0.5 border-4 border-gold-400 mx-auto overflow-hidden shadow-xl flex items-center justify-center">
            <img
              src="/logo.png"
              alt="Bright Stars Science School Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <h1 className="text-base sm:text-lg font-extrabold tracking-tight mt-3 leading-snug">
            {SCHOOL_INFO.name}
          </h1>
          <p className="text-[11px] text-sky-200 font-semibold mt-0.5">
            EMIS: {SCHOOL_INFO.emis}
          </p>
          <p className="font-urdu text-sm text-gold-300 mt-1">{SCHOOL_INFO.urduName}</p>
          <div className="mt-3 inline-block px-3.5 py-1 rounded-full bg-gold-400 text-royal-950 text-[10px] font-extrabold uppercase tracking-wider">
            Admin Portal Access
          </div>
        </div>

        {/* Login Form Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div>
            <h2 className="text-lg font-extrabold text-royal-900">Sign In to Dashboard</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Enter your administrator credentials to manage school records.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2.5">
              <svg className="w-4 h-4 flex-shrink-0 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="block font-bold text-slate-700 mb-1.5">
                Admin Email  *
              </label>
              <input
                type="text"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder=""
                autoComplete="username"
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-royal-500 font-medium"
              />
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-bold text-slate-700">Password *</label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-[11px] text-royal-700 font-bold hover:underline"
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                autoComplete="current-password"
                className="w-full px-4 py-3 rounded-2xl border border-slate-300 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-royal-500 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 px-4 rounded-2xl bg-royal-800 hover:bg-royal-900 active:bg-royal-950 text-white font-extrabold text-sm shadow-md transition disabled:opacity-60 flex items-center justify-center gap-2 touch-manipulation"
            >
              {isLoading ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  <span>Authenticating...</span>
                </>
              ) : (
                <span>Sign In to Dashboard</span>
              )}
            </button>
          </form>

          {/* Institutional Security Notice */}
          <div className="pt-4 border-t border-slate-100 text-center">
            <p className="text-[11px] text-slate-400">
              Authorized personnel only • Protected by institutional credentials
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
