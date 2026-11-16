'use client';

import React, { useCallback, useMemo } from 'react';
import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Blog } from '@/app/utils/markdownUtils';
import useTheme from '@/app/hooks/useTheme';
import BlogCard, { BlogCardSkeleton } from '@/app/components/blog/BlogCard';
import Pagination from '@/app/components/navigation/Pagination';
import SearchBar from '@/app/components/inputs/SearchBar';
import EmptySearchResults from '@/app/components/utils/EmptySearchResults';
import TabNavigation, {
    NavigationTab,
} from '@/app/components/utils/TabNavigation';
import useUrlSearch from '@/app/hooks/useUrlSearch';
import { FcNews } from 'react-icons/fc';
import { FiEdit3 } from 'react-icons/fi';
import { CMS_BLOGS_URL } from '@/app/utils/constants';
import useSWR from 'swr';
import { fetcher } from '@/app/utils/fetcher';

interface BlogsClientProps {
    initialPage: number;
    initialCategory?: string;
    initialSearch?: string;
}

const CATEGORIES = [
    { id: 'general', labelKey: 'latest_stories', fallback: 'Latest Stories' },
    { id: 'releases', labelKey: 'jorbites_releases', fallback: 'Releases' },
] as const;

const BlogsClient: React.FC<BlogsClientProps> = ({
    initialPage,
    initialCategory = 'general',
    initialSearch = '',
}) => {
    const { t, i18n } = useTranslation();
    const { push } = useRouter() || {};

    const currentCategory =
        initialCategory === 'releases' ? 'releases' : 'general';
    const currentPage = initialPage;

    useTheme();

    const {
        searchQuery,
        setSearchQuery,
        submitSearch,
        clearSearch,
        isSearching,
    } = useUrlSearch({
        basePath: '/blog',
        initialSearch,
    });

    const trimmedInitialSearch = initialSearch.trim();
    const blogsUrl = useMemo(() => {
        const params = new URLSearchParams({
            lang: i18n.language || 'en',
            page: String(currentPage),
            pageSize: '12',
            category: currentCategory,
        });
        if (trimmedInitialSearch) {
            params.set('search', trimmedInitialSearch);
        }
        return `/api/blogs?${params.toString()}`;
    }, [i18n.language, currentPage, currentCategory, trimmedInitialSearch]);

    const { data: mainData, isLoading: loading } = useSWR<{
        blogs: Blog[];
        totalPages: number;
    }>(blogsUrl, fetcher);

    const mainBlogs = mainData?.blogs || [];
    const totalPages = mainData?.totalPages || 1;

    const handleCategoryChange = useCallback(
        (category: string) => {
            if (!push) return;
            const currentParams =
                typeof window !== 'undefined' ? window.location.search : '';
            const params = new URLSearchParams(currentParams);
            params.set('category', category);
            const trimmedSearch = searchQuery.trim();
            if (trimmedSearch) {
                params.set('search', trimmedSearch);
            } else {
                params.delete('search');
            }
            params.set('page', '1');
            push(`/blog?${params.toString()}`);
        },
        [push, searchQuery]
    );

    const tabs: NavigationTab[] = useMemo(
        () =>
            CATEGORIES.map((cat) => ({
                id: cat.id,
                label: String(t(cat.labelKey, cat.fallback)),
            })),
        [t]
    );

    return (
        <Container>
            <div className="flex flex-col gap-6 pt-2 pb-12 sm:pt-4 dark:text-white">
                {/* Header */}
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-center">
                    <div className="flex items-center gap-3.5">
                        <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 shadow-2xs sm:size-12 dark:border-neutral-700/60 dark:bg-neutral-800">
                            <FcNews size={28} />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white">
                                {t('blog')}
                            </h1>
                            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                                {t('blog_description')}
                            </p>
                        </div>
                    </div>

                    <div className="hidden lg:block lg:shrink-0">
                        <a
                            href={CMS_BLOGS_URL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-neutral-900 px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                            data-testid="propose-blog-button"
                        >
                            <FiEdit3 size={18} />
                            <span>{t('propose_blog', 'Propose Article')}</span>
                        </a>
                    </div>
                </div>

                {/* Category Filter Pills & Search Bar */}
                <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <TabNavigation
                        tabs={tabs}
                        activeTab={currentCategory}
                        onTabChange={handleCategoryChange}
                    />

                    <div className="w-full sm:max-w-sm lg:w-72 lg:max-w-none lg:shrink-0 xl:w-80">
                        <SearchBar
                            id="blogs-search-input"
                            value={searchQuery}
                            onChange={setSearchQuery}
                            onSubmit={submitSearch}
                            onClear={clearSearch}
                            placeholder={String(
                                t('search_blogs', 'Search articles...')
                            )}
                            clearLabel={String(
                                t('clear_search', 'Clear search')
                            )}
                            inputWrapperClassName="w-full"
                            dataTestId="blogs-search-input"
                            dataCy="blogs-search-input"
                        />
                    </div>
                </div>

                {/* Feed Section */}
                <div>
                    {loading ? (
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {[...Array(6)].map((_, index) => (
                                <BlogCardSkeleton key={index} />
                            ))}
                        </div>
                    ) : mainBlogs.length === 0 ? (
                        isSearching ? (
                            <EmptySearchResults
                                title={String(
                                    t(
                                        'no_blogs_matching_search',
                                        'No articles match your search'
                                    )
                                )}
                                subtitle={String(
                                    t(
                                        'no_search_results_subtitle',
                                        'Try searching with different keywords or check your spelling.'
                                    )
                                )}
                                clearLabel={String(
                                    t('clear_search', 'Clear search')
                                )}
                                onClearSearch={clearSearch}
                                dataTestId="blogs-search-empty"
                            />
                        ) : (
                            <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
                                <p className="text-base text-neutral-500 dark:text-neutral-400">
                                    {t('no_blogs_found')}
                                </p>
                            </div>
                        )
                    ) : (
                        <>
                            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                                {mainBlogs.map((blog) => (
                                    <BlogCard
                                        key={blog.id}
                                        blog={blog}
                                    />
                                ))}
                            </div>

                            {totalPages > 1 && (
                                <div className="mt-10">
                                    <Pagination
                                        totalPages={totalPages}
                                        currentPage={currentPage}
                                        searchParams={{
                                            page: currentPage,
                                            category: currentCategory,
                                            search:
                                                trimmedInitialSearch ||
                                                undefined,
                                        }}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Floating Action Button for mobile & tablet (below lg) */}
            <a
                href={CMS_BLOGS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="fixed right-6 bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] z-10 flex size-14 cursor-pointer items-center justify-center rounded-full bg-neutral-900 text-white shadow-lg transition-colors duration-200 hover:bg-neutral-800 lg:hidden dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
                data-testid="propose-blog-button-mobile"
                data-cy="propose-blog-button-mobile"
                aria-label={String(t('propose_blog', 'Propose Article'))}
                title={String(t('propose_blog', 'Propose Article'))}
            >
                <FiEdit3 className="size-6" />
            </a>
        </Container>
    );
};

export default BlogsClient;
