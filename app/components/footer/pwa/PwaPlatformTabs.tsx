'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FaApple, FaAndroid, FaDesktop } from 'react-icons/fa';
import { Platform } from './types';

interface PwaPlatformTabsProps {
    platform: Platform;
    onSelectPlatform: (platform: Platform) => void;
}

const PwaPlatformTabs: React.FC<PwaPlatformTabsProps> = ({
    platform,
    onSelectPlatform,
}) => {
    const { t } = useTranslation();

    const tabs: {
        id: Platform;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
    }[] = [
        { id: 'ios', label: t('footer_pwa_tab_ios'), icon: FaApple },
        { id: 'android', label: t('footer_pwa_tab_android'), icon: FaAndroid },
        { id: 'desktop', label: t('footer_pwa_tab_desktop'), icon: FaDesktop },
    ];

    return (
        <div
            role="tablist"
            aria-label="PWA Platform Instructions"
            className="inline-flex self-start rounded-xl bg-neutral-200/70 p-1 dark:bg-neutral-800/80"
        >
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isSelected = platform === tab.id;
                return (
                    <button
                        key={tab.id}
                        type="button"
                        role="tab"
                        id={`pwa-tab-${tab.id}`}
                        aria-selected={isSelected}
                        aria-controls={`pwa-panel-${tab.id}`}
                        data-testid={`pwa-tab-${tab.id}`}
                        onClick={() => onSelectPlatform(tab.id)}
                        className={`inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors duration-200 ${
                            isSelected
                                ? 'bg-white font-semibold text-neutral-900 shadow-xs dark:bg-neutral-700 dark:text-white'
                                : 'text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white'
                        }`}
                    >
                        <Icon className="size-3.5" />
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default PwaPlatformTabs;
