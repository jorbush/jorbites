'use client';

import React from 'react';
import { SafePlanning, SafeUser } from '@/app/types';
import EmptySearchResults from '@/app/components/utils/EmptySearchResults';
import { PlanningCard } from './PlanningCard';

const noopPush = () => {};

export interface PlanningsGridProps {
    plans: SafePlanning[];
    currentUser?: SafeUser | null;
    showDelete?: boolean;
    isSavedTab?: boolean;
    showPublicBadge?: boolean;
    isSearching?: boolean;
    onClearSearch?: () => void;
    onUnsave: (planId: string) => Promise<void>;
    onDeleteClick: (planId: string) => void;
    push?: (url: string) => void;
    t: any;
    language: string;
}

export const PlanningsGrid: React.FC<PlanningsGridProps> = ({
    plans,
    currentUser,
    showDelete = false,
    isSavedTab = false,
    showPublicBadge = false,
    isSearching = false,
    onClearSearch,
    onUnsave,
    onDeleteClick,
    push = noopPush,
    t,
    language,
}) => {
    if (plans.length === 0) {
        if (isSearching) {
            return (
                <EmptySearchResults
                    title={String(
                        t(
                            'no_plannings_matching_search',
                            'No meal plans match your search'
                        )
                    )}
                    subtitle={String(
                        t(
                            'no_search_results_subtitle',
                            'Try searching with different keywords or check your spelling.'
                        )
                    )}
                    clearLabel={String(t('clear_search', 'Clear search'))}
                    onClearSearch={onClearSearch}
                    dataTestId="plannings-search-empty"
                />
            );
        }

        return (
            <div className="rounded-2xl border border-dashed border-neutral-300 p-12 text-center text-neutral-500 dark:border-neutral-800 dark:text-neutral-400">
                <p className="text-sm font-medium">{t('no_meal_plans')}</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {plans.map((plan) => (
                <PlanningCard
                    key={plan.id}
                    plan={plan}
                    currentUser={currentUser}
                    showDelete={showDelete}
                    isSavedTab={isSavedTab}
                    showPublicBadge={showPublicBadge}
                    onUnsave={onUnsave}
                    onDeleteClick={onDeleteClick}
                    push={push}
                    t={t}
                    language={language}
                />
            ))}
        </div>
    );
};

export default PlanningsGrid;
