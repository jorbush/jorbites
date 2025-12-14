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
        try {
            const storedValue = localStorage.getItem('jorbites_ads_enabled');
            if (storedValue === 'true') {
                setShowAdsState(true);
            }
        } catch (error) {
            // localStorage may not be available in private browsing mode
            console.warn('Could not access localStorage:', error);
        }
        setIsLoading(false);
    }, []);

    const setShowAds = (value: boolean) => {
        setShowAdsState(value);
        try {
            localStorage.setItem('jorbites_ads_enabled', String(value));
        } catch (error) {
            // localStorage may not be available in private browsing mode
            console.warn('Could not save to localStorage:', error);
        }
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
