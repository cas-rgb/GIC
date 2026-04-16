"use client";
import { useState, useEffect } from "react";
import { Search, BrainCircuit, Loader2, AlertCircle } from "lucide-react";
import JitExecutiveDossier, { JitDossierPayload } from "@/components/analytics/JitExecutiveDossier";

function PremiumLoadingState() {
  const [progress, setProgress] = useState(0);
  const [stage, setStage] = useState(0);
  
  const stages = [
    "Initializing Neural Matrices...",
    "Thinking & Correlating Data...",
    "Researching Global Indices...",
    "Compiling Strategic Intelligence...",
    "Analyzing Synthesized Insights..."
  ];

  useEffect(() => {
    const pTimer = setInterval(() => {
      setProgress(p => {
        const next = p + (Math.random() * 3);
        return next > 99 ? 99 : next;
      });
    }, 250);

    const sTimer = setInterval(() => {
      setStage(s => (s < stages.length - 1 ? s + 1 : s));
    }, 3000);

    return () => {
      clearInterval(pTimer);
      clearInterval(sTimer);
    };
  }, []);

  return (
    <div className="bg-slate-950 border border-slate-800 rounded-[2rem] p-16 flex flex-col items-center justify-center min-h-[400px] shadow-2xl relative overflow-hidden mt-8 mb-12">
      <div className="absolute top-0 right-0 w-64 h-64 bg-gic-gold/5 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full pointer-events-none" />
      
      <BrainCircuit className="w-16 h-16 text-gic-gold animate-pulse mb-8 relative z-10" />
      
      <h3 className="text-2xl md:text-3xl font-display font-black text-white uppercase tracking-widest mb-10 relative z-10 text-center animate-pulse">
        {stages[stage]}
      </h3>
      
      <div className="w-full max-w-xl relative z-10">
        <div className="flex justify-between items-end mb-3">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Confidence Matrix Synthesis</span>
          <span className="text-xl font-display font-black text-gic-gold">{Math.floor(progress)}%</span>
        </div>
        <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden border border-slate-800">
          <div 
            className="h-full bg-gradient-to-r from-gic-gold/50 to-gic-gold rounded-full transition-all duration-300 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}

interface LeadershipDashboardClientProps {
  province: string;
  municipality?: string | null;
  ward?: string | null;
  days?: number;
}

function getSuggestedLeaders(province: string, municipality?: string | null, ward?: string | null): string[] {
  if (municipality && municipality !== "All Municipalities") {
    switch (municipality) {
      case "Johannesburg":
        return ["Dada Morero", "Kabelo Gwamanda", "Dr Mpho Phalatse", "Herman Mashaba", "Kenny Kunene", "Parks Tau"];
      case "Tshwane":
        return ["Nasiphi Moya", "Cilliers Brink", "Kgosi Maepa", "Solly Msimanga", "Randall Williams", "Obed Bapela"];
      case "Ekurhuleni":
        return ["Nkosindiphile Xhakaza", "Sivuyile Ngodwana", "Tania Campbell", "Mzwandile Masina", "Ndosi Shongwe"];
      case "Cape Town":
        return ["Geordin Hill-Lewis", "JP Smith", "Patricia de Lille", "Zahid Badroodien", "Mcebisi Skwatsha", "Dan Plato"];
      case "eThekwini":
        return ["Cyril Xaba", "Mxolisi Kaunda", "Zandile Gumede", "Thabani Nyawose", "Nicole Graham", "Zwakhele Mncwango"];
      case "Nelson Mandela Bay":
        return ["Gary van Niekerk", "Eugene Johnson", "Retief Odendaal", "Athol Trollip", "Nqaba Bhanga"];
      case "Mangaung":
        return ["Gregory Nthatisi", "Mxolisi Siyonzana", "Mwelo Nonkonyana", "Afsien Jansen"];
      case "Buffalo City":
        return ["Princess Faku", "Xola Pakati", "Zukiswa Ncitha"];
      // Fallthrough for generic municipalities to show province leaders
    }
  }

  if (province && province !== "All Provinces") {
    switch (province) {
      case "Gauteng":
        return ["Panyaza Lesufi", "Solly Msimanga", "Herman Mashaba", "Dada Morero", "Lebogang Maile", "Nasiphi Moya"];
      case "Western Cape":
        return ["Alan Winde", "Geordin Hill-Lewis", "Anton Bredell", "Albert Fritz", "Khalid Sayed", "JP Smith"];
      case "KwaZulu-Natal":
        return ["Thami Ntuli", "Siboniso Duma", "Cyril Xaba", "Nomusa Dube-Ncube", "Francois Rodgers", "Sihle Zikalala"];
      case "Eastern Cape":
        return ["Oscar Mabuyane", "Nqaba Bhanga", "Babalo Madikizela", "Stella Ndabeni-Abrahams", "Gary van Niekerk"];
      case "Limpopo":
        return ["Phophi Ramathuba", "Stanley Mathabatha", "Florence Radzilani", "Nakedi Sibanda-Kekana", "Cassell Mathale"];
      case "Mpumalanga":
        return ["Mandla Ndlovu", "Refilwe Mtshweni-Tsipane", "Speedy Mashilo", "Sibusiso Malaza"];
      case "North West":
        return ["Lazarus Mokgosi", "Bushy Maape", "Supra Mahumapelo", "Mothibedi Kegakilwe"];
      case "Free State":
        return ["Maqueen Letsoha-Mathae", "Mxolisi Dukwana", "Sisi Ntombela", "Ace Magashule", "Roy Jankielsohn"];
      case "Northern Cape":
        return ["Zamani Saul", "Sylvia Lucas", "Deshi Ngxanga", "Abraham Vosloo"];
    }
  }

  return [
    "President Cyril Ramaphosa",
    "John Steenhuisen",
    "Julius Malema",
    "Paul Mashatile",
    "Gwede Mantashe",
    "Panyaza Lesufi",
    "Alan Winde",
    "Jacob Zuma"
  ];
}

export default function LeadershipDashboardClient({ province, municipality, ward, days }: LeadershipDashboardClientProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [dossier, setDossier] = useState<JitDossierPayload | null>(null);
  const [error, setError] = useState("");

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setDossier(null);
    setError("");

    try {
      const res = await fetch("/api/analytics/investigate-leader", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leaderName: query, province })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Investigation failed");
      
      setDossier({ leaderName: query, province, ...data });
    } catch (err: any) {
      setError(err.message || "Failed to synthesize intelligence. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <div className="bg-slate-900 border border-white/10 rounded-[2rem] p-8 md:p-12 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BrainCircuit className="w-96 h-96" />
        </div>
        
        <div className="max-w-3xl relative z-10">
          <h2 className="text-3xl md:text-4xl font-display font-black text-white mb-4 uppercase tracking-wide">
            Dynamic Target Investigation
          </h2>
          <p className="text-slate-400 mb-10 max-w-2xl font-inter text-lg leading-relaxed">
            Enter the exact name of any political figure, leader, or official. The Intelligence matrix will instantly deploy autonomous web-scrapers to synthesize a massive, hyper-detailed strategic dossier on their current standing, controversies, and institutional momentum.
          </p>

          <form onSubmit={handleSearch} className="relative flex flex-col gap-6">
            <div className="flex flex-wrap gap-3">
              {getSuggestedLeaders(province, municipality, ward).map(leader => (
                <button
                  key={leader}
                  type="button"
                  onClick={(e) => {
                    setQuery(leader);
                  }}
                  className={`px-4 py-2 rounded-xl border text-sm font-bold transition-all ${query === leader ? 'bg-gic-gold text-slate-900 border-gic-gold' : 'bg-slate-900 text-slate-300 border-slate-700 hover:border-slate-500'}`}
                >
                  {leader}
                </button>
              ))}
            </div>
            
            <div className="relative flex items-center mt-2">
              <Search className="absolute left-6 w-6 h-6 text-slate-500" />
              <input 
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Or type any other political figure..."
                className="w-full bg-slate-950 border border-slate-700/50 rounded-2xl py-6 pl-16 pr-40 md:pr-48 text-lg text-white font-inter focus:outline-none focus:ring-2 focus:ring-gic-gold focus:border-gic-gold transition-all shadow-inner"
                disabled={loading}
              />
              <button 
                 type="submit"
                 disabled={loading || !query.trim()}
                 className="absolute right-3 top-3 bottom-3 bg-gic-gold text-slate-900 hover:bg-yellow-400 px-6 md:px-8 rounded-xl font-black uppercase tracking-widest text-xs transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> <span className="hidden md:inline">Synthesizing</span></>
                ) : (
                  <><BrainCircuit className="w-4 h-4" /> <span className="hidden md:inline">Launch Intelligence Matrix</span></>
                )}
              </button>
            </div>
          </form>
          {error && <p className="text-rose-500 mt-4 text-sm font-bold flex items-center gap-2 bg-rose-500/10 px-4 py-2 rounded-lg border border-rose-500/20 w-max"><AlertCircle className="w-4 h-4" /> {error}</p>}
        </div>
      </div>

      {loading && (
        <PremiumLoadingState />
      )}

      {dossier && !loading && (
        <JitExecutiveDossier data={dossier} />
      )}
    </div>
  );
}
