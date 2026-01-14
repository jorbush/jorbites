'use client';

import { Blog } from '@/app/utils/markdownUtils';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiShare2, FiCalendar } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import Heading from '@/app/components/navigation/Heading';
import Image from 'next/image';
import Link from 'next/link';
import { Components } from 'react-markdown';
import { formatDate } from '@/app/utils/date-utils';
import { SafeUser } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import VerificationBadge from '@/app/components/VerificationBadge';
import useShare from '@/app/hooks/useShare';

interface BlogDetailProps {
    blog: Blog;
    author: SafeUser | null;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blog, author }) => {
    const { t } = useTranslation();
    const router = useRouter();
    const { share } = useShare();

    const dateDisplay = formatDate(blog.frontmatter.date);

    const markdownComponents: Components = {
        h1: (props) => (
            <h1
                className="mt-6 mb-4 text-3xl font-bold"
                {...props}
            />
        ),
        h2: (props) => (
            <h2
                className="mt-5 mb-3 text-2xl font-bold"
                {...props}
            />
        ),
        h3: (props) => (
            <h3
                className="mt-4 mb-2 text-xl font-bold"
                {...props}
            />
        ),
        p: (props) => (
            <p
                className="mb-4"
                {...props}
            />
        ),
        a: ({ href, ...props }) => (
            <Link
                href={href || '#'}
                className="text-green-450 hover:underline"
                {...props}
            />
        ),
        ul: (props) => (
            <ul
                className="mb-4 ml-6 list-disc"
                {...props}
            />
        ),
        ol: (props) => (
            <ol
                className="mb-4 ml-6 list-decimal"
                {...props}
            />
        ),
        li: (props) => (
            <li
                className="mb-1"
                {...props}
            />
        ),
        strong: (props) => (
            <strong
                className="font-bold"
                {...props}
            />
        ),
        em: (props) => (
            <em
                className="italic"
                {...props}
            />
        ),
        img: (props) => (
            <span className="my-6 block overflow-hidden rounded-xl">
                <img
                    className="w-full object-cover"
                    {...props}
                    alt={props.alt || 'Blog Image'}
                />
            </span>
        ),
    };

    return (
        <div className="mx-auto max-w-[800px] px-4 py-6 dark:text-neutral-100">
            <div className="mb-6 flex items-baseline justify-between">
                <button
                    className="mr-4 flex translate-y-3 cursor-pointer items-center space-x-2 text-gray-600 focus:outline-hidden md:translate-y-0 dark:text-neutral-100"
                    onClick={() => router.back()}
                    aria-label={t('back') as string}
                >
                    <FiChevronLeft className="text-xl" />
                </button>
                <Heading
                    title={blog.frontmatter.title}
                    center
                />
                <button
                    className="ml-4 flex translate-y-3 cursor-pointer items-center space-x-2 text-gray-600 focus:outline-hidden md:translate-y-0 dark:text-neutral-100"
                    onClick={() => share({ title: blog.frontmatter.title })}
                    aria-label="Share"
                >
                    <FiShare2 className="text-xl" />
                </button>
            </div>

            {/* Author Section - matching RecipeInfo styling */}
            {author && (
                <div className="mb-6 flex flex-row items-center gap-2">
                    <Avatar
                        src={author?.image}
                        size={40}
                        onClick={() => router.push('/profile/' + author.id)}
                        quality="auto:eco"
                    />
                    <div className="flex flex-col">
                        <div className="flex flex-row items-center">
                            <div
                                className="cursor-pointer text-xl font-semibold dark:text-neutral-100"
                                onClick={() =>
                                    router.push('/profile/' + author.id)
                                }
                            >
                                {author.name}
                            </div>
                            {author.verified && (
                                <VerificationBadge
                                    className="mt-1 ml-1"
                                    size={20}
                                />
                            )}
                        </div>
                        {typeof author.level === 'number' && (
                            <div className="text-sm text-gray-400">
                                {`${t('level')} ${author.level}`}
                            </div>
                        )}
                    </div>
                </div>
            )}

            <div className="mb-6 flex items-center text-neutral-500 dark:text-neutral-400">
                <FiCalendar className="mr-2 text-lg" />
                <span>{dateDisplay}</span>
            </div>

            <div className="prose dark:prose-invert max-w-none">
                <ReactMarkdown components={markdownComponents}>
                    {blog.content}
                </ReactMarkdown>
            </div>
        </div>
    );
};

export const BlogDetailSkeleton = () => {
    return (
        <div className="mx-auto max-w-[800px] px-4 py-6">
            <div className="mb-6 flex items-baseline justify-between">
                <div className="h-6 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="mx-auto h-8 w-2/3 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-6 w-6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>

            <div className="mb-6 flex items-center gap-3">
                <div className="h-10 w-10 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="flex-1">
                    <div className="mb-1 h-5 w-32 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="h-4 w-20 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
            </div>

            <div className="mb-6 flex items-center">
                <div className="mr-2 h-4 w-4 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-1/3 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>

            <div className="space-y-4">
                <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
            </div>
        </div>
    );
};

export default BlogDetail;
