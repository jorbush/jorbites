'use client';

import { useState, useRef, useEffect } from 'react';
import debounce from 'lodash/debounce';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { BiSearch, BiX } from 'react-icons/bi';
import { FiChevronLeft, FiFilter } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import Logo from '@/app/components/navbar/Logo';

interface SearchProps {
    onFilterToggle?: () => void;
    isFilterOpen?: boolean;
    onSearchModeChange?: (isSearchMode: boolean) => void;
}

const Search: React.FC<SearchProps> = ({
    onSearchModeChange,
    onFilterToggle,
    isFilterOpen,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();
    const pathname = usePathname();
    const [isSearchMode, setIsSearchMode] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isExplicitlyExiting, setIsExplicitlyExiting] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const isMobile = useMediaQuery('(max-width: 768px)');

    const isMainPage = pathname === '/';
    const currentSearch = searchParams?.get('search') || '';
    const isFiltering = searchParams?.get('category') || '';

    const debouncedUrlUpdate = useRef<ReturnType<typeof debounce> | null>(null);

    useEffect(() => {
        debouncedUrlUpdate.current = debounce((value: string) => {
            if (!isMainPage) return;
            const params = new URLSearchParams(searchParams?.toString() || '');
            if (value.trim()) {
                params.set('search', value.trim());
            } else {
                params.delete('search');
            }
            router.replace(params.toString() ? `/?${params.toString()}` : '/');
        }, 1000); // 1 second debounce on URL update in order to avoid request and typing conflicts

        // Initialize search query from URL - but don't automatically exit search mode
        if (currentSearch) {
            setSearchQuery(currentSearch);
            // If we have a search query, enter search mode (but not if we're explicitly exiting)
            if (!isSearchMode && !isExplicitlyExiting) {
                setIsSearchMode(true);
                onSearchModeChange?.(true);
            }
        } else {
            // If no search query, clear the input
            setSearchQuery('');
            // If we were explicitly exiting, complete the exit now
            if (isExplicitlyExiting) {
                setIsSearchMode(false);
                onSearchModeChange?.(false);
                setIsExplicitlyExiting(false);
            }
        }
    }, [
        searchParams,
        isMainPage,
        router,
        currentSearch,
        isSearchMode,
        onSearchModeChange,
        isExplicitlyExiting,
    ]);

    const handleSearchToggle = () => {
        if (isSearchMode) {
            // Exit search mode - set flag to prevent useEffect from interfering
            setIsExplicitlyExiting(true);
            setSearchQuery('');
            // Always clear search from URL when exiting search mode and search content is present
            if (isMainPage && searchQuery.trim()) {
                const params = new URLSearchParams(
                    searchParams?.toString() || ''
                );
                params.delete('search');
                router.push(params.toString() ? `/?${params.toString()}` : '/');
            } else {
                // If not on main page, exit immediately
                setIsSearchMode(false);
                onSearchModeChange?.(false);
                setIsExplicitlyExiting(false);
            }
        } else {
            // Enter search mode
            setIsSearchMode(true);
            setTimeout(() => inputRef.current?.focus(), 200);
            onSearchModeChange?.(true);
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Focus stays on input, no navigation change needed
        // Search results update automatically via URL changes in handleSearchChange
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        debouncedUrlUpdate.current?.(value);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Escape') {
            handleSearchToggle();
        }
    };

    if (!isMainPage) {
        // On non-main pages, just show logo
        return (
            <div className="flex flex-row items-center gap-1 md:gap-3">
                <Logo />
            </div>
        );
    }

    // Desktop version - same behavior as mobile, different transition
    if (!isMobile) {
        return (
            <div className="flex flex-row items-center gap-1 md:gap-3">
                <Logo />

                {isSearchMode ? (
                    // Desktop search input mode - same as mobile but inline transition
                    <motion.form
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.3 }}
                        onSubmit={handleSearchSubmit}
                        className="flex items-center gap-3"
                    >
                        <button
                            onClick={handleSearchToggle}
                            className="flex min-h-[40px] min-w-[40px] flex-shrink-0 items-center justify-center rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                            aria-label={t('back') || 'Back'}
                        >
                            <FiChevronLeft size={20} />
                        </button>

                        <div className="relative">
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder={t('search_recipes') + '...'}
                                value={searchQuery}
                                onChange={(e) =>
                                    handleSearchChange(e.target.value)
                                }
                                onKeyDown={handleKeyDown}
                                className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 min-h-[40px] w-48 rounded-full border border-neutral-300 bg-white py-2 pr-10 pl-4 text-sm transition-all outline-none focus:ring-2 md:w-64 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                            />
                            {searchQuery && (
                                <button
                                    type="button"
                                    onClick={() => handleSearchChange('')}
                                    className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                                >
                                    <BiX size={16} />
                                </button>
                            )}
                        </div>
                        <button
                            onClick={onFilterToggle}
                            className={`relative rounded-full p-2 shadow-xs transition hover:shadow-md ${
                                isFilterOpen
                                    ? 'bg-green-450 dark:text-dark text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                            }`}
                            aria-label={
                                t('filter_categories') || 'Filter by categories'
                            }
                            aria-expanded={isFilterOpen}
                            data-testid="filter-button"
                        >
                            <FiFilter size={18} />
                            {isFiltering && (
                                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-rose-500 dark:border-neutral-900"></span>
                            )}
                        </button>
                    </motion.form>
                ) : (
                    // Desktop button mode - only search button
                    <button
                        onClick={handleSearchToggle}
                        className="bg-green-450 dark:text-dark flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full p-2 text-white shadow-xs transition hover:shadow-md"
                        aria-label={t('search_recipes') || 'Search recipes'}
                    >
                        <BiSearch size={18} />
                    </button>
                )}
            </div>
        );
    }

    // Mobile version with header transformation
    return (
        <div className="flex w-full flex-row items-center gap-1">
            <AnimatePresence mode="wait">
                {isSearchMode ? (
                    // Mobile search mode - header transformation
                    <motion.div
                        key="mobile-search"
                        initial={{ x: '100%', opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '100%', opacity: 0 }}
                        transition={{
                            type: 'tween',
                            duration: 0.1,
                            ease: 'easeInOut',
                        }}
                        className="flex w-full items-center gap-3"
                    >
                        <button
                            onClick={handleSearchToggle}
                            className="flex min-h-[40px] min-w-[40px] flex-shrink-0 items-center justify-center rounded-full p-2 text-neutral-600 hover:bg-neutral-100 dark:text-neutral-400 dark:hover:bg-neutral-800"
                            aria-label={t('back') || 'Back'}
                        >
                            <FiChevronLeft size={20} />
                        </button>

                        <form
                            onSubmit={handleSearchSubmit}
                            className="flex-1"
                        >
                            <div className="relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    placeholder={t('search_recipes') + '...'}
                                    value={searchQuery}
                                    onChange={(e) =>
                                        handleSearchChange(e.target.value)
                                    }
                                    onKeyDown={handleKeyDown}
                                    className="focus:border-green-450 focus:ring-green-450/20 dark:focus:border-green-450 text-md min-h-[40px] w-full rounded-full border border-neutral-300 bg-white py-2 pr-10 pl-4 transition-all outline-none focus:ring-2 dark:border-neutral-600 dark:bg-neutral-800 dark:text-white"
                                />
                                {searchQuery && (
                                    <button
                                        type="button"
                                        onClick={() => handleSearchChange('')}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 rounded-full p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-200"
                                    >
                                        <BiX size={16} />
                                    </button>
                                )}
                            </div>
                        </form>
                        <button
                            onClick={onFilterToggle}
                            className={`relative rounded-full p-2 shadow-xs transition hover:shadow-md ${
                                isFilterOpen
                                    ? 'bg-green-450 dark:text-dark text-white'
                                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700'
                            }`}
                            aria-label={
                                t('filter_categories') || 'Filter by categories'
                            }
                            aria-expanded={isFilterOpen}
                            data-testid="filter-button"
                        >
                            <FiFilter size={18} />
                            {isFiltering && (
                                <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-rose-500 dark:border-neutral-900"></span>
                            )}
                        </button>
                    </motion.div>
                ) : (
                    // Mobile normal mode
                    <motion.div
                        key="mobile-normal"
                        initial={{ x: 0, opacity: 1 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: '-100%', opacity: 0 }}
                        transition={{
                            type: 'tween',
                            duration: 0.3,
                            ease: 'easeInOut',
                        }}
                        className="flex w-full flex-row items-center gap-1 md:gap-3"
                    >
                        <Logo />
                        <button
                            onClick={handleSearchToggle}
                            className="bg-green-450 dark:text-dark flex min-h-[40px] min-w-[40px] items-center justify-center rounded-full p-2 text-white shadow-xs transition hover:shadow-md"
                            aria-label={
                                t('search_and_filter') || 'Search and filter'
                            }
                        >
                            <BiSearch size={18} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default Search;
