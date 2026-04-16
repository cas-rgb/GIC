"use client";

import { useState } from "react";
import { Mail, CheckCircle2, Loader2, AlertTriangle } from "lucide-react";

interface ExportEmailButtonProps {
  investorId: string;
  investorName: string;
  className?: string;
}

export default function ExportEmailButton({ investorId, investorName, className = "" }: ExportEmailButtonProps) {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleDispatch = async () => {
    if (status === "loading" || status === "success") return;
    
    setStatus("loading");
    setMessage("Authenticating & Dispatching...");

    try {
      const res = await fetch("/api/investors/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          investorId,
          investorName,
          documentType: "Restricted Intelligence Dossier",
        })
      });

      if (!res.ok) throw new Error("Dispatch failed");

      const data = await res.json();
      
      setStatus("success");
      setMessage(data.message || "Dispatched via Secure Relay");
      
      // Reset after 4 seconds
      setTimeout(() => {
        setStatus("idle");
        setMessage(null);
      }, 4000);
      
    } catch (err) {
      console.error(err);
      setStatus("error");
      setMessage("Transmission Failed. Connection Refused.");
      
      setTimeout(() => {
        setStatus("idle");
        setMessage(null);
      }, 4000);
    }
  };

  if (status === "success") {
    return (
      <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all shadow-[0_0_20px_rgba(16,185,129,0.15)] ${className}`}>
        <CheckCircle2 className="w-4 h-4" />
        <span>Securely Sent</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className={`flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-bold transition-all shadow-[0_0_20px_rgba(244,63,94,0.15)] ${className}`}>
        <AlertTriangle className="w-4 h-4" />
        <span>Dispatch Failed</span>
      </div>
    );
  }

  return (
    <button
      onClick={handleDispatch}
      disabled={status === "loading"}
      className={`relative overflow-hidden group flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-70 disabled:cursor-not-allowed ${className}`}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 via-white/20 to-blue-400/0 translate-x-[-100%] group-hover:animate-[shimmer_2s_infinite]" />
      
      {status === "loading" ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Dispatching...</span>
        </>
      ) : (
        <>
          <Mail className="w-4 h-4" />
          <span>Send to Email</span>
        </>
      )}
    </button>
  );
}
