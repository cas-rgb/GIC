"use client";

interface EvidenceFocusStripProps {
  label: string;
  activeIssue: string | null;
  options: string[];
  onSelectIssue: (issue: string) => void;
}

export default function EvidenceFocusStrip({
  label,
  activeIssue,
  options,
  onSelectIssue,
}: EvidenceFocusStripProps) {
  const uniqueOptions = options.filter(
    (option, index, array): option is string => Boolean(option) && array.indexOf(option) === index
  );

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.18em] text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-sm font-bold text-slate-900">
            {activeIssue ?? "No issue focus selected"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {uniqueOptions.map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => onSelectIssue(option)}
              className={`rounded-full px-3 py-2 text-[10px] font-black uppercase tracking-[0.15em] transition-colors ${
                activeIssue === option
                  ? "bg-blue-600 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
