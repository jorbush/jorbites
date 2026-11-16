'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Blog } from '@/app/utils/markdownUtils';
import BlogCard from '@/app/components/blog/BlogCard';
import Pagination from '@/app/components/navigation/Pagination';
import EmptyState from '@/app/components/utils/EmptyState';
import EmptySearchResults from '@/app/components/utils/EmptySearchResults';

const BLOGS_PER_PAGE = 12;

interface ProfileBlogsContentProps {
    blogs: Blog[];
    searchParams: any;
    searchQuery?: string;
    onClearSearch?: () => void;
}

const ProfileBlogsContent: React.FC<ProfileBlogsContentProps> = ({
    blogs,
    searchParams,
    searchQuery,
    onClearSearch,
}) => {
    const { t } = useTranslation();
    const activeSearch = searchQuery ?? searchParams?.search ?? '';
    const normalizedSearch = activeSearch.trim().toLowerCase();
    const isSearching = normalizedSearch.length > 0;

    const filteredBlogs = useMemo(() => {
        if (!isSearching) {
            return blogs;
        }

        return blogs.filter((blog) => {
            const title = blog.frontmatter?.title?.toLowerCase() ?? '';
            const description =
                blog.frontmatter?.description?.toLowerCase() ?? '';
            const content = blog.content?.toLowerCase() ?? '';
            return (
                title.includes(normalizedSearch) ||
                description.includes(normalizedSearch) ||
                content.includes(normalizedSearch)
            );
        });
    }, [blogs, isSearching, normalizedSearch]);

    if (filteredBlogs.length === 0) {
        if (isSearching) {
            return (
                <div data-testid="profile-blogs-search-empty">
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
                        clearLabel={String(t('clear_search', 'Clear search'))}
                        onClearSearch={onClearSearch}
                        clearTestId="profile-blogs-search-clear"
                    />
                </div>
            );
        }

        return (
            <div
                className="py-12"
                data-testid="profile-blogs-empty"
            >
                <EmptyState
                    title={
                        t('no_blogs_found') ||
                        t('no_articles_found') ||
                        'No blogs found'
                    }
                    subtitle={
                        t('no_blogs_subtitle') ||
                        t('no_articles_subtitle') ||
                        'This user has not published any blogs yet.'
                    }
                />
            </div>
        );
    }

    const rawPage = parseInt(searchParams?.page || '1', 10);
    const totalPages = Math.ceil(filteredBlogs.length / BLOGS_PER_PAGE) || 1;
    const currentPage = Math.min(
        Math.max(1, isNaN(rawPage) ? 1 : rawPage),
        totalPages
    );

    const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
    const displayedBlogs = filteredBlogs.slice(
        startIndex,
        startIndex + BLOGS_PER_PAGE
    );

    return (
        <div
            className="pt-2"
            data-testid="profile-blogs-content"
        >
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                {displayedBlogs.map((blog) => (
                    <BlogCard
                        key={blog.id}
                        blog={blog}
                    />
                ))}
            </div>

            {totalPages > 1 && (
                <Pagination
                    totalPages={totalPages}
                    currentPage={currentPage}
                    searchParams={{
                        ...searchParams,
                        tab: 'blogs',
                        search: activeSearch.trim() || undefined,
                    }}
                />
            )}
        </div>
    );
};

export default ProfileBlogsContent;
