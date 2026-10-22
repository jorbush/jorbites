'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { Blog } from '@/app/utils/markdownUtils';
import BlogCard from '@/app/components/blog/BlogCard';
import Pagination from '@/app/components/navigation/Pagination';
import EmptyState from '@/app/components/utils/EmptyState';

const BLOGS_PER_PAGE = 12;

interface ProfileBlogsContentProps {
    blogs: Blog[];
    searchParams: any;
}

const ProfileBlogsContent: React.FC<ProfileBlogsContentProps> = ({
    blogs,
    searchParams,
}) => {
    const { t } = useTranslation();

    if (blogs.length === 0) {
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

    const rawPage = parseInt(searchParams?.page || '1');
    const totalPages = Math.ceil(blogs.length / BLOGS_PER_PAGE) || 1;
    const currentPage = Math.min(
        Math.max(1, isNaN(rawPage) ? 1 : rawPage),
        totalPages
    );

    const startIndex = (currentPage - 1) * BLOGS_PER_PAGE;
    const displayedBlogs = blogs.slice(startIndex, startIndex + BLOGS_PER_PAGE);

    return (
        <div
            className="pt-2"
            data-testid="profile-blogs-content"
        >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
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
                    }}
                />
            )}
        </div>
    );
};

export default ProfileBlogsContent;
