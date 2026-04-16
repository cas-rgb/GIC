"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  signOut as firebaseSignOut, 
  User as FirebaseUser 
} from "firebase/auth";

interface AuthContextType {
  isAuthenticated: boolean;
  isMounted: boolean;
  user: { name: string; email: string; role: "admin" | "executive" | "viewer"; tenantId: string } | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isMounted, setIsMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [user, setUser] = useState<{ name: string; email: string; role: "admin" | "executive" | "viewer"; tenantId: string } | null>(null);

  useEffect(() => {
    setIsMounted(true);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      // If Firebase successfully authenticates them, allow access.
      if (firebaseUser?.email) {
        // Fetch custom claims for role-based access, fallback to simple email checking for robust demo
        const idTokenResult = await firebaseUser.getIdTokenResult();
        const customRole = idTokenResult.claims.role as string;
        const tenantId = (idTokenResult.claims.tenantId as string) || "gic_national_gov";
        
        let assignedRole: "admin" | "executive" | "viewer" = "executive";
        if (customRole && ["admin", "executive", "viewer"].includes(customRole)) {
          assignedRole = customRole as any;
        } else if (firebaseUser.email.includes("admin")) {
          assignedRole = "admin";
        } else if (firebaseUser.email.includes("viewer") || firebaseUser.email.includes("guest")) {
          assignedRole = "viewer";
        }

        setIsAuthenticated(true);
        setUser({ 
          name: firebaseUser.displayName || firebaseUser.email.split("@")[0], 
          email: firebaseUser.email.toLowerCase(),
          role: assignedRole,
          tenantId
        });
        document.cookie = `gic_auth_session=${assignedRole}; path=/; max-age=86400; SameSite=Strict`;
        document.cookie = `gic_tenant_id=${tenantId}; path=/; max-age=86400; SameSite=Strict`;
      } else {
        setIsAuthenticated(false);
        setUser(null);
        document.cookie = `gic_auth_session=; path=/; max-age=0`;
        document.cookie = `gic_tenant_id=; path=/; max-age=0`;
      }
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const normalizedEmail = email.toLowerCase().trim();
      await signInWithEmailAndPassword(auth, normalizedEmail, password);
      return { success: true };
    } catch (error: any) {
      console.error("Login Error:", error);
      return { success: false, error: "Invalid credentials or network error." };
    }
  };

  const logout = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isMounted, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
