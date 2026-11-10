'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { Blog } from '@/app/utils/markdownUtils';
import { formatDate } from '@/app/utils/date-utils';
import { FiArrowRight, FiCalendar } from 'react-icons/fi';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import useIsMounted from '@/app/hooks/useIsMounted';

interface BlogCardProps {
    blog: Blog;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
    const { push } = useRouter() || {};
    const { t, i18n } = useTranslation();
    const mounted = useIsMounted();

    const navigateToBlog = () => {
        push(`/blog/${blog.id}`);
    };

    // Extract first image in markdown content if available
    const imageMatch = blog.content
        ? blog.content.match(/!\[.*?\]\((.*?)\)/)
        : null;
    const imageUrl = imageMatch ? imageMatch[1] : null;

    return (
        <div className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-colors duration-200 hover:border-neutral-300 sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-neutral-700">
            <div>
                {/* Date */}
                <div className="mb-3 flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    <FiCalendar size={13} />
                    <time
                        dateTime={blog.frontmatter.date}
                        suppressHydrationWarning
                    >
                        {mounted
                            ? formatDate(blog.frontmatter.date, i18n.language)
                            : formatDate(
                                  blog.frontmatter.date,
                                  blog.language || 'en'
                              )}
                    </time>
                </div>

                {/* Optional thumbnail preview */}
                {imageUrl && (
                    <div className="relative mb-4 h-44 w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                        <CustomProxyImage
                            src={imageUrl}
                            alt={blog.frontmatter.title}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-102"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                    </div>
                )}

                {/* Title */}
                <h3 className="line-clamp-2 text-lg leading-snug font-bold tracking-tight text-neutral-900 transition-colors duration-200 dark:text-white">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigateToBlog();
                        }}
                        className="decoration-green-450 cursor-pointer text-left decoration-2 underline-offset-4 transition-colors duration-200 group-hover:underline after:absolute after:inset-0 after:rounded-2xl after:content-[''] hover:underline focus:outline-hidden"
                    >
                        {blog.frontmatter.title}
                    </button>
                </h3>

                {/* Description */}
                <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-neutral-600 dark:text-neutral-400">
                    {blog.frontmatter.description}
                </p>
            </div>

            {/* Footer with read more link & arrow */}
            <div className="mt-4 flex items-center justify-between border-t border-neutral-100 pt-3 text-xs font-semibold text-neutral-500 transition-colors duration-200 group-hover:text-neutral-900 dark:border-neutral-800/80 dark:text-neutral-400 dark:group-hover:text-white">
                <span suppressHydrationWarning>
                    {mounted ? t('read_more', 'Read more') : 'Read more'}
                </span>
                <FiArrowRight className="text-neutral-400 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-neutral-900 dark:text-neutral-500 dark:group-hover:text-white" />
            </div>
        </div>
    );
};

export const BlogCardSkeleton = () => {
    return (
        <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs sm:p-6 dark:border-neutral-800 dark:bg-neutral-900/90">
            <div className="mb-3 h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="mb-3 h-6 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="mb-4 space-y-2">
                <div className="h-3.5 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-3.5 w-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
            <div className="flex items-center justify-between border-t border-neutral-100 pt-3 dark:border-neutral-800/80">
                <div className="h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="size-4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
        </div>
    );
};

export default BlogCard;
