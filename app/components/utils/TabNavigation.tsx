'use client';

import React from 'react';

export interface NavigationTab {
    id: string;
    label: string;
}

interface TabNavigationProps {
    tabs: NavigationTab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
    tabs,
    activeTab,
    onTabChange,
    className = '',
}) => {
    return (
        <div
            className={`flex border-b border-neutral-200 dark:border-neutral-800 ${className}`}
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    onClick={() => onTabChange(tab.id)}
                    className={`cursor-pointer border-b-2 px-6 py-3.5 text-sm font-semibold transition ${
                        activeTab === tab.id
                            ? 'border-neutral-900 text-neutral-900 dark:border-neutral-100 dark:text-white'
                            : 'border-transparent text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    );
};

export default TabNavigation;
