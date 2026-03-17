'use client';

import { useAuth } from "@/context/AuthContext";
import LoginView from "@/components/auth/LoginView";
import Sidebar from "@/components/layout/Sidebar";
import RootTransition from "@/components/layout/RootTransition";
import { GICProvider } from "@/context/GICContext";

export default function RootWrapper({ children }: { children: React.ReactNode }) {
    const { isAuthenticated } = useAuth();

    if (!isAuthenticated) {
        return <LoginView />;
    }

    return (
        <GICProvider>
            <div className="flex h-screen overflow-hidden bg-surface-base text-slate-900 font-sans selection:bg-gic-blue/20 gic-ease-elite">
                {/* Global Navigation */}
                <Sidebar />

                {/* Main Content Area */}
                <main className="flex-1 flex flex-col min-w-0 bg-slate-50/50 relative overflow-hidden">
                    {/* Viewport Content */}
                    <div className="flex-1 overflow-y-auto scrollbar-hide">
                        <RootTransition>
                            {children}
                        </RootTransition>
                    </div>
                </main>
            </div>
        </GICProvider>
    );
}
