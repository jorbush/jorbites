'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { PiBookmarksSimpleDuotone } from 'react-icons/pi';
import { SafeList, SafePlanning, SafeUser } from '@/app/types';
import { useRecipeInclusions } from '@/app/hooks/useRecipeInclusions';
import { ListCard } from '@/app/components/lists/ListCard';
import { PlanningCard } from '@/app/components/plannings/PlanningCard';
import useIsMounted from '@/app/hooks/useIsMounted';

interface RecipeInclusionsSectionProps {
    recipeId: string;
    currentUser?: SafeUser | null;
}

interface InclusionsTabsProps {
    hasLists: boolean;
    hasPlannings: boolean;
    listsCount: number;
    planningsCount: number;
    activeTab: 'lists' | 'plannings';
    onTabChange: (tab: 'lists' | 'plannings') => void;
    t: any;
}

const InclusionsTabs: React.FC<InclusionsTabsProps> = ({
    hasLists,
    hasPlannings,
    listsCount,
    planningsCount,
    activeTab,
    onTabChange,
    t,
}) => {
    if (!hasLists || !hasPlannings) {
        return null;
    }

    return (
        <div className="-mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
            <div className="flex min-w-max gap-2 pb-1">
                <button
                    type="button"
                    onClick={() => onTabChange('lists')}
                    data-cy="inclusions-tab-lists"
                    data-testid="inclusions-tab-lists"
                    className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                        activeTab === 'lists'
                            ? 'border-green-450/50 bg-green-450 border font-semibold text-neutral-900 shadow-xs'
                            : 'border border-neutral-200/80 bg-neutral-50/80 font-medium text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800'
                    }`}
                >
                    {t('included_lists_tab', {
                        count: listsCount,
                        defaultValue: `Lists (${listsCount})`,
                    })}
                </button>
                <button
                    type="button"
                    onClick={() => onTabChange('plannings')}
                    data-cy="inclusions-tab-plannings"
                    data-testid="inclusions-tab-plannings"
                    className={`cursor-pointer rounded-full px-4 py-2 text-sm transition-colors duration-200 ${
                        activeTab === 'plannings'
                            ? 'border-green-450/50 bg-green-450 border font-semibold text-neutral-900 shadow-xs'
                            : 'border border-neutral-200/80 bg-neutral-50/80 font-medium text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800'
                    }`}
                >
                    {t('included_plannings_tab', {
                        count: planningsCount,
                        defaultValue: `Meal Plans (${planningsCount})`,
                    })}
                </button>
            </div>
        </div>
    );
};

interface InclusionsContentProps {
    tabToShow: 'lists' | 'plannings';
    lists: SafeList[];
    plannings: SafePlanning[];
    currentUser?: SafeUser | null;
    push: (url: string) => void;
    t: any;
    language: string;
}

const InclusionsContent: React.FC<InclusionsContentProps> = ({
    tabToShow,
    lists,
    plannings,
    currentUser,
    push,
    t,
    language,
}) => {
    if (tabToShow === 'lists') {
        return (
            <div
                className="grid grid-cols-1 gap-4 md:grid-cols-2"
                data-cy="inclusions-lists-grid"
            >
                {lists.map((list) => (
                    <ListCard
                        key={list.id}
                        list={list}
                        showDelete={false}
                        push={push}
                        t={t}
                        language={language}
                    />
                ))}
            </div>
        );
    }

    return (
        <div
            className="grid grid-cols-1 gap-4 md:grid-cols-2"
            data-cy="inclusions-plannings-grid"
        >
            {plannings.map((plan) => (
                <PlanningCard
                    key={plan.id}
                    plan={plan}
                    currentUser={currentUser}
                    showDelete={false}
                    push={push}
                    t={t}
                    language={language}
                />
            ))}
        </div>
    );
};

export const RecipeInclusionsSection: React.FC<
    RecipeInclusionsSectionProps
> = ({ recipeId, currentUser }) => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const mounted = useIsMounted();
    const { lists, plannings, isLoading } = useRecipeInclusions(recipeId);

    const [activeTab, setActiveTab] = useState<'lists' | 'plannings'>('lists');

    const hasLists = lists.length > 0;
    const hasPlannings = plannings.length > 0;

    // Do not display the section if loading or if there are no inclusions
    if (isLoading || (!hasLists && !hasPlannings)) {
        return null;
    }

    // Determine which tab to show if one of them is empty
    const tabToShow =
        hasLists && hasPlannings ? activeTab : hasLists ? 'lists' : 'plannings';

    const sectionTitle = mounted
        ? t('included_in_lists_and_plannings', {
              defaultValue: 'Lists & Meal Plans',
          })
        : 'Lists & Meal Plans';

    const push = (url: string) => {
        router?.push(url);
    };

    return (
        <section
            className="flex flex-col rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90"
            data-cy="recipe-inclusions-section"
            data-testid="recipe-inclusions-section"
            aria-label={sectionTitle}
        >
            <div className="mb-4 flex flex-row items-center gap-2.5">
                <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 text-neutral-700 shadow-2xs dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300">
                    <PiBookmarksSimpleDuotone
                        size={18}
                        aria-hidden="true"
                    />
                </div>
                <h2 className="text-xl font-bold tracking-tight text-neutral-900 dark:text-white">
                    {sectionTitle}
                </h2>
            </div>

            <InclusionsTabs
                hasLists={hasLists}
                hasPlannings={hasPlannings}
                listsCount={lists.length}
                planningsCount={plannings.length}
                activeTab={tabToShow}
                onTabChange={setActiveTab}
                t={t}
            />

            <InclusionsContent
                tabToShow={tabToShow}
                lists={lists}
                plannings={plannings}
                currentUser={currentUser}
                push={push}
                t={t}
                language={i18n.language}
            />
        </section>
    );
};

export default RecipeInclusionsSection;
