'use client';

import React from 'react';
import { Blog } from '@/app/utils/markdownUtils';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { FiChevronLeft, FiShare2, FiCalendar } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import Link from 'next/link';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import { Components } from 'react-markdown';
import { formatDate } from '@/app/utils/date-utils';
import { SafeUser } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import VerificationBadge from '@/app/components/VerificationBadge';
import useShare from '@/app/hooks/useShare';
import useIsMounted from '@/app/hooks/useIsMounted';
import BlogCard from '@/app/components/blog/BlogCard';

interface BlogDetailProps {
    blog: Blog;
    author: SafeUser | null;
    relatedBlogs?: Blog[];
}

const EMPTY_BLOGS: Blog[] = [];

const containsBlockChild = (node: any): boolean => {
    if (!node) return false;
    if (
        node.type === 'element' &&
        (node.tagName === 'img' ||
            node.tagName === 'div' ||
            node.tagName === 'figure' ||
            node.tagName === 'pre')
    ) {
        return true;
    }
    if (Array.isArray(node.children)) {
        return node.children.some(containsBlockChild);
    }
    return false;
};

const MARKDOWN_COMPONENTS: Components = {
    h1: ({ children, ...props }) => (
        <h1
            className="mt-8 mb-4 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl dark:text-white"
            {...props}
        >
            {children}
        </h1>
    ),
    h2: ({ children, ...props }) => (
        <h2
            className="mt-7 mb-3 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white"
            {...props}
        >
            {children}
        </h2>
    ),
    h3: ({ children, ...props }) => (
        <h3
            className="mt-6 mb-2 text-lg font-bold text-neutral-900 sm:text-xl dark:text-white"
            {...props}
        >
            {children}
        </h3>
    ),
    p: ({ node, children, ...props }) => {
        if (containsBlockChild(node)) {
            return <div className="mb-5">{children}</div>;
        }
        return (
            <p
                className="mb-5 text-base leading-relaxed text-neutral-700 dark:text-neutral-300"
                {...props}
            >
                {children}
            </p>
        );
    },
    a: ({ href, children, ...props }) => (
        <Link
            href={href || '#'}
            className="decoration-green-450 hover:text-green-450 dark:hover:text-green-450 font-medium text-neutral-900 underline decoration-2 underline-offset-4 transition-colors duration-200 dark:text-neutral-100"
            {...props}
        >
            {children}
        </Link>
    ),
    ul: (props) => (
        <ul
            className="mb-5 ml-6 list-disc space-y-1 text-neutral-700 dark:text-neutral-300"
            {...props}
        />
    ),
    ol: (props) => (
        <ol
            className="mb-5 ml-6 list-decimal space-y-1 text-neutral-700 dark:text-neutral-300"
            {...props}
        />
    ),
    li: (props) => (
        <li
            className="mb-1 leading-relaxed"
            {...props}
        />
    ),
    blockquote: (props) => (
        <blockquote
            className="border-green-450 bg-green-450/5 my-5 rounded-r-xl border-l-4 py-3 pr-4 pl-4 text-neutral-700 italic dark:text-neutral-300"
            {...props}
        />
    ),
    strong: (props) => (
        <strong
            className="font-bold text-neutral-900 dark:text-white"
            {...props}
        />
    ),
    em: (props) => (
        <em
            className="italic"
            {...props}
        />
    ),
    code: ({ children, ...props }) => (
        <code
            className="rounded-md border border-neutral-200/60 bg-neutral-100 px-1.5 py-0.5 font-mono text-xs text-neutral-800 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-200"
            {...props}
        >
            {children}
        </code>
    ),
    pre: ({ children, ...props }) => (
        <pre
            className="my-5 overflow-x-auto rounded-2xl border border-neutral-200/80 bg-neutral-900 p-4 font-mono text-xs text-neutral-100 dark:border-neutral-800"
            {...props}
        >
            {children}
        </pre>
    ),
    img: ({ src, alt }) => {
        if (!src || typeof src !== 'string') return null;
        return (
            <figure className="my-6 block overflow-hidden rounded-2xl border border-neutral-200/80 shadow-xs dark:border-neutral-800">
                <CustomProxyImage
                    src={src}
                    alt={alt || 'Blog Image'}
                    width={800}
                    height={450}
                    maxQuality
                    className="w-full object-cover"
                    sizes="(max-width: 800px) 100vw, 800px"
                    style={{ width: '100%', height: 'auto' }}
                />
            </figure>
        );
    },
};

interface BlogDetailNavProps {
    onBack: () => void;
    onShare: () => void;
    mounted: boolean;
}

const BlogDetailNav: React.FC<BlogDetailNavProps> = ({
    onBack,
    onShare,
    mounted,
}) => {
    const { t } = useTranslation();

    return (
        <nav
            aria-label={
                mounted
                    ? t('article_navigation', 'Article navigation')
                    : 'Article navigation'
            }
            className="mb-6 flex items-center justify-between gap-2 sm:gap-4"
        >
            <button
                type="button"
                className="group inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:text-neutral-900 focus:outline-hidden md:w-auto dark:text-neutral-400 dark:hover:text-white"
                onClick={onBack}
                aria-label={mounted ? t('back', 'Go back') : 'Go back'}
            >
                <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 group-hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:border-neutral-600">
                    <FiChevronLeft size={18} />
                </div>
                <span className="hidden text-xs font-semibold md:inline">
                    {mounted ? t('back', 'Back') : 'Back'}
                </span>
            </button>

            <button
                type="button"
                className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 focus:outline-hidden md:w-auto md:gap-2 md:px-3 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                onClick={onShare}
                aria-label="Share"
            >
                <FiShare2 size={16} />
                <span className="hidden text-xs font-semibold md:inline">
                    {mounted ? t('share', 'Share') : 'Share'}
                </span>
            </button>
        </nav>
    );
};

interface BlogAuthorCardProps {
    author: SafeUser | null;
    dateDisplay: string;
    date: string;
    mounted: boolean;
    onAuthorClick: () => void;
}

const BlogAuthorCard: React.FC<BlogAuthorCardProps> = ({
    author,
    dateDisplay,
    date,
    mounted,
    onAuthorClick,
}) => {
    const { t } = useTranslation();

    if (!author) {
        return (
            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                <FiCalendar size={14} />
                <time
                    dateTime={date}
                    itemProp="datePublished"
                    suppressHydrationWarning
                >
                    {dateDisplay}
                </time>
            </div>
        );
    }

    return (
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
            <div
                className="flex items-center gap-3"
                itemProp="author"
                itemScope
                itemType="https://schema.org/Person"
            >
                <Avatar
                    src={author.image}
                    size={44}
                    onClick={onAuthorClick}
                    quality="auto:eco"
                />
                <div>
                    <div className="flex items-center gap-1.5">
                        <button
                            type="button"
                            rel="author"
                            className="hover:text-green-450 dark:hover:text-green-450 cursor-pointer text-left text-base font-bold text-neutral-900 transition-colors duration-200 focus:outline-hidden dark:text-neutral-100"
                            onClick={onAuthorClick}
                        >
                            <span itemProp="name">{author.name}</span>
                        </button>
                        {author.verified && <VerificationBadge size={16} />}
                    </div>
                    {typeof author.level === 'number' && (
                        <div className="mt-0.5">
                            <span
                                suppressHydrationWarning
                                className="border-green-450/40 bg-green-450/15 dark:text-green-450 inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold text-neutral-900"
                            >
                                {`${mounted ? t('level', 'Level') : 'Level'} ${author.level}`}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex items-center gap-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                <FiCalendar size={14} />
                <time
                    dateTime={date}
                    itemProp="datePublished"
                    suppressHydrationWarning
                >
                    {dateDisplay}
                </time>
            </div>
        </div>
    );
};

interface BlogRelatedSectionProps {
    relatedBlogs: Blog[];
    mounted: boolean;
}

const BlogRelatedSection: React.FC<BlogRelatedSectionProps> = ({
    relatedBlogs,
    mounted,
}) => {
    const { t } = useTranslation();

    if (relatedBlogs.length === 0) return null;

    return (
        <aside
            aria-label={
                mounted ? t('see_more', 'Related articles') : 'Related articles'
            }
            className="mt-14 border-t border-neutral-200/80 pt-10 dark:border-neutral-800"
        >
            <h2
                suppressHydrationWarning
                className="mb-6 text-xl font-bold tracking-tight text-neutral-900 sm:text-2xl dark:text-white"
            >
                {mounted ? t('see_more', 'See more') : 'See more'}
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {relatedBlogs.map((relatedBlog) => (
                    <BlogCard
                        key={relatedBlog.id}
                        blog={relatedBlog}
                    />
                ))}
            </div>
        </aside>
    );
};

const BlogDetail: React.FC<BlogDetailProps> = ({
    blog,
    author,
    relatedBlogs = EMPTY_BLOGS,
}) => {
    const { back, push } = useRouter() || {};
    const { share } = useShare();
    const { i18n } = useTranslation();
    const mounted = useIsMounted();

    const dateDisplay = formatDate(
        blog.frontmatter.date,
        blog.language || i18n.language
    );

    return (
        <div className="mx-auto max-w-[800px] px-4 py-6 dark:text-neutral-100">
            <BlogDetailNav
                onBack={() => back && back()}
                onShare={() => share({ title: blog.frontmatter.title })}
                mounted={mounted}
            />

            <article
                itemScope
                itemType="https://schema.org/BlogPosting"
                className="article-content"
            >
                <header className="mb-8">
                    <h1
                        itemProp="headline"
                        className="mb-4 text-3xl leading-tight font-extrabold tracking-tight text-neutral-900 sm:text-4xl lg:text-5xl dark:text-white"
                    >
                        {blog.frontmatter.title}
                    </h1>

                    {blog.frontmatter.description && (
                        <p
                            itemProp="description"
                            className="mb-6 text-lg leading-relaxed text-neutral-600 sm:text-xl dark:text-neutral-300"
                        >
                            {blog.frontmatter.description}
                        </p>
                    )}

                    <BlogAuthorCard
                        author={author}
                        dateDisplay={dateDisplay}
                        date={blog.frontmatter.date}
                        mounted={mounted}
                        onAuthorClick={() =>
                            author && push && push('/profile/' + author.id)
                        }
                    />
                </header>

                <div
                    itemProp="articleBody"
                    className="prose dark:prose-invert article-body entry-content post-content max-w-none"
                >
                    <ReactMarkdown components={MARKDOWN_COMPONENTS}>
                        {blog.content}
                    </ReactMarkdown>
                </div>
            </article>

            <BlogRelatedSection
                relatedBlogs={relatedBlogs}
                mounted={mounted}
            />
        </div>
    );
};

export const BlogDetailSkeleton = () => {
    return (
        <div className="mx-auto max-w-[800px] px-4 py-6">
            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="size-9 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
                    <div className="hidden h-4 w-10 animate-pulse rounded bg-neutral-200 md:inline dark:bg-neutral-800" />
                </div>
                <div className="size-9 animate-pulse rounded-xl bg-neutral-200 dark:bg-neutral-800" />
            </div>

            <div className="mb-4 h-10 w-3/4 animate-pulse rounded-lg bg-neutral-200 dark:bg-neutral-800" />

            <div className="mb-8 flex items-center justify-between rounded-2xl border border-neutral-200/80 bg-neutral-50/60 p-4 dark:border-neutral-800 dark:bg-neutral-900/60">
                <div className="flex items-center gap-3">
                    <div className="size-11 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-800" />
                    <div className="space-y-1.5">
                        <div className="h-4 w-28 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                        <div className="h-3 w-16 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                </div>
                <div className="h-4 w-24 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>

            <div className="space-y-4">
                <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-4/5 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-44 w-full animate-pulse rounded-2xl bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-full animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-800" />
            </div>
        </div>
    );
};

export default BlogDetail;
