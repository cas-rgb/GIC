"use client";

import { useState, useEffect } from "react";
import { collection, query, where, getDocs, limit, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { MapPin, AlertCircle, HardHat, CheckCircle2, TrendingUp } from "lucide-react";

interface GicInternalProject {
  id: string;
  datasetId: string;
  municipality: string;
  province: string;
  payload: {
    projectName: string;
    status: string;
    scope?: string;
    impact?: string;
    projectType?: string;
  };
}

export default function UnderservedCommunitiesDashboard() {
  const [projects, setProjects] = useState<GicInternalProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const q = query(
          collection(db, "strategicDatasets"),
          where("domain", "==", "GICInternal"),
          limit(50)
        );
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as GicInternalProject));
        setProjects(data);
      } catch (err) {
        console.error("Failed to fetch underserved communities datasets", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-12 text-slate-400 font-black animate-pulse uppercase tracking-[0.2em] text-center border border-slate-200 bg-white shadow-sm">
        Initializing Priority Region Matrix...
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="bg-white border border-slate-200 p-12 text-center shadow-lg relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-gic-gold/5 via-transparent to-gic-blue/5 opacity-50"></div>
        <AlertCircle className="w-12 h-12 text-slate-300 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">Awaiting Ingestion</h3>
        <p className="text-slate-500 max-w-lg mx-auto">
          No data has been synced for priority underserved communities yet. The background ingestion pipeline requires execution for <code className="bg-slate-100 px-2 py-0.5 rounded text-slate-700 mx-1">sync-gic-internal-projects.ts</code>.
        </p>
      </div>
    );
  }

  // Group by province
  const groupedByProvince = projects.reduce((acc, project) => {
    const p = project.province || "Unknown Province";
    if (!acc[p]) acc[p] = [];
    acc[p].push(project);
    return acc;
  }, {} as Record<string, GicInternalProject[]>);

  return (
    <div className="space-y-8">
      {/* High Level Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border-l-4 border-l-red-600 shadow-md p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Priority Regions Tracked</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-slate-900">{projects.length}</h2>
            <p className="text-sm font-bold text-red-600 mb-1 flex items-center gap-1"><TrendingUp className="w-4 h-4"/> Critical Need</p>
          </div>
        </div>
        
        <div className="bg-white border-l-4 border-l-amber-500 shadow-md p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Provinces Covered</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-slate-900">{Object.keys(groupedByProvince).length}</h2>
          </div>
        </div>

        <div className="bg-white border-l-4 border-l-green-600 shadow-md p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">Active Infrastructure Projects</p>
          <div className="flex items-end gap-3">
            <h2 className="text-4xl font-black text-slate-900">{projects.filter(p => (p.payload.status || "").toLowerCase().includes("active")).length}</h2>
          </div>
        </div>
      </div>

      {Object.entries(groupedByProvince).sort().map(([province, items]) => (
        <section key={province} className="bg-white shadow-xl overflow-hidden border border-slate-200">
          <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gic-blue" />
              {province} Deep Dives
            </h3>
            <span className="text-xs font-bold bg-slate-200 text-slate-700 px-3 py-1 rounded-full">
              {items.length} Communities
            </span>
          </div>
          
          <div className="divide-y divide-slate-100">
            {items.map(project => (
              <div key={project.id} className="p-6 hover:bg-slate-50 transition-colors">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-xl font-black text-slate-900 mb-1">{project.payload.projectName}</h4>
                        <p className="text-sm font-bold text-gic-blue uppercase tracking-widest">{project.municipality}</p>
                      </div>
                      {project.payload.status?.toLowerCase() === "completed" ? (
                        <span className="flex items-center gap-1 text-xs font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                          <CheckCircle2 className="w-4 h-4" /> Completed
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                          <HardHat className="w-4 h-4" /> Active Intervention
                        </span>
                      )}
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.payload.scope && (
                        <div className="bg-slate-100/50 p-4 rounded text-sm">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Infrastructure Scope</span>
                          <p className="text-slate-700">{project.payload.scope}</p>
                        </div>
                      )}
                      {project.payload.impact && (
                        <div className="bg-slate-100/50 p-4 rounded text-sm border-l-2 border-gic-gold">
                          <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Human Impact</span>
                          <p className="text-slate-900 font-medium">{project.payload.impact}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
