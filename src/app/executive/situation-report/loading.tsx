import ProgressSpinner from "@/components/ui/ProgressSpinner";

export default function SituationReportLoading() {
  return (
    <div className="w-full h-screen flex flex-col items-center justify-center bg-zinc-950 p-8 pt-32">
       <div className="max-w-2xl w-full text-center space-y-6">
          <ProgressSpinner 
             durationMs={12000} 
             message="Establishing connection to regional telemetry..." 
          />
          <p className="mt-4 text-xs font-black uppercase tracking-widest text-zinc-500 animate-pulse">
             Authenticating session...
          </p>
       </div>
    </div>
  );
}
