"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  Activity,
  BarChart3,
  Briefcase,
  Database,
  MapPin,
  Users,
  Menu,
  X,
  ShieldCheck,
  Target,
  FileText,
  Maximize2,
  Cpu
} from "lucide-react";

const navigation = [
  {
    name: "State of the Province",
    href: "/executive/situation-report",
    icon: BarChart3,
    description: "What the province is experiencing overall",
  },
  {
    name: "Leadership Sentiment",
    href: "/executive/leadership",
    icon: Users,
    description: "How leaders are being perceived",
  },
  {
    name: "Municipalities and Wards",
    href: "/executive/municipalities-wards",
    icon: MapPin,
    description: "What is happening locally on the ground",
  },
  {
    name: "Social Media, News & Other Trends",
    href: "/executive/social-trends",
    icon: Activity,
    description: "What narratives and topics are rising now",
  },
  {
    name: "Investor Profiling",
    href: "/executive/investors",
    icon: Briefcase,
    description: "Which economic opportunities and investor matches exist",
  },
  {
    name: "Investor Identification",
    href: "/executive/investor-identification",
    icon: Database,
    description: "Search, filter, and save targeted investor profiles",
  },
  {
    name: "Automated Deal Room",
    href: "/executive/matchmaker",
    icon: Target,
    description: "AI-aligned investors and active funding targets",
  },
  {
    name: "Pitch & Readiness Generator",
    href: "/executive/pitch-generator",
    icon: FileText,
    description: "Generate 3-page PDF investment cases instantly",
  },
  {
    name: "Opportunity Matrix",
    href: "/executive/opportunity-matrix",
    icon: Maximize2,
    description: "Plot geometric risk versus commercial ROI",
  },
  {
    name: "Predictive Simulator",
    href: "/executive/impact-simulator",
    icon: Cpu,
    description: "Model downstream civic trajectories and impact",
  },
  {
    name: "Platform Methodology",
    href: "/executive/methodology",
    icon: ShieldCheck,
    description: "AI architecture, verifiable tracing & RAG frameworks",
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-[60] bg-slate-900 border border-slate-700 text-white p-4 rounded-full shadow-2xl print:hidden"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm print:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed inset-y-0 left-0 z-50 flex h-screen w-72 flex-col overflow-hidden border-r border-white/5 bg-slate-950 text-white transition-transform duration-300 md:relative md:translate-x-0 print:hidden ${isOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full"}`}
      >
        <div className="pointer-events-none absolute left-0 top-0 h-96 w-full bg-gic-gold/5 blur-[100px]" />

      <div className="relative z-10 px-8 pb-6 pt-8">
        <Link href="/" className="group block">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-gic-gold/20 opacity-0 blur-2xl transition-opacity group-hover:opacity-100" />
            <img
              src="/gic-logo.svg"
              alt="GIC Portal"
              className="h-10 w-auto brightness-0 invert opacity-90 transition-all group-hover:opacity-100"
            />
          </div>
        </Link>
        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.35em] text-white/35">
          Decision Intelligence
        </p>
      </div>

      <nav className="relative z-10 flex-1 space-y-3 overflow-y-auto p-6">
        <p className="mb-4 ml-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
          Dashboards
        </p>
        {navigation.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`group relative flex flex-col gap-1 overflow-hidden rounded-[2rem] px-5 py-4 transition-all ${
                isActive
                  ? "border border-white/10 bg-white/10 text-white"
                  : "text-slate-500 hover:bg-white/5 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={`h-4 w-4 transition-all duration-500 ${
                    isActive ? "text-gic-gold" : "group-hover:text-white"
                  }`}
                />
                <span
                  className={`text-[11px] font-black uppercase tracking-widest transition-colors ${
                    isActive ? "text-white" : "group-hover:text-white"
                  }`}
                >
                  {item.name}
                </span>
              </div>
              <p
                className={`ml-7 text-[9px] font-medium leading-relaxed transition-colors ${
                  isActive
                    ? "text-slate-400"
                    : "text-slate-600 group-hover:text-slate-400"
                }`}
              >
                {item.description}
              </p>

              {isActive ? (
                <div className="absolute right-4 top-1/2 h-1 w-1 -translate-y-1/2 rounded-full bg-gic-gold shadow-gic-glow" />
              ) : null}
            </Link>
          );
        })}
      </nav>
    </aside>
    </>
  );
}
