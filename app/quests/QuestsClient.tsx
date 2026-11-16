'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { SafeUser } from '@/app/types';
import { useTranslation } from 'react-i18next';
import useQuestModal from '@/app/hooks/useQuestModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import { FiPlus } from 'react-icons/fi';
import Pagination from '@/app/components/navigation/Pagination';
import SearchBar from '@/app/components/inputs/SearchBar';
import TabNavigation, {
    NavigationTab,
} from '@/app/components/utils/TabNavigation';
import QuestsHeader from '@/app/components/quests/QuestsHeader';
import QuestsGrid, { QuestListItem } from '@/app/components/quests/QuestsGrid';
import useUrlSearch from '@/app/hooks/useUrlSearch';

interface QuestsClientProps {
    currentUser?: SafeUser | null;
    quests: QuestListItem[];
    totalPages: number;
    currentPage: number;
    initialStatus?: string;
    initialSearch?: string;
}

const VALID_STATUSES = ['open', 'in_progress', 'completed', 'all'] as const;
type QuestFilter = (typeof VALID_STATUSES)[number];

const getInitialFilter = (initialStatus: string): QuestFilter => {
    if (
        initialStatus === 'open' ||
        initialStatus === 'in_progress' ||
        initialStatus === 'completed' ||
        initialStatus === 'all'
    ) {
        return initialStatus;
    }
    return 'open';
};

const QuestsClient: React.FC<QuestsClientProps> = ({
    currentUser,
    quests,
    totalPages,
    currentPage,
    initialStatus = 'open',
    initialSearch = '',
}) => {
    const { t, i18n } = useTranslation();
    const { push } = useRouter() || {};
    const questModal = useQuestModal();
    const loginModal = useLoginModal();

    const [filter, setFilter] = useState<QuestFilter>(() =>
        getInitialFilter(initialStatus)
    );

    const {
        searchQuery,
        setSearchQuery,
        submitSearch,
        clearSearch,
        isSearching,
    } = useUrlSearch({
        basePath: '/quests',
        initialSearch,
    });

    const handleRequestRecipe = () => {
        if (!currentUser) {
            loginModal.onOpen();
            return;
        }
        questModal.onOpenCreate();
    };

    const handleFilterChange = (newFilter: QuestFilter) => {
        setFilter(newFilter);
        const params = new URLSearchParams(window.location.search);
        if (newFilter !== 'open') {
            params.set('status', newFilter);
        } else {
            params.delete('status');
        }
        const trimmedSearch = searchQuery.trim();
        if (trimmedSearch) {
            params.set('search', trimmedSearch);
        } else {
            params.delete('search');
        }
        params.set('page', '1');
        const queryString = params.toString();
        push(queryString ? `/quests?${queryString}` : '/quests');
    };

    const tabs: NavigationTab[] = useMemo(
        () =>
            VALID_STATUSES.map((status) => ({
                id: status,
                label: String(t(status) || status.replace('_', ' ')),
            })),
        [t]
    );

    return (
        <div className="pt-2 pb-12 sm:pt-4">
            <QuestsHeader
                title={String(t('quests') || 'Recipe Quests')}
                subtitle={String(
                    t('quests_subtitle') ||
                        'Request recipes from the community or fulfill existing requests'
                )}
                requestRecipeLabel={String(
                    t('request_recipe') || 'Request Recipe'
                )}
                onRequestRecipe={handleRequestRecipe}
            />

            {/* Filters & Search Bar */}
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <TabNavigation
                    tabs={tabs}
                    activeTab={filter}
                    onTabChange={(tabId) =>
                        handleFilterChange(tabId as QuestFilter)
                    }
                />

                <div className="w-full sm:max-w-sm lg:w-72 lg:max-w-none lg:shrink-0 xl:w-80">
                    <SearchBar
                        id="quests-search-input"
                        value={searchQuery}
                        onChange={setSearchQuery}
                        onSubmit={submitSearch}
                        onClear={clearSearch}
                        placeholder={String(
                            t('search_quests_placeholder', 'Search quests...')
                        )}
                        clearLabel={String(t('clear_search', 'Clear search'))}
                        inputWrapperClassName="w-full"
                        dataTestId="quests-search-input"
                        dataCy="quests-search-input"
                    />
                </div>
            </div>

            {/* Floating Action Button for mobile (below md) */}
            <button
                type="button"
                onClick={handleRequestRecipe}
                className="fixed right-6 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 flex size-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors duration-200 hover:bg-neutral-800 md:hidden dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                data-cy="request-recipe-button-mobile"
                aria-label={String(t('request_recipe') || 'Request Recipe')}
            >
                <FiPlus className="size-6" />
            </button>

            <QuestsGrid
                quests={quests}
                isSearching={isSearching}
                onClearSearch={clearSearch}
                onNavigateQuest={(questId) => push(`/quests/${questId}`)}
                onNavigateRecipe={(recipeId) => push(`/recipes/${recipeId}`)}
                language={i18n.language}
                t={t}
            />

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="mt-8">
                    <Pagination
                        totalPages={totalPages}
                        currentPage={currentPage}
                        searchParams={{
                            status: filter !== 'all' ? filter : undefined,
                            search: initialSearch.trim() || undefined,
                        }}
                    />
                </div>
            )}
        </div>
    );
};

export default QuestsClient;
