"use client";
import React, { useState } from 'react';
import { Download, Loader2, FileText, CheckCircle2 } from 'lucide-react';

interface GenerationLog {
  pillar: string;
  status: 'PENDING' | 'GENERATING' | 'COMPLETED' | 'FAILED';
}

export function ExecutiveBriefingGenerator() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [timeframe, setTimeframe] = useState("30");
  const [generationLogs, setGenerationLogs] = useState<GenerationLog[]>([
    { pillar: 'State of the Province', status: 'PENDING' },
    { pillar: 'Leadership Sentiment', status: 'PENDING' },
    { pillar: 'State of the Municipality', status: 'PENDING' },
    { pillar: 'Social & Emerging Trends', status: 'PENDING' },
    { pillar: 'Investor Profiling', status: 'PENDING' }
  ]);
  const [finalReport, setFinalReport] = useState<any[]>([]);

  const handleGenerate = async () => {
    setIsGenerating(true);
    setFinalReport([]);
    
    // Set all to GENERATING visually
    const initialLogs: GenerationLog[] = [
      { pillar: 'state_of_province', status: 'GENERATING' },
      { pillar: 'leadership_sentiment', status: 'GENERATING' },
      { pillar: 'state_of_municipality', status: 'GENERATING' },
      { pillar: 'social_trends', status: 'GENERATING' },
      { pillar: 'investor_profiling', status: 'GENERATING' }
    ];
    setGenerationLogs(initialLogs);

    const pillarKeys = initialLogs.map(l => l.pillar);
    
    try {
      // Fire 5 independent promises in parallel!
      const requests = pillarKeys.map(async (pillarKey, index) => {
        try {
          // Replace with real backend URL in production
          const response = await fetch('http://localhost:5001/gic-community-insights/us-central1/api/reports/generate-pillar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ pillar: pillarKey, province: 'Gauteng', days: Number(timeframe) })
          });
          
          if (!response.ok) throw new Error('Network response was not ok');
          const data = await response.json();
          
          // Update status in UI as they complete optimally
          setGenerationLogs(prev => prev.map((log, i) => i === index ? { ...log, status: 'COMPLETED' } : log));
          return { pillar: pillarKey, data };
        } catch (error) {
           setGenerationLogs(prev => prev.map((log, i) => i === index ? { ...log, status: 'FAILED' } : log));
           return { pillar: pillarKey, error: true };
        }
      });

      const results = await Promise.all(requests);
      setFinalReport(results);
      
      // Future step: Trigger JS-PDF or Print Dialog
      if (!results.some(r => r.error)) {
         setTimeout(() => window.print(), 1000);
      }
      
    } catch (e) {
      console.error("Master Generation Failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-xl border border-gray-800 bg-gray-950/50 backdrop-blur-xl shadow-2xl overflow-hidden">
      <div className="p-6 flex flex-col space-y-1.5">
         <div className="flex justify-between items-center">
            <div>
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <FileText className="w-5 h-5 text-yellow-500" />
                 Executive Briefing Generator
               </h3>
               <p className="text-sm text-gray-400 mt-1">
                 Dynamically sew 5 core intelligence pillars into a McKinsey-style PDF.
               </p>
            </div>
            <div className="flex items-center gap-4">
               <select 
                  value={timeframe} 
                  onChange={(e) => setTimeframe(e.target.value)} 
                  disabled={isGenerating}
                  className="flex h-10 w-[180px] items-center justify-between rounded-md border text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-black/50 border-gray-700 text-white px-3 py-2"
               >
                  <option value="30" className="bg-gray-900 text-white">Last 30 Days</option>
                  <option value="60" className="bg-gray-900 text-white">Last 60 Days</option>
                  <option value="90" className="bg-gray-900 text-white">Last 90+ Days</option>
               </select>
               
               <button 
                  onClick={handleGenerate} 
                  disabled={isGenerating} 
                  className="inline-flex items-center justify-center rounded-md text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold"
               >
                  {isGenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Download className="w-4 h-4 mr-2" />}
                  {isGenerating ? 'Compiling PDF...' : 'Generate AI Briefing'}
               </button>
            </div>
         </div>
      </div>
      <div className="p-6 pt-0">
         {isGenerating || finalReport.length > 0 ? (
            <div className="space-y-4">
               <h4 className="text-sm font-medium tracking-widest text-gray-500 uppercase">Synchronization Pipeline</h4>
               <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  {generationLogs.map((log, i) => (
                     <div key={i} className={`p-4 rounded-xl border flex flex-col gap-2 transition-all duration-500 ${
                        log.status === 'COMPLETED' ? 'bg-green-950/20 border-green-800/50' :
                        log.status === 'GENERATING' ? 'bg-yellow-950/20 border-yellow-800/50 animate-pulse' :
                        log.status === 'FAILED' ? 'bg-red-950/20 border-red-800/50' :
                        'bg-black/50 border-gray-800'
                     }`}>
                        <div className="text-xs uppercase font-semibold text-gray-400">Pillar {i+1}</div>
                        <div className="text-sm font-medium text-white line-clamp-2 leading-tight">
                           {log.pillar.replace(/_/g, ' ')}
                        </div>
                        <div className="mt-auto pt-2">
                           <div className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-semibold w-fit transition-colors ${
                              log.status === 'COMPLETED' ? 'text-green-400 border-green-400 bg-transparent' :
                              log.status === 'GENERATING' ? 'text-yellow-400 border-yellow-400 bg-transparent' :
                              log.status === 'FAILED' ? 'text-red-400 border-red-400 bg-transparent' :
                              'text-gray-500 border-gray-500 bg-transparent'
                           }`}>
                              {log.status === 'GENERATING' && <Loader2 className="w-3 h-3 mr-1 inline animate-spin" />}
                              {log.status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 mr-1 inline" />}
                              {log.status}
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
         ) : (
             <div className="h-40 flex items-center justify-center border border-dashed border-gray-800 rounded-xl bg-black/20">
               <p className="text-gray-500 text-sm">Select a timeframe and generate the intelligence briefing.</p>
             </div>
         )}
      </div>
    </div>
  );
}
