"use client";

import { useAuth } from "@/context/AuthContext";
import LoginView from "@/components/auth/LoginView";
import Sidebar from "@/components/layout/Sidebar";
import RootTransition from "@/components/layout/RootTransition";
import { GICProvider } from "@/context/GICContext";

import { ShieldAlert } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";

export default function RootWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, isMounted, user } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  // Prevent hydration mismatch by deferring render until client has read localStorage
  if (!isMounted) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <LoginView />;
  }

  // Role-Based Access Control (RBAC) Logic
  const role = user.role;
  const isAdminRoute = pathname.startsWith("/admin");
  const isExecutiveRoute = pathname.startsWith("/executive");

  // Viewers can only see specific dashboards (e.g. situation-report)
  const isViewerBlocked = role === "viewer" && isAdminRoute; 
  // Wait, let's say Viewer can only see /executive/situation-report and /executive/social-trends
  const isViewerStrictBlocked = role === "viewer" && !pathname.includes("situation-report") && !pathname.includes("social-trends");
  
  // Executives cannot see Admin panel
  const isExecutiveBlocked = role === "executive" && isAdminRoute;

  if (isExecutiveBlocked || isViewerBlocked || isViewerStrictBlocked) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950 text-white font-sans selection:bg-gic-blue/20">
        <div className="text-center p-12 bg-slate-900 border border-slate-800 rounded-[3rem] shadow-2xl max-w-lg">
          <ShieldAlert className="w-16 h-16 text-rose-500 mx-auto mb-6 opacity-90" />
          <h1 className="text-3xl font-display font-black tracking-tight mb-2 uppercase">Clearance Required</h1>
          <p className="text-sm font-medium text-slate-400 mb-8 leading-relaxed">
            Your current security profile (<span className="text-white uppercase px-2 py-1 bg-white/5 rounded mx-1">{role}</span>) does not possess the necessary clearance to access this sector of the GIC Intelligence Platform.
          </p>
          <button 
            onClick={() => router.push(role === 'viewer' ? "/executive/situation-report" : "/executive/situation-report")}
            className="gic-btn gic-btn-primary w-full text-[11px] font-black uppercase tracking-[0.2em]"
          >
            Return to Authorized Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <GICProvider>
      <div className="flex h-screen overflow-hidden bg-surface-base text-slate-900 font-sans selection:bg-gic-blue/20 gic-ease-elite print:h-auto print:overflow-visible">
        {/* Global Navigation */}
        <Sidebar />

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative overflow-hidden print:overflow-visible">
          {/* Viewport Content */}
          <div className="flex-1 overflow-y-auto print:overflow-visible">
            <RootTransition>{children}</RootTransition>
          </div>
        </main>
      </div>
    </GICProvider>
  );
}
