"use client";

import { motion } from "framer-motion";
import PageHeader from "@/components/ui/PageHeader";
import GICCard from "@/components/ui/GICCard";
import { ShieldCheck, Database, BrainCircuit, Search, Lock, Code2 } from "lucide-react";

export default function MethodologyPage() {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 pb-32">
      <PageHeader
        title="Institutional Reliability & Methodology"
        subtitle="Transparency, Verification, and Autonomous Architecture"
        guidingQuestion="How does the GIC Intelligence Platform acquire, verify, and process its strategic insights?"
        headerImage="/projects/MAJWEMASWEU-X5-1688-1024x683.webp"
        breadcrumb={[{ name: "Methodology" }]}
      />

      <motion.div 
        variants={container}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 gap-8 lg:grid-cols-12"
      >
        {/* Core Principles Section */}
        <motion.div variants={item} className="lg:col-span-12">
          <GICCard premium title="The Mandate of Trust" subtitle="Verifiable Intelligence" icon={<ShieldCheck className="h-5 w-5" />}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                {
                  title: "Defensible Claims",
                  desc: "Every AI-generated insight is bound to a physical database row. No summary is permitted without structural citation arrays [1], [2].",
                  icon: <Lock className="h-5 w-5 text-gic-gold" />
                },
                {
                  title: "Hyper-Local Taxonomy",
                  desc: "Intelligence cannot be 'vague'. Every data point must be structurally classified down to the exact Municipality and Ward before persisting.",
                  icon: <Search className="h-5 w-5 text-blue-500" />
                },
                {
                  title: "Zero Hallucination Tolerance",
                  desc: "Processing limits are strictly enforced. System loops fetch secondary context autonomously rather than allowing statistical guessing.",
                  icon: <BrainCircuit className="h-5 w-5 text-emerald-500" />
                }
              ].map((principle, i) => (
                <div key={i} className="p-6 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col gap-4">
                  <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-sm self-start">
                    {principle.icon}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-2">{principle.title}</h3>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed">{principle.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </GICCard>
        </motion.div>

        {/* 3-Tier Architecture Diagram */}
        <motion.div variants={item} className="lg:col-span-12">
          <GICCard title="The 3-Tier Enterprise Stack" subtitle="Air-Gapped Processing Layers" icon={<Database className="h-5 w-5" />}>
             <div className="flex flex-col md:flex-row gap-8 items-stretch pt-6">
                
                {/* Tier 1 */}
                <div className="flex-1 bg-gradient-to-b from-slate-900 to-slate-950 rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                     <Database className="w-32 h-32 text-white" />
                   </div>
                   <div className="relative z-10 mb-8">
                      <span className="text-[10px] font-black uppercase text-gic-gold tracking-widest bg-gic-gold/10 px-3 py-1.5 rounded-full border border-gic-gold/20">Layer 1: Acquisition</span>
                      <h3 className="text-2xl font-black text-white mt-4 mb-2">Ingestion & Persistence</h3>
                      <p className="text-sm text-slate-400">Nightly autonomous workers run at 2:00 AM executing iterative data extractions across 9 provinces and 100+ municipalities simultaneously.</p>
                   </div>
                   <div className="relative z-10 space-y-2">
                     <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs font-bold text-white/80">PostgreSQL (pgvector)</div>
                     <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs font-bold text-white/80">Deep Data Extraction API</div>
                     <div className="bg-white/5 border border-white/10 p-3 rounded-xl text-xs font-bold text-white/80">Cron Automation</div>
                   </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex flex-col justify-center items-center">
                   <div className="w-8 h-px bg-slate-300"></div>
                </div>

                {/* Tier 2 */}
                <div className="flex-1 bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden flex flex-col justify-between">
                   <div className="relative z-10 mb-8">
                      <span className="text-[10px] font-black uppercase text-blue-600 tracking-widest bg-blue-50 px-3 py-1.5 rounded-full border border-blue-100">Layer 2: Logic</span>
                      <h3 className="text-2xl font-black text-slate-900 mt-4 mb-2">Analytics & Modeling</h3>
                      <p className="text-sm text-slate-600">Raw database rows are mathematically sorted and aggregated. Risk scores and investor mapping occur strictly mathematically without LLM interference.</p>
                   </div>
                   <div className="relative z-10 space-y-2">
                     <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-slate-700">Cosine Similarity Matching</div>
                     <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-slate-700">Geo-Spatial Taxonomies</div>
                     <div className="bg-slate-50 border border-slate-100 p-3 rounded-xl text-xs font-bold text-slate-700">Trend Acceleration Curves</div>
                   </div>
                </div>

                {/* Arrow */}
                <div className="hidden md:flex flex-col justify-center items-center">
                   <div className="w-8 h-px bg-slate-300"></div>
                </div>

                {/* Tier 3 */}
                <div className="flex-1 bg-gic-blue rounded-3xl p-8 relative overflow-hidden flex flex-col justify-between">
                   <div className="absolute top-0 right-0 p-8 opacity-10">
                     <BrainCircuit className="w-32 h-32 text-white" />
                   </div>
                   <div className="relative z-10 mb-8">
                      <span className="text-[10px] font-black uppercase text-white tracking-widest bg-white/20 px-3 py-1.5 rounded-full border border-white/30">Layer 3: Processing</span>
                      <h3 className="text-2xl font-black text-white mt-4 mb-2">Generative Presentation</h3>
                      <p className="text-sm text-white/80">The predictive models never fetch data themselves. They strictly ingest structurally formatted JSON from Layer 2 to generate human-readable Strategic Briefings with absolute context grounding.</p>
                   </div>
                   <div className="relative z-10 space-y-2">
                     <div className="bg-white/10 border border-white/20 p-3 rounded-xl text-xs font-bold text-white">Advanced Generative Modeling</div>
                     <div className="bg-white/10 border border-white/20 p-3 rounded-xl text-xs font-bold text-white">Generative PDF Matrix</div>
                     <div className="bg-white/10 border border-white/20 p-3 rounded-xl text-xs font-bold text-white">Mathematical Trust Citations</div>
                   </div>
                </div>

             </div>
          </GICCard>
        </motion.div>

        {/* Implementation Details */}
        <motion.div variants={item} className="lg:col-span-12 grid grid-cols-1 md:grid-cols-2 gap-8">
           <GICCard title="The RAG Integrity Loop" subtitle="Retrieval Augmented Generation" icon={<Code2 className="h-5 w-5" />}>
             <div className="text-sm text-slate-600 leading-relaxed space-y-4">
               <p>
                 To ensure the platform operates as a Command Center and not a simple chat-bot, it leverages a strict <strong>Vector RAG Architecture</strong>. 
               </p>
               <p>
                 All external media, news incidents, and reports are processed through an embedding model (`text-embedding-004`) translating sentences into dimensional vectors. When an Executive requests a <em>Deep Investigation</em> into an entity, the system calculates the geometric `Cosine Similarity` between the entity's vector and the PostgreSQL Vault.
               </p>
               <p>
                 The predictive engine is then provided <strong>only</strong> the top 5 physically verified data rows, and is explicitly instructed to cite them via <code>[1], [2]</code> indices, ensuring absolute accountability.
               </p>
             </div>
           </GICCard>

           <GICCard title="Generative Dossier Printing" subtitle="html2pdf.js Ecosystem" icon={<ShieldCheck className="h-5 w-5" />}>
             <div className="text-sm text-slate-600 leading-relaxed space-y-4">
               <p>
                 Enterprise users require physical and distribution-ready analytical assets. Standard dashboard capturing techniques pollute documents with navigation bars, buttons, and responsive grid layouts.
               </p>
               <p>
                 The Dashboard employs a deeply decoupled printing architecture. Whenever <strong>Export PDF</strong> is triggered, the system temporarily unmasks an invisible, A4-perfect DOM tree completely rebuilt for print compliance.
               </p>
               <p>
                 This ensures every physical Dossier leaving the platform contains official GIC watermarks, explicit generation timestamps, and strictly academic structural layouts perfectly aligned with Top-Tier Institutional standards.
               </p>
             </div>
           </GICCard>
        </motion.div>

      </motion.div>
    </div>
  );
}
