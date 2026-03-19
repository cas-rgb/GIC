"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";

interface GICCardProps {
  title?: string;
  subtitle?: string;
  icon?: ReactNode;
  children: ReactNode;
  premium?: boolean;
  gold?: boolean;
  className?: string;
  footer?: ReactNode;
  visual?: string; // URL for high-fidelity visual background
  simulating?: boolean;
}

export default function GICCard({
  title,
  subtitle,
  icon,
  children,
  premium,
  gold,
  className = "",
  footer,
  visual,
  simulating,
}: GICCardProps) {
  const simulationRows = Array.from({ length: 12 }, (_, i) => {
    const hexSeed = ((i + 1) * 1543)
      .toString(16)
      .toUpperCase()
      .padStart(4, "0")
      .slice(-4);
    const percentage = (((i + 1) * 8.25) % 100).toFixed(2);
    return {
      id: i,
      hex: hexSeed,
      percentage,
    };
  });

  let cardClass = "gic-card";
  if (premium) cardClass = "gic-card-premium";
  if (gold) cardClass = "gic-card-gold";

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.28, ease: [0.4, 0, 0.2, 1] }}
      className={`${cardClass} flex flex-col h-full ${className} relative overflow-hidden`}
    >
      {simulating && (
        <div className="absolute inset-0 z-50 pointer-events-none opacity-40">
          <div className="absolute top-4 right-4 text-[7px] font-mono text-gic-gold uppercase tracking-widest opacity-30">
            SUBSURFACE_DATA_LINK_001
          </div>
          <div className="p-10 font-mono text-[7px] text-gic-gold space-y-1 overflow-hidden">
            {simulationRows.map((row) => (
              <div key={row.id} className="flex gap-4">
                <span className="opacity-30">0x{row.hex}</span>
                <span className="animate-pulse">
                  INGESTING_GEOSPATIAL_{row.id}...
                </span>
                <span className="ml-auto opacity-50">{row.percentage}%</span>
              </div>
            ))}
          </div>
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-white to-transparent" />
        </div>
      )}

      {(title || icon) && (
        <div className="relative z-10 mb-5 flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-3">
            {icon && (
              <div
                className={`rounded-xl border p-2.5 ${premium ? "border-slate-900 bg-slate-900 text-white" : "border-slate-200 bg-slate-50 text-slate-500"}`}
              >
                {icon}
              </div>
            )}
            <div>
              {title && (
                <h3 className="mb-1 text-base font-display font-bold leading-tight tracking-tight text-slate-900 md:text-lg">
                  {title}
                </h3>
              )}
              {subtitle && (
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {visual && (
        <div className="absolute inset-0 z-0 overflow-hidden rounded-3xl opacity-20">
          <img
            src={visual}
            alt="Card visual background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" />
        </div>
      )}

      <div className="flex-1 relative z-10">{children}</div>

      {footer && (
        <div className="mt-6 border-t border-slate-100 pt-4">{footer}</div>
      )}
    </motion.div>
  );
}
