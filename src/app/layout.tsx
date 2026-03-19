import { Outfit, Inter } from "next/font/google";
import Sidebar from "@/components/layout/Sidebar";
import { AuthProvider } from "@/context/AuthContext";
import RootWrapper from "@/components/layout/RootWrapper";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"], variable: "--font-display" });
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${outfit.variable} ${inter.variable}`}>
      <head>
        <title>GIC | Infrastructure Intelligence Platform</title>
        <link rel="icon" href="/gic-logo.svg" />
      </head>
      <body className="bg-slate-50 font-sans selection:bg-gic-blue/20">
        <AuthProvider>
          <RootWrapper>{children}</RootWrapper>
        </AuthProvider>
      </body>
    </html>
  );
}
