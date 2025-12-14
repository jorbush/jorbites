'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface AdContextType {
    showAds: boolean;
    setShowAds: (value: boolean) => void;
    isLoading: boolean;
}

const AdContext = createContext<AdContextType | undefined>(undefined);

export function AdProvider({ children }: { children: React.ReactNode }) {
    const [showAds, setShowAdsState] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Read from localStorage on mount
        const storedValue = localStorage.getItem('jorbites_ads_enabled');
        if (storedValue === 'true') {
            setShowAdsState(true);
        }
        setIsLoading(false);
    }, []);

    const setShowAds = (value: boolean) => {
        setShowAdsState(value);
        localStorage.setItem('jorbites_ads_enabled', String(value));
    };

    return (
        <AdContext.Provider value={{ showAds, setShowAds, isLoading }}>
            {children}
        </AdContext.Provider>
    );
}

export function useAds() {
    const context = useContext(AdContext);
    if (context === undefined) {
        throw new Error('useAds must be used within an AdProvider');
    }
    return context;
}
