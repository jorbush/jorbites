'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafePlanning, SafeUser } from '@/app/types';
import { PlanningCard } from '@/app/components/plannings/PlanningCard';
import Pagination from '@/app/components/navigation/Pagination';
import EmptyState from '@/app/components/utils/EmptyState';
import EmptySearchResults from '@/app/components/utils/EmptySearchResults';
import SearchBar from '@/app/components/inputs/SearchBar';

const PLANNINGS_PER_PAGE = 12;
const NOOP = () => {};

function filterProfilePlannings(
    plannings: SafePlanning[],
    normalizedSearch: string
): SafePlanning[] {
    if (!normalizedSearch) {
        return plannings;
    }

    return plannings.filter((plan) => {
        const name = plan.name?.toLowerCase() ?? '';
        const description = plan.description?.toLowerCase() ?? '';
        return (
            name.includes(normalizedSearch) ||
            description.includes(normalizedSearch)
        );
    });
}

function paginateItems<T>(items: T[], pageParam?: string) {
    const rawPage = parseInt(pageParam || '1', 10);
    const totalPages = Math.ceil(items.length / PLANNINGS_PER_PAGE) || 1;
    const currentPage = Math.min(
        Math.max(1, isNaN(rawPage) ? 1 : rawPage),
        totalPages
    );
    const startIndex = (currentPage - 1) * PLANNINGS_PER_PAGE;

    return {
        totalPages,
        currentPage,
        displayedItems: items.slice(
            startIndex,
            startIndex + PLANNINGS_PER_PAGE
        ),
    };
}

interface ProfilePlanningsContentProps {
    plannings: SafePlanning[];
    currentUser?: SafeUser | null;
    isOwnProfile: boolean;
    searchParams: any;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    onSearchSubmit?: () => void;
    onClearSearch?: () => void;
}

const ProfilePlanningsContent: React.FC<ProfilePlanningsContentProps> = ({
    plannings,
    currentUser,
    isOwnProfile,
    searchParams,
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    onClearSearch,
}) => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const activeSearch = searchQuery ?? searchParams?.search ?? '';
    const normalizedSearch = activeSearch.trim().toLowerCase();
    const isSearching = normalizedSearch.length > 0;

    const filteredPlannings = useMemo(
        () => filterProfilePlannings(plannings, normalizedSearch),
        [plannings, normalizedSearch]
    );

    if (plannings.length === 0 && !isSearching) {
        return (
            <div
                className="py-12"
                data-testid="profile-plannings-empty"
            >
                <EmptyState
                    title={t('no_meal_plans') || 'No meal plans found'}
                    subtitle={
                        t('no_user_plannings_subtitle') ||
                        'This user has not created any meal plans yet.'
                    }
                />
            </div>
        );
    }

    const { totalPages, currentPage, displayedItems } = paginateItems(
        filteredPlannings,
        searchParams?.page
    );

    const push = (url: string) => {
        router?.push(url);
    };

    return (
        <div
            className="pt-2"
            data-testid="profile-plannings-content"
        >
            <div className="mb-6 w-full sm:max-w-sm lg:w-72 lg:max-w-none xl:w-80">
                <SearchBar
                    id="profile-search-input"
                    value={activeSearch}
                    onChange={onSearchChange ?? NOOP}
                    onSubmit={onSearchSubmit}
                    onClear={onClearSearch}
                    placeholder={String(
                        t('search_plannings', 'Search meal plans...')
                    )}
                    clearLabel={String(t('clear_search', 'Clear search'))}
                    inputWrapperClassName="w-full"
                    dataTestId="profile-search-input"
                    dataCy="profile-search-input"
                />
            </div>

            {filteredPlannings.length === 0 ? (
                <div data-testid="profile-plannings-search-empty">
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
                        clearTestId="profile-plannings-search-clear"
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {displayedItems.map((plan) => (
                            <PlanningCard
                                key={plan.id}
                                plan={plan}
                                currentUser={currentUser}
                                showDelete={false}
                                showPublicBadge={isOwnProfile}
                                push={push}
                                t={t}
                                language={i18n.language}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            totalPages={totalPages}
                            currentPage={currentPage}
                            searchParams={{
                                ...searchParams,
                                tab: 'plannings',
                                search: activeSearch.trim() || undefined,
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default ProfilePlanningsContent;
