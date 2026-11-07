'use client';

import React, { useCallback } from 'react';
import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Blog } from '@/app/utils/markdownUtils';
import useTheme from '@/app/hooks/useTheme';
import BlogCard, { BlogCardSkeleton } from '@/app/components/blog/BlogCard';
import Pagination from '@/app/components/navigation/Pagination';
import { FcNews } from 'react-icons/fc';
import { FiEdit3 } from 'react-icons/fi';
import { CMS_BLOGS_URL } from '@/app/utils/constants';
import useSWR from 'swr';
import { fetcher } from '@/app/utils/fetcher';

interface BlogsClientProps {
    initialPage: number;
    initialCategory?: string;
}

const CATEGORIES = [
    { id: 'general', labelKey: 'latest_stories', fallback: 'Latest Stories' },
    { id: 'releases', labelKey: 'jorbites_releases', fallback: 'Releases' },
] as const;

const BlogsClient: React.FC<BlogsClientProps> = ({
    initialPage,
    initialCategory = 'general',
}) => {
    const { t, i18n } = useTranslation();
    const { push } = useRouter() || {};

    const currentCategory =
        initialCategory === 'releases' ? 'releases' : 'general';
    const currentPage = initialPage;

    useTheme();

    const { data: mainData, isLoading: loading } = useSWR<{
        blogs: Blog[];
        totalPages: number;
    }>(
        `/api/blogs?lang=${i18n.language || 'en'}&page=${currentPage}&pageSize=12&category=${currentCategory}`,
        fetcher
    );

    const mainBlogs = mainData?.blogs || [];
    const totalPages = mainData?.totalPages || 1;

    const handleCategoryChange = useCallback(
        (category: string) => {
            push(`/blog?category=${category}&page=1`);
        },
        [push]
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

                {/* Category Filter Pills */}
                <div className="-mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <div className="flex min-w-max gap-2 pb-1">
                        {CATEGORIES.map((cat) => {
                            const isActive = currentCategory === cat.id;
                            return (
                                <button
                                    key={cat.id}
                                    type="button"
                                    onClick={() => handleCategoryChange(cat.id)}
                                    className={`flex-shrink-0 cursor-pointer rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200 ${
                                        isActive
                                            ? 'border-green-450/50 bg-green-450 border font-semibold text-neutral-900 shadow-xs'
                                            : 'border border-neutral-200/80 bg-neutral-50/80 text-neutral-600 hover:border-neutral-300 hover:bg-neutral-100 dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-800'
                                    }`}
                                >
                                    {t(cat.labelKey, cat.fallback)}
                                </button>
                            );
                        })}
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
                        <div className="rounded-2xl border border-dashed border-neutral-300 py-16 text-center dark:border-neutral-700">
                            <p className="text-base text-neutral-500 dark:text-neutral-400">
                                {t('no_blogs_found')}
                            </p>
                        </div>
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
