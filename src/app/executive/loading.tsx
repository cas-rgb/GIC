export default function Loading() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950 font-sans">
      <div className="flex flex-col items-center justify-center gap-6">
        <div className="relative w-32 h-32 flex items-center justify-center">
          {/* Outer Pulsing Ring */}
          <div className="absolute inset-0 rounded-full border-2 border-gic-gold opacity-20 blur-sm animate-[ping_3s_ease-in-out_infinite]" />
          
          {/* Inner Spinning Ring */}
          <div className="absolute inset-2 rounded-full border border-dashed border-white/30 animate-[spin_4s_linear_infinite]" />
          
          {/* Core Logo */}
          <div className="relative w-20 h-20 animate-pulse">
            <img
              src="/gic-logo.svg"
              alt="GIC Intelligence"
              className="w-full h-full object-contain brightness-0 invert"
            />
          </div>
        </div>

        <div className="text-center space-y-2">
          <h2 className="text-white text-lg font-black tracking-[0.3em] uppercase">
            Initializing Intelligence
          </h2>
          <div className="flex items-center justify-center gap-2">
             <div className="w-1.5 h-1.5 bg-gic-gold rounded-full animate-bounce [animation-delay:-0.3s]"></div>
             <div className="w-1.5 h-1.5 bg-gic-gold rounded-full animate-bounce [animation-delay:-0.15s]"></div>
             <div className="w-1.5 h-1.5 bg-gic-gold rounded-full animate-bounce"></div>
          </div>
          <p className="text-slate-500 text-xs font-bold tracking-widest uppercase">
            Synthesizing Strategic Priorities
          </p>
        </div>
      </div>
    </div>
  );
}
