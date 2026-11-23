'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeQuest, SafeQuestPreview } from '@/app/types';
import QuestCard from '@/app/components/quests/QuestCard';
import Pagination from '@/app/components/navigation/Pagination';
import EmptyState from '@/app/components/utils/EmptyState';
import EmptySearchResults from '@/app/components/utils/EmptySearchResults';
import SearchBar from '@/app/components/inputs/SearchBar';

const QUESTS_PER_PAGE = 12;
const NOOP = () => {};

type ProfileQuestItem = SafeQuest | SafeQuestPreview;

function filterProfileQuests(
    quests: ProfileQuestItem[],
    normalizedSearch: string
): ProfileQuestItem[] {
    if (!normalizedSearch) {
        return quests;
    }

    return quests.filter((quest) => {
        const title = quest.title?.toLowerCase() ?? '';
        const description = quest.description?.toLowerCase() ?? '';
        return (
            title.includes(normalizedSearch) ||
            description.includes(normalizedSearch)
        );
    });
}

function paginateItems<T>(items: T[], pageParam?: string) {
    const rawPage = parseInt(pageParam || '1', 10);
    const totalPages = Math.ceil(items.length / QUESTS_PER_PAGE) || 1;
    const currentPage = Math.min(
        Math.max(1, isNaN(rawPage) ? 1 : rawPage),
        totalPages
    );
    const startIndex = (currentPage - 1) * QUESTS_PER_PAGE;

    return {
        totalPages,
        currentPage,
        displayedItems: items.slice(startIndex, startIndex + QUESTS_PER_PAGE),
    };
}

interface ProfileQuestsContentProps {
    quests: ProfileQuestItem[];
    searchParams: any;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    onSearchSubmit?: () => void;
    onClearSearch?: () => void;
}

const ProfileQuestsContent: React.FC<ProfileQuestsContentProps> = ({
    quests,
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

    const filteredQuests = useMemo(
        () => filterProfileQuests(quests, normalizedSearch),
        [quests, normalizedSearch]
    );

    if (quests.length === 0 && !isSearching) {
        return (
            <div
                className="py-12"
                data-testid="profile-quests-empty"
            >
                <EmptyState
                    title={t('no_quests') || 'No quests found'}
                    subtitle={
                        t('no_user_quests_subtitle') ||
                        'This user has not created any quests yet.'
                    }
                />
            </div>
        );
    }

    const { totalPages, currentPage, displayedItems } = paginateItems(
        filteredQuests,
        searchParams?.page
    );

    const push = (url: string) => {
        router?.push(url);
    };

    return (
        <div
            className="pt-2"
            data-testid="profile-quests-content"
        >
            <div className="mb-6 w-full sm:max-w-sm lg:w-72 lg:max-w-none xl:w-80">
                <SearchBar
                    id="profile-search-input"
                    value={activeSearch}
                    onChange={onSearchChange ?? NOOP}
                    onSubmit={onSearchSubmit}
                    onClear={onClearSearch}
                    placeholder={String(
                        t('search_quests_placeholder', 'Search quests...')
                    )}
                    clearLabel={String(t('clear_search', 'Clear search'))}
                    inputWrapperClassName="w-full"
                    dataTestId="profile-search-input"
                    dataCy="profile-search-input"
                />
            </div>

            {filteredQuests.length === 0 ? (
                <div data-testid="profile-quests-search-empty">
                    <EmptySearchResults
                        title={String(
                            t(
                                'no_quests_matching_search',
                                'No quests match your search'
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
                        clearTestId="profile-quests-search-clear"
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
                        {displayedItems.map((quest) => (
                            <QuestCard
                                key={quest.id}
                                quest={quest}
                                push={push}
                                t={t}
                                language={i18n.language}
                                showRepliesPreview={true}
                            />
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            totalPages={totalPages}
                            currentPage={currentPage}
                            searchParams={{
                                ...searchParams,
                                tab: 'quests',
                                search: activeSearch.trim() || undefined,
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default ProfileQuestsContent;
