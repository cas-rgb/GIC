"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import {
  Lock,
  User,
  ChevronRight,
  ShieldCheck,
  AlertCircle,
} from "lucide-react";

export default function LoginView() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg(null);

    const result = await login(email, password);
    if (!result.success) {
      setErrorMsg(result.error || "Authentication failed. Access request denied.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] bg-white flex items-center justify-center p-6">
      {/* Minimalist background - extremely subtle pattern */}
      <div className="absolute inset-0 opacity-[0.02] pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/micro-fabrics.png')]" />

      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-[460px] bg-white rounded-[3rem] shadow-[0_40px_100px_rgba(0,0,0,0.03)] border border-slate-100/80 overflow-hidden relative"
      >
        {/* Subtle top accent bar */}
        <div className="h-1.5 w-full bg-slate-900" />

        <div className="p-12 pt-16">
          {/* Header: Elevated Branding */}
          <div className="flex flex-col items-center mb-12">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="mb-10 p-5 bg-slate-50 rounded-[2rem] border border-slate-100 shadow-sm"
            >
              <img
                src="/gic-logo.svg"
                alt="GIC"
                className="h-14 w-auto grayscale brightness-0 hover:grayscale-0 hover:brightness-100 transition-all duration-700"
              />
            </motion.div>
            <h1 className="text-3xl font-display font-black text-slate-900 tracking-tighter mb-3">
              Government Pulse Portal
            </h1>
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-gic-blue animate-pulse" />
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
                Government Insight & Response
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                Authorized Node Email
              </label>
              <div className="relative group">
                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@approved-domain.com"
                  className="w-full bg-slate-50/50 border border-slate-100 focus:border-slate-900 px-14 py-5 rounded-[1.5rem] text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <div className="space-y-2.5">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                Security Protocol
              </label>
              <div className="relative group">
                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-slate-900 transition-colors" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-slate-50/50 border border-slate-100 focus:border-slate-900 px-14 py-5 rounded-[1.5rem] text-sm font-bold text-slate-900 outline-none transition-all placeholder:text-slate-300"
                  required
                />
              </div>
            </div>

            <AnimatePresence>
              {errorMsg && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-rose-50 border border-rose-100 rounded-2xl p-5 flex items-center gap-4 text-rose-600 shadow-sm"
                >
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                  <span className="text-[10px] font-black uppercase tracking-tight leading-snug">
                    {errorMsg}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <button
              disabled={isSubmitting}
              className={`w-full bg-slate-900 text-white flex items-center justify-center gap-4 py-5 rounded-[1.5rem] text-[11px] font-black uppercase tracking-[0.3em] shadow-2xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all active:scale-[0.98]
                                ${isSubmitting ? "opacity-70 cursor-not-allowed" : ""}
                            `}
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>Establish Connection</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        </div>

      </motion.div>
    </div>
  );
}
