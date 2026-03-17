'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AuthContextType {
    isAuthenticated: boolean;
    user: { name: string } | null;
    login: (username: string, password: string) => boolean;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
        if (typeof window === 'undefined') {
            return false;
        }
        return localStorage.getItem('gic_session') === 'active';
    });
    const [user, setUser] = useState<{ name: string } | null>(() => {
        if (typeof window === 'undefined') {
            return null;
        }
        return localStorage.getItem('gic_session') === 'active' ? { name: 'Admin' } : null;
    });

    const login = (username: string, password: string) => {
        if (username === 'Admin' && password === '123') {
            setIsAuthenticated(true);
            setUser({ name: 'Admin' });
            localStorage.setItem('gic_session', 'active');
            return true;
        }
        return false;
    };

    const logout = () => {
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('gic_session');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
