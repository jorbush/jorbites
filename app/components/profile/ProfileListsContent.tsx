'use client';

import React, { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { SafeList } from '@/app/types';
import ListCard from '@/app/components/lists/ListCard';
import Pagination from '@/app/components/navigation/Pagination';
import EmptyState from '@/app/components/utils/EmptyState';
import EmptySearchResults from '@/app/components/utils/EmptySearchResults';
import SearchBar from '@/app/components/inputs/SearchBar';

const LISTS_PER_PAGE = 12;
const NOOP = () => {};

function filterProfileLists(
    lists: SafeList[],
    normalizedSearch: string,
    defaultListTitle: string
): SafeList[] {
    if (!normalizedSearch) {
        return lists;
    }

    return lists.filter((list) => {
        const displayTitle = (
            list.isDefault ? defaultListTitle : list.name
        ).toLowerCase();
        const rawName = (list.name || '').toLowerCase();
        return (
            displayTitle.includes(normalizedSearch) ||
            rawName.includes(normalizedSearch)
        );
    });
}

function paginateItems<T>(items: T[], pageParam?: string) {
    const rawPage = parseInt(pageParam || '1', 10);
    const totalPages = Math.ceil(items.length / LISTS_PER_PAGE) || 1;
    const currentPage = Math.min(
        Math.max(1, isNaN(rawPage) ? 1 : rawPage),
        totalPages
    );
    const startIndex = (currentPage - 1) * LISTS_PER_PAGE;

    return {
        totalPages,
        currentPage,
        displayedItems: items.slice(startIndex, startIndex + LISTS_PER_PAGE),
    };
}

interface ProfileListsContentProps {
    lists: SafeList[];
    isOwnProfile: boolean;
    searchParams: any;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    onSearchSubmit?: () => void;
    onClearSearch?: () => void;
}

const ProfileListsContent: React.FC<ProfileListsContentProps> = ({
    lists,
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
    const defaultListTitle = String(t('to_cook_later', 'To cook later'));

    const filteredLists = useMemo(
        () => filterProfileLists(lists, normalizedSearch, defaultListTitle),
        [lists, normalizedSearch, defaultListTitle]
    );

    if (lists.length === 0 && !isSearching) {
        return (
            <div
                className="py-12"
                data-testid="profile-lists-empty"
            >
                <EmptyState
                    title={t('no_lists') || 'No lists found'}
                    subtitle={
                        t('no_user_lists_subtitle') ||
                        'This user has not created any lists yet.'
                    }
                />
            </div>
        );
    }

    const { totalPages, currentPage, displayedItems } = paginateItems(
        filteredLists,
        searchParams?.page
    );

    const push = (url: string) => {
        router?.push(url);
    };

    return (
        <div
            className="pt-2"
            data-testid="profile-lists-content"
        >
            <div className="mb-6 w-full sm:max-w-sm lg:w-72 lg:max-w-none xl:w-80">
                <SearchBar
                    id="profile-search-input"
                    value={activeSearch}
                    onChange={onSearchChange ?? NOOP}
                    onSubmit={onSearchSubmit}
                    onClear={onClearSearch}
                    placeholder={String(t('search_lists', 'Search lists...'))}
                    clearLabel={String(t('clear_search', 'Clear search'))}
                    inputWrapperClassName="w-full"
                    dataTestId="profile-search-input"
                    dataCy="profile-search-input"
                />
            </div>

            {filteredLists.length === 0 ? (
                <div data-testid="profile-lists-search-empty">
                    <EmptySearchResults
                        title={String(
                            t(
                                'no_lists_matching_search',
                                'No lists match your search'
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
                        clearTestId="profile-lists-search-clear"
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                        {displayedItems.map((list) => (
                            <ListCard
                                key={list.id}
                                list={list}
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
                                tab: 'lists',
                                search: activeSearch.trim() || undefined,
                            }}
                        />
                    )}
                </>
            )}
        </div>
    );
};

export default ProfileListsContent;
