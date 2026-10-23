'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Tab } from '@/app/components/utils/Tabs';
import { FiBookOpen } from 'react-icons/fi';
import { MdRestaurantMenu } from 'react-icons/md';

export const getInitialTab = (
    tabParam?: string,
    recipesCount = 0,
    blogsCount = 0
): string => {
    if (tabParam === 'blogs' || tabParam === 'articles') return 'blogs';
    if (tabParam === 'recipes') return 'recipes';
    if (recipesCount === 0 && blogsCount > 0) return 'blogs';
    return 'recipes';
};

interface UseProfileTabsProps {
    tabParam?: string;
    recipesCount: number;
    blogsCount: number;
    showArticles: boolean;
}

export function useProfileTabs({
    tabParam,
    recipesCount,
    blogsCount,
    showArticles,
}: UseProfileTabsProps) {
    const router = useRouter();
    const { t } = useTranslation();

    const [activeTab, setActiveTab] = useState<string>(() => {
        const initial = getInitialTab(tabParam, recipesCount, blogsCount);
        if (!showArticles && initial === 'blogs') {
            return 'recipes';
        }
        return initial;
    });

    const handleTabChange = (tabId: string) => {
        if (!showArticles && tabId === 'blogs') {
            return;
        }
        setActiveTab(tabId);
        const search =
            typeof window !== 'undefined' ? window.location.search : '';
        const params = new URLSearchParams(search);
        params.set('tab', tabId);
        params.delete('page');
        const query = params.toString();
        router.push(query ? `?${query}` : '?', { scroll: false });
    };

    const tabs: Tab[] = [
        {
            id: 'recipes',
            label: t('recipes') || 'Recipes',
            icon: <MdRestaurantMenu size={20} />,
        },
        ...(showArticles
            ? [
                  {
                      id: 'blogs',
                      label: t('blogs') || 'Blogs',
                      icon: <FiBookOpen size={18} />,
                  },
              ]
            : []),
    ];

    return {
        activeTab,
        handleTabChange,
        tabs,
    };
}
