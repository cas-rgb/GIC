"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  BarChart3,
  Briefcase,
  Database,
  MapPin,
  Users,
} from "lucide-react";

const navigation = [
  {
    name: "State of the Province",
    href: "/executive/province",
    icon: BarChart3,
    description: "Provincial pressure, sentiment, evidence, and intervention priorities",
  },
  {
    name: "Leadership Sentiment",
    href: "/leadership-sentiment",
    icon: Users,
    description: "How leaders and offices are being associated with issues on the ground",
  },
  {
    name: "State of the Municipality & Wards",
    href: "/municipality-wards",
    icon: MapPin,
    description: "Municipality and ward-level pressure, citizen voice, and local action context",
  },
  {
    name: "Social Media, News & Other Trends",
    href: "/news",
    icon: Activity,
    description: "Trusted media, civic signals, and citizen voice trend monitoring",
  },
  {
    name: "Investor Profiling",
    href: "/investor-profiling",
    icon: Briefcase,
    description: "Project funding fit, investor alignment, and infrastructure opportunity mapping",
  },
  {
    name: "Data Coverage",
    href: "/data-coverage",
    icon: Database,
    description: "Verified source coverage across official, media, civic, research, and social layers",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="relative z-50 flex h-screen w-72 flex-col overflow-hidden border-r border-white/5 bg-slate-950 text-white">
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

      <nav className="relative z-10 flex-1 space-y-3 overflow-y-auto p-6 scrollbar-hide">
        <p className="mb-4 ml-4 text-[9px] font-black uppercase tracking-[0.3em] text-white/20">
          Dashboards
        </p>
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

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
                  isActive ? "text-slate-400" : "text-slate-600 group-hover:text-slate-400"
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
  );
}
