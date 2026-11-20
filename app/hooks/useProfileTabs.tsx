'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { NavigationTab } from '@/app/components/utils/TabNavigation';

export type ProfileTabId =
    | 'recipes'
    | 'blogs'
    | 'lists'
    | 'quests'
    | 'plannings';

interface TabVisibilityOptions {
    showArticles?: boolean;
    showLists?: boolean;
    showQuests?: boolean;
    showPlannings?: boolean;
    listsCount?: number;
    questsCount?: number;
    planningsCount?: number;
}

const isTabEnabled = (
    tabId: string,
    {
        showArticles = false,
        showLists = false,
        showQuests = false,
        showPlannings = false,
    }: TabVisibilityOptions
): boolean => {
    switch (tabId) {
        case 'recipes':
            return true;
        case 'blogs':
            return showArticles;
        case 'lists':
            return showLists;
        case 'quests':
            return showQuests;
        case 'plannings':
            return showPlannings;
        default:
            return false;
    }
};

const normalizeTabParam = (tabParam?: string): ProfileTabId | null => {
    if (tabParam === 'blogs' || tabParam === 'articles') return 'blogs';
    if (
        tabParam === 'recipes' ||
        tabParam === 'lists' ||
        tabParam === 'quests' ||
        tabParam === 'plannings'
    ) {
        return tabParam;
    }
    return null;
};

export const getInitialTab = (
    tabParam?: string,
    recipesCount = 0,
    blogsCount = 0,
    isSearching = false,
    options: TabVisibilityOptions = {}
): ProfileTabId => {
    const normalized = normalizeTabParam(tabParam);
    if (normalized) return normalized;

    if (!isSearching && recipesCount === 0) {
        if (blogsCount > 0) return 'blogs';
        if (options.showLists && (options.listsCount ?? 0) > 0) return 'lists';
        if (options.showQuests && (options.questsCount ?? 0) > 0) {
            return 'quests';
        }
        if (options.showPlannings && (options.planningsCount ?? 0) > 0) {
            return 'plannings';
        }
    }

    return 'recipes';
};

interface UseProfileTabsProps {
    tabParam?: string;
    recipesCount: number;
    blogsCount: number;
    listsCount?: number;
    questsCount?: number;
    planningsCount?: number;
    showArticles: boolean;
    showLists?: boolean;
    showQuests?: boolean;
    showPlannings?: boolean;
    isSearching?: boolean;
}

export function useProfileTabs({
    tabParam,
    recipesCount,
    blogsCount,
    listsCount = 0,
    questsCount = 0,
    planningsCount = 0,
    showArticles,
    showLists = false,
    showQuests = false,
    showPlannings = false,
    isSearching = false,
}: UseProfileTabsProps) {
    const router = useRouter();
    const { t } = useTranslation();

    const visibility: TabVisibilityOptions = {
        showArticles,
        showLists,
        showQuests,
        showPlannings,
        listsCount,
        questsCount,
        planningsCount,
    };

    const [activeTab, setActiveTab] = useState<string>(() => {
        const initial = getInitialTab(
            tabParam,
            recipesCount,
            blogsCount,
            isSearching,
            visibility
        );
        return isTabEnabled(initial, visibility) ? initial : 'recipes';
    });

    const handleTabChange = (tabId: string) => {
        if (!isTabEnabled(tabId, visibility)) {
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

    const tabs: NavigationTab[] = [
        {
            id: 'recipes',
            label: String(t('recipes') || 'Recipes'),
        },
        ...(showArticles
            ? [
                  {
                      id: 'blogs',
                      label: String(t('blogs') || 'Blogs'),
                  },
              ]
            : []),
        ...(showLists
            ? [
                  {
                      id: 'lists',
                      label: String(t('lists') || 'Lists'),
                  },
              ]
            : []),
        ...(showQuests
            ? [
                  {
                      id: 'quests',
                      label: String(t('quests') || 'Quests'),
                  },
              ]
            : []),
        ...(showPlannings
            ? [
                  {
                      id: 'plannings',
                      label: String(t('meal_planner') || 'Plannings'),
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
