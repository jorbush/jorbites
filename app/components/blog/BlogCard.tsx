'use client';

import { useRouter } from 'next/navigation';
import { Blog } from '@/app/utils/markdownUtils';
import { formatDate } from '@/app/utils/date-utils';
import { FiArrowRight } from 'react-icons/fi';

interface BlogCardProps {
    blog: Blog;
}

const BlogCard: React.FC<BlogCardProps> = ({ blog }) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/blog/${blog.id}`);
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            handleClick();
        }
    };

    return (
        <div
            className="group hover:border-green-450/50 cursor-pointer rounded-xl border border-neutral-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-md dark:border-neutral-700 dark:bg-neutral-800"
            onClick={handleClick}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            <div className="flex h-full flex-col">
                <div className="mb-2 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                    {formatDate(blog.frontmatter.date)}
                </div>
                <h3 className="group-hover:text-green-450 mb-2 text-lg leading-tight font-bold text-neutral-800 transition-colors dark:text-neutral-100">
                    {blog.frontmatter.title}
                </h3>
                <p className="line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {blog.frontmatter.description}
                </p>
                <div className="mt-4 flex items-center justify-end">
                    <FiArrowRight className="group-hover:text-green-450 text-neutral-400 transition-transform duration-300 group-hover:translate-x-1" />
                </div>
            </div>
        </div>
    );
};

export const BlogCardSkeleton = () => {
    return (
        <div className="rounded-xl border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <div className="mb-2 h-3 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="mb-4 space-y-2">
                <div className="h-3 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-3 w-2/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
            <div className="flex justify-end">
                <div className="h-4 w-4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
        </div>
    );
};

export default BlogCard;
