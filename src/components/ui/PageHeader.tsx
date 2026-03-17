"use client";

import { Target } from "lucide-react";
import Link from "next/link";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  breadcrumb?: { name: string; href?: string }[];
  actions?: React.ReactNode;
  headerImage?: string;
  guidingQuestion?: string;
}

export default function PageHeader({
  title,
  subtitle,
  breadcrumb,
  actions,
  headerImage,
  guidingQuestion,
}: PageHeaderProps) {
  const imageMode = Boolean(headerImage);

  return (
    <div
      className={`relative mb-5 overflow-hidden rounded-[1.5rem] border border-slate-200/80 ${
        imageMode ? "min-h-[220px] md:min-h-[240px] lg:min-h-[250px]" : "bg-white"
      }`}
    >
      {headerImage ? (
        <div className="absolute inset-0 z-0">
          <img src={headerImage} alt="" className="h-full w-full object-cover brightness-[0.62]" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/40 to-slate-950/15" />
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950/45 via-transparent to-transparent" />
        </div>
      ) : null}

      <div className={`relative z-20 px-5 md:px-7 ${imageMode ? "pb-6 pt-6 md:pb-7 md:pt-6" : "pb-5 pt-5"}`}>
        <nav className="mb-4 flex items-center gap-3">
          <div
            className={`rounded-xl border px-3 py-1.5 ${
              imageMode ? "border-white/15 bg-slate-950/25 backdrop-blur-md" : "border-slate-200 bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <Link
                href="/"
                className={`text-[8px] font-black uppercase tracking-[0.22em] ${
                  imageMode ? "text-white/60 hover:text-white" : "text-slate-500 hover:text-slate-900"
                }`}
              >
                GIC
              </Link>
              {breadcrumb?.map((crumb, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`h-1 w-1 rounded-full ${imageMode ? "bg-white/30" : "bg-slate-300"}`} />
                  {crumb.href ? (
                    <Link
                      href={crumb.href}
                      className={`text-[8px] font-black uppercase tracking-[0.22em] ${
                        imageMode ? "text-white/60 hover:text-white" : "text-slate-500 hover:text-slate-900"
                      }`}
                    >
                      {crumb.name}
                    </Link>
                  ) : (
                    <span
                      className={`text-[8px] font-black uppercase tracking-[0.22em] ${
                        imageMode ? "text-white" : "text-slate-800"
                      }`}
                    >
                      {crumb.name}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </nav>

        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div className="flex-1">
            {guidingQuestion ? (
              <div
                className={`mb-3 flex items-start gap-3 rounded-xl border p-3 ${
                  imageMode ? "border-white/15 bg-slate-950/25 backdrop-blur-md" : "border-blue-100 bg-blue-50"
                }`}
              >
                <div className={`rounded-lg p-1.5 ${imageMode ? "bg-white/10" : "bg-gic-blue/10"}`}>
                  <Target className={`h-4 w-4 ${imageMode ? "text-white" : "text-gic-blue"}`} />
                </div>
                <div className="space-y-1">
                  <p
                    className={`text-[9px] font-black uppercase tracking-[0.22em] ${
                      imageMode ? "text-white/70" : "text-gic-blue"
                    }`}
                  >
                    Strategic Objective
                  </p>
                  <p className={`text-sm font-bold leading-tight ${imageMode ? "text-white" : "text-slate-900"}`}>
                    {guidingQuestion}
                  </p>
                </div>
              </div>
            ) : null}

            <h1 className={`mb-2 text-display-lg leading-[0.96] tracking-tight ${imageMode ? "text-white" : "text-slate-900"}`}>
              {title}
            </h1>
            <p className={`max-w-3xl text-sm font-medium leading-relaxed md:text-[15px] ${imageMode ? "text-white/78" : "text-slate-600"}`}>
              {subtitle}
            </p>
          </div>

          {actions ? (
            <div
              className={`flex max-w-full flex-wrap items-center gap-2 rounded-xl border p-2 ${
                imageMode ? "border-white/15 bg-slate-950/25 backdrop-blur-md" : "border-slate-200 bg-white shadow-sm"
              }`}
            >
              {actions}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
