'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GICContextType {
    selectedProvince: string | null;
    selectedMunicipality: string | null;
    setRegionalContext: (province: string | null, municipality: string | null) => void;
}

const GICContext = createContext<GICContextType | undefined>(undefined);

export function GICProvider({ children }: { children: ReactNode }) {
    const [selectedProvince, setSelectedProvince] = useState<string | null>(null);
    const [selectedMunicipality, setSelectedMunicipality] = useState<string | null>(null);

    // Provide a way to update the global context
    const setRegionalContext = (province: string | null, municipality: string | null) => {
        setSelectedProvince(province);
        setSelectedMunicipality(municipality);
    };

    return (
        <GICContext.Provider value={{ selectedProvince, selectedMunicipality, setRegionalContext }}>
            {children}
        </GICContext.Provider>
    );
}

export function useGIC() {
    const context = useContext(GICContext);
    if (context === undefined) {
        throw new Error('useGIC must be used within a GICProvider');
    }
    return context;
}
