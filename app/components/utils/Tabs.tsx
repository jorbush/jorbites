'use client';

import React, { ReactNode } from 'react';

export interface Tab {
    id: string;
    label: string;
    icon?: ReactNode;
}

interface TabsProps {
    tabs: Tab[];
    activeTab: string;
    onTabChange: (tabId: string) => void;
    className?: string;
    'data-testid'?: string;
}

const Tabs: React.FC<TabsProps> = ({
    tabs,
    activeTab,
    onTabChange,
    className = '',
    'data-testid': dataTestId,
}) => {
    if (tabs.length <= 1) {
        return null;
    }
    return (
        <div
            className={`flex border-b border-gray-200 dark:border-neutral-600 ${className}`}
            data-testid={dataTestId}
            role="tablist"
        >
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    className={`flex flex-1 items-center justify-center gap-2 px-4 py-2 text-center ${
                        activeTab === tab.id
                            ? 'border-green-450 text-green-450 border-b-2 font-medium'
                            : 'text-gray-500 hover:text-gray-700 dark:text-zinc-400 dark:hover:text-zinc-100'
                    }`}
                    onClick={() => onTabChange(tab.id)}
                    data-testid={`tab-${tab.id}`}
                >
                    {tab.icon && <span className="text-lg">{tab.icon}</span>}
                    <span className="hidden sm:inline">{tab.label}</span>
                </button>
            ))}
        </div>
    );
};

export default Tabs;
