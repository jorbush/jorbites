'use client';

import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Blog } from '@/app/utils/markdownUtils';
import BlogCard from '@/app/components/blog/BlogCard';
import Pagination from '@/app/components/navigation/Pagination';
import EmptyState from '@/app/components/utils/EmptyState';
import EmptySearchResults from '@/app/components/utils/EmptySearchResults';
import SearchBar from '@/app/components/inputs/SearchBar';

const BLOGS_PER_PAGE = 12;
const NOOP = () => {};

function filterProfileBlogs(blogs: Blog[], normalizedSearch: string): Blog[] {
    if (!normalizedSearch) {
        return blogs;
    }

    return blogs.filter((blog) => {
        const title = blog.frontmatter?.title?.toLowerCase() ?? '';
        const description = blog.frontmatter?.description?.toLowerCase() ?? '';
        const content = blog.content?.toLowerCase() ?? '';
        return (
            title.includes(normalizedSearch) ||
            description.includes(normalizedSearch) ||
            content.includes(normalizedSearch)
        );
    });
}

function paginateProfileBlogs(blogs: Blog[], pageParam?: string) {
    const rawPage = parseInt(pageParam || '1', 10);
    const totalPages = Math.ceil(blogs.length / BLOGS_PER_PAGE) || 1;
    const currentPage = Math.min(
        Math.max(1, isNaN(rawPage) ? 1 : rawPage),
        totalPages
    );
    const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;

    return {
        totalPages,
        currentPage,
        displayedBlogs: blogs.slice(startIndex, startIndex + BLOGS_PER_PAGE),
    };
}

const ProfileBlogsEmptyState: React.FC = () => {
    const { t } = useTranslation();

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
};

interface ProfileBlogsResultsProps {
    filteredCount: number;
    displayedBlogs: Blog[];
    totalPages: number;
    currentPage: number;
    searchParams: any;
    activeSearch: string;
    onClearSearch?: () => void;
}

const ProfileBlogsResults: React.FC<ProfileBlogsResultsProps> = ({
    filteredCount,
    displayedBlogs,
    totalPages,
    currentPage,
    searchParams,
    activeSearch,
    onClearSearch,
}) => {
    const { t } = useTranslation();

    if (filteredCount === 0) {
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
        <>
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
        </>
    );
};

interface ProfileBlogsContentProps {
    blogs: Blog[];
    searchParams: any;
    searchQuery?: string;
    onSearchChange?: (query: string) => void;
    onSearchSubmit?: () => void;
    onClearSearch?: () => void;
}

const ProfileBlogsContent: React.FC<ProfileBlogsContentProps> = ({
    blogs,
    searchParams,
    searchQuery,
    onSearchChange,
    onSearchSubmit,
    onClearSearch,
}) => {
    const { t } = useTranslation();
    const activeSearch = searchQuery ?? searchParams?.search ?? '';
    const normalizedSearch = activeSearch.trim().toLowerCase();
    const isSearching = normalizedSearch.length > 0;

    const filteredBlogs = useMemo(
        () => filterProfileBlogs(blogs, normalizedSearch),
        [blogs, normalizedSearch]
    );

    if (blogs.length === 0 && !isSearching) {
        return <ProfileBlogsEmptyState />;
    }

    const { totalPages, currentPage, displayedBlogs } = paginateProfileBlogs(
        filteredBlogs,
        searchParams?.page
    );

    return (
        <div
            className="pt-2"
            data-testid="profile-blogs-content"
        >
            <div className="mb-6 w-full sm:max-w-sm lg:w-72 lg:max-w-none xl:w-80">
                <SearchBar
                    id="profile-search-input"
                    value={activeSearch}
                    onChange={onSearchChange ?? NOOP}
                    onSubmit={onSearchSubmit}
                    onClear={onClearSearch}
                    placeholder={String(
                        t('search_blogs', 'Search articles...')
                    )}
                    clearLabel={String(t('clear_search', 'Clear search'))}
                    inputWrapperClassName="w-full"
                    dataTestId="profile-search-input"
                    dataCy="profile-search-input"
                />
            </div>

            <ProfileBlogsResults
                filteredCount={filteredBlogs.length}
                displayedBlogs={displayedBlogs}
                totalPages={totalPages}
                currentPage={currentPage}
                searchParams={searchParams}
                activeSearch={activeSearch}
                onClearSearch={onClearSearch}
            />
        </div>
    );
};

export default ProfileBlogsContent;
