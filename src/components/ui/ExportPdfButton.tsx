"use client";

import { Download } from "lucide-react";
import { useState } from "react";

export default function ExportPdfButton({ imageMode, targetId }: { imageMode?: boolean, targetId?: string }) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    try {
      setIsExporting(true);
      
      // Native print dialogue ensures perfect CSS fidelity over HTML2Canvas
      if (targetId) {
        const element = document.getElementById(targetId);
        if (element) {
          const originalDisplay = element.style.display;
          const originalPosition = element.style.position;
          
          element.style.display = "block";
          element.style.position = "static";
          
          window.print();
          
          element.style.display = originalDisplay;
          element.style.position = originalPosition;
        }
      } else {
        window.print();
      }

    } catch (error) {
      console.error("PDF Export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className={`flex items-center gap-2 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed ${
        imageMode 
          ? "bg-white/10 text-white border border-white/20 hover:bg-white/20" 
          : "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:text-blue-600"
      }`}
    >
      <Download className={`w-3.5 h-3.5 ${isExporting ? "animate-bounce" : ""}`} />
      <span>{isExporting ? "Generating Dossier..." : "Export PDF"}</span>
    </button>
  );
}
