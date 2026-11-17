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
    'data-testid'?: string;
}

const TabNavigation: React.FC<TabNavigationProps> = ({
    tabs,
    activeTab,
    onTabChange,
    className = '',
    'data-testid': dataTestId,
}) => {
    return (
        <div
            className={`-mx-4 min-w-0 overflow-x-auto px-4 sm:mx-0 sm:px-0 ${className}`}
            data-testid={dataTestId}
        >
            <div className="flex min-w-max gap-2 py-0.5 pb-1 lg:pb-0.5">
                {tabs.map((tab) => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => onTabChange(tab.id)}
                            data-cy={`tab-${tab.id}`}
                            data-testid={`tab-${tab.id}`}
                            aria-pressed={isActive}
                            className={`flex-shrink-0 cursor-pointer rounded-full border px-4 py-2 text-sm transition-colors duration-200 ${
                                isActive
                                    ? 'border-green-450/50 bg-green-450 hover:bg-green-450/90 font-semibold text-neutral-900 shadow-xs'
                                    : 'border-neutral-200/80 bg-neutral-50/80 font-medium text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800'
                            }`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default TabNavigation;
