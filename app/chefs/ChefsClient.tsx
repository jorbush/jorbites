'use client';

import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SafeUser } from '@/app/types';
import { useTranslation } from 'react-i18next';
import Container from '@/app/components/utils/Container';
import ChefsList from '@/app/components/chefs/ChefsList';
import Pagination from '@/app/components/navigation/Pagination';
import { FiSearch } from 'react-icons/fi';
import { IoRestaurantOutline } from 'react-icons/io5';
import { BiX } from 'react-icons/bi';
import { ChefOrderByType } from '@/app/utils/filter';

interface ChefsClientProps {
    chefs: SafeUser[];
    totalPages: number;
    currentPage: number;
}

const ORDER_BY_LABELS = {
    [ChefOrderByType.TRENDING]: 'trending',
    [ChefOrderByType.NEWEST]: 'newest_first',
    [ChefOrderByType.OLDEST]: 'oldest_first',
    [ChefOrderByType.NAME_ASC]: 'name_a_z',
    [ChefOrderByType.NAME_DESC]: 'name_z_a',
    [ChefOrderByType.MOST_RECIPES]: 'most_recipes',
    [ChefOrderByType.MOST_LIKED]: 'most_liked',
    [ChefOrderByType.HIGHEST_LEVEL]: 'highest_level',
} as const;

const ORDER_BY_FALLBACK_LABELS = {
    [ChefOrderByType.TRENDING]: 'Trending',
    [ChefOrderByType.NEWEST]: 'Newest',
    [ChefOrderByType.OLDEST]: 'Oldest',
    [ChefOrderByType.NAME_ASC]: 'Name A-Z',
    [ChefOrderByType.NAME_DESC]: 'Name Z-A',
    [ChefOrderByType.MOST_RECIPES]: 'Most Recipes',
    [ChefOrderByType.MOST_LIKED]: 'Most Liked',
    [ChefOrderByType.HIGHEST_LEVEL]: 'Highest Level',
} as const;

const ChefsClient: React.FC<ChefsClientProps> = ({
    chefs,
    totalPages,
    currentPage,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    const [searchQuery, setSearchQuery] = useState(
        searchParams?.get('search') || ''
    );
    const [orderBy, setOrderBy] = useState<ChefOrderByType>(
        (searchParams?.get('orderBy') as ChefOrderByType) ||
            ChefOrderByType.TRENDING
    );

    const updateURL = useCallback(
        (newSearch: string, newOrderBy: ChefOrderByType) => {
            const params = new URLSearchParams();

            if (newSearch) {
                params.set('search', newSearch);
            }
            if (newOrderBy !== ChefOrderByType.TRENDING) {
                params.set('orderBy', newOrderBy);
            }
            params.set('page', '1');

            const queryString = params.toString();
            router.push(queryString ? `/chefs?${queryString}` : '/chefs', {
                scroll: false,
            });
        },
        [router]
    );

    const handleSearchChange = useCallback((value: string) => {
        setSearchQuery(value);
    }, []);

    const handleSearchSubmit = useCallback(() => {
        updateURL(searchQuery, orderBy);
    }, [searchQuery, orderBy, updateURL]);

    const handleKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                handleSearchSubmit();
            }
        },
        [handleSearchSubmit]
    );

    const handleOrderByChange = useCallback(
        (newOrderBy: ChefOrderByType) => {
            setOrderBy(newOrderBy);
            updateURL(searchQuery, newOrderBy);
        },
        [searchQuery, updateURL]
    );

    const getOrderLabel = (order: ChefOrderByType) => {
        const translationKey = ORDER_BY_LABELS[order];
        const fallbackLabel = ORDER_BY_FALLBACK_LABELS[order];
        return t(translationKey) || fallbackLabel;
    };

    return (
        <Container>
            <div className="py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-orange-400 to-amber-500">
                            <IoRestaurantOutline
                                className="text-white"
                                size={28}
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                                {t('chefs') || 'Chefs'}
                            </h1>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t('chefs_subtitle') ||
                                    'Discover talented chefs and their creations'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Search and Filters */}
                <div className="mb-6 space-y-4">
                    {/* Search Bar */}
                    <div className="flex flex-col gap-4 sm:flex-row">
                        <div className="relative flex-1">
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                                <FiSearch className="text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder={
                                    t('search_chefs') || 'Search chefs...'
                                }
                                value={searchQuery}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 w-full rounded-full border border-neutral-300 bg-white py-3 pr-10 pl-11 text-sm transition-all outline-none focus:ring-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                                data-cy="chef-search-input"
                                data-testid="chef-search-input"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        handleSearchChange('');
                                        updateURL('', orderBy);
                                    }}
                                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                                >
                                    <BiX size={20} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={handleSearchSubmit}
                            className="rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-orange-600"
                            data-cy="chef-search-button"
                            data-testid="chef-search-button"
                        >
                            {t('search')}
                        </button>
                    </div>

                    {/* Order By Filter Pills */}
                    <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                        <div className="flex min-w-max gap-2 pb-2">
                            {Object.values(ChefOrderByType).map((order) => (
                                <button
                                    key={order}
                                    onClick={() => handleOrderByChange(order)}
                                    className={`flex-shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition ${
                                        orderBy === order
                                            ? 'bg-orange-500 text-white'
                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                                    }`}
                                    data-cy={`order-by-${order}`}
                                    data-testid={`order-by-${order}`}
                                >
                                    {getOrderLabel(order)}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Chefs List */}
                <ChefsList chefs={chefs} />

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="mt-8">
                        <Pagination
                            totalPages={totalPages}
                            currentPage={currentPage}
                            searchParams={{
                                search: searchQuery || undefined,
                                orderBy:
                                    orderBy !== ChefOrderByType.TRENDING
                                        ? orderBy
                                        : undefined,
                            }}
                        />
                    </div>
                )}
            </div>
        </Container>
    );
};

export default ChefsClient;
