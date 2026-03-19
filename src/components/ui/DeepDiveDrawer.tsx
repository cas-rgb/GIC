"use client";
/* eslint-disable react-hooks/set-state-in-effect */
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import clsx from "clsx";
interface DeepDiveDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}
export default function DeepDiveDrawer({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
}: DeepDiveDrawerProps) {
  const [shouldRender, setShouldRender] = useState(false);
  
  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      document.body.style.overflow = "hidden";
    } else {
      const timer = setTimeout(() => {
        setShouldRender(false);
        document.body.style.overflow = "unset";
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className={clsx(
          "absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0"
        )}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Drawer Panel */}
      <div
        className={clsx(
          "relative w-full max-w-4xl h-full bg-slate-50 shadow-2xl transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Drawer Header */}
        <div className="bg-white border-b border-slate-200 px-8 py-6 flex items-start justify-between shrink-0 sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-slate-900">
              {title}
            </h2>
            {subtitle && (
              <p className="text-sm font-medium text-slate-500 mt-1">
                {subtitle}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 -mr-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors focus:outline-none"
            title="Close Drawer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        {/* Drawer Content Area (Scrollable) */}
        <div className="flex-1 overflow-y-auto w-full p-8 shadow-inner">
          {children}
        </div>
      </div>
    </div>
  );
}
