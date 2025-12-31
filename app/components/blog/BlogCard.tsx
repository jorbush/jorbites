'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Blog } from '@/app/utils/markdownUtils';
import { formatDate } from '@/app/utils/date-utils';
import { FiCalendar } from 'react-icons/fi';

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
            className="group cursor-pointer overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg dark:border-neutral-700 dark:bg-neutral-800"
            onClick={handleClick}
            tabIndex={0}
            onKeyDown={handleKeyDown}
        >
            {blog.frontmatter.image && (
                <div className="relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                        src={blog.frontmatter.image}
                        alt={blog.frontmatter.title}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                </div>
            )}
            <div className="p-4">
                <h3 className="mb-2 line-clamp-2 text-xl font-bold text-neutral-800 dark:text-neutral-100">
                    {blog.frontmatter.title}
                </h3>
                <p className="mb-3 line-clamp-2 text-sm text-neutral-600 dark:text-neutral-400">
                    {blog.frontmatter.description}
                </p>
                <div className="flex items-center text-sm text-neutral-500 dark:text-neutral-500">
                    <FiCalendar className="mr-2" />
                    <span>{formatDate(blog.frontmatter.date)}</span>
                </div>
            </div>
        </div>
    );
};

export const BlogCardSkeleton = () => {
    return (
        <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white shadow-sm dark:border-neutral-700 dark:bg-neutral-800">
            <div className="aspect-[16/9] w-full animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="p-4">
                <div className="mb-2 h-6 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="mb-3 space-y-2">
                    <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
                <div className="flex items-center">
                    <div className="mr-2 h-4 w-4 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
            </div>
        </div>
    );
};

export default BlogCard;
