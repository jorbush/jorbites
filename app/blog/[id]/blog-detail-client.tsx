'use client';

import '@/app/i18n';
import React, { useMemo, useState, useEffect } from 'react';
import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { Blog } from '@/app/utils/markdownUtils';
import BlogDetail, {
    BlogDetailSkeleton,
} from '@/app/components/blog/BlogDetail';
import { useRouter } from 'next/navigation';
import useTheme from '@/app/hooks/useTheme';
import { SafeUser } from '@/app/types';
import useSWR from 'swr';
import { fetcher, axiosFetcher } from '@/app/utils/fetcher';

interface BlogDetailClientProps {
    id: string;
    lang?: string;
    initialBlog?: Blog | null;
    initialAuthor?: SafeUser | null;
    initialRelatedBlogs?: Blog[];
}

const EMPTY_BLOGS: Blog[] = [];

interface UseBlogDetailDataParams {
    id: string;
    lang?: string;
    initialBlog?: Blog | null;
    initialAuthor?: SafeUser | null;
    initialRelatedBlogs?: Blog[];
}

const useBlogDetailData = ({
    id,
    lang,
    initialBlog,
    initialAuthor,
    initialRelatedBlogs = EMPTY_BLOGS,
}: UseBlogDetailDataParams) => {
    const { i18n } = useTranslation();
    const [clientLang, setClientLang] = useState<string | null>(null);

    useEffect(() => {
        const handleLanguageChanged = (newLang: string) => {
            if (newLang) setClientLang(newLang);
        };
        i18n.on('languageChanged', handleLanguageChanged);
        return () => {
            i18n.off('languageChanged', handleLanguageChanged);
        };
    }, [i18n]);

    const currentLang =
        clientLang || lang || initialBlog?.language || i18n.language || 'es';

    const isMatchingInitialBlog = Boolean(
        initialBlog && initialBlog.language === currentLang
    );

    const {
        data: blog,
        error: blogError,
        isLoading: blogLoading,
    } = useSWR<Blog>(
        `/api/blogs/${id}?lang=${currentLang}`,
        fetcher,
        isMatchingInitialBlog ? { fallbackData: initialBlog! } : undefined
    );

    const activeBlog = blog || (isMatchingInitialBlog ? initialBlog : null);

    const { data: authorData } = useSWR<SafeUser>(
        activeBlog?.frontmatter?.user_id
            ? `/api/user/${activeBlog.frontmatter.user_id}`
            : null,
        axiosFetcher,
        initialAuthor ? { fallbackData: initialAuthor } : undefined
    );

    const author = authorData || initialAuthor || null;

    const relatedCategory =
        activeBlog?.category === 'releases' ? 'releases' : 'general';
    const { data: relatedBlogsData } = useSWR(
        activeBlog
            ? `/api/blogs?lang=${currentLang}&pageSize=4&category=${relatedCategory}`
            : null,
        fetcher,
        initialRelatedBlogs.length > 0 && isMatchingInitialBlog
            ? { fallbackData: { blogs: initialRelatedBlogs, totalPages: 1 } }
            : undefined
    );

    const relatedBlogs = useMemo(() => {
        if (relatedBlogsData?.blogs) {
            return relatedBlogsData.blogs
                .filter((b: Blog) => b.id !== id)
                .slice(0, 2);
        }
        return isMatchingInitialBlog ? initialRelatedBlogs : EMPTY_BLOGS;
    }, [relatedBlogsData, id, initialRelatedBlogs, isMatchingInitialBlog]);

    const loading = blogLoading && !activeBlog;

    const error = useMemo(() => {
        if (!blogError) return null;
        if ((blogError as any).status === 404) return 'Blog not found';
        return 'Failed to load blog';
    }, [blogError]);

    return {
        activeBlog,
        author,
        relatedBlogs,
        loading,
        error,
    };
};

interface BlogDetailErrorStateProps {
    error: string;
    onBack: () => void;
}

const BlogDetailErrorState: React.FC<BlogDetailErrorStateProps> = ({
    error,
    onBack,
}) => {
    const { t } = useTranslation();

    return (
        <div className="mx-auto max-w-md py-16 text-center">
            <h2 className="mb-2 text-2xl font-bold tracking-tight text-neutral-900 dark:text-white">
                {error}
            </h2>
            <p className="mb-6 text-sm text-neutral-600 dark:text-neutral-400">
                {t(
                    'blog_not_found_message',
                    "The blog post you're looking for could not be found."
                )}
            </p>
            <button
                type="button"
                onClick={onBack}
                className="inline-flex cursor-pointer items-center justify-center rounded-xl bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100"
            >
                {t('back_to_blog', 'Back to Blog')}
            </button>
        </div>
    );
};

const BlogDetailClient: React.FC<BlogDetailClientProps> = ({
    id,
    lang,
    initialBlog,
    initialAuthor,
    initialRelatedBlogs = EMPTY_BLOGS,
}) => {
    const { push } = useRouter() || {};
    useTheme();

    const { activeBlog, author, relatedBlogs, loading, error } =
        useBlogDetailData({
            id,
            lang,
            initialBlog,
            initialAuthor,
            initialRelatedBlogs,
        });

    if (loading) {
        return (
            <Container>
                <BlogDetailSkeleton />
            </Container>
        );
    }

    if (error || !activeBlog) {
        return (
            <Container>
                <BlogDetailErrorState
                    error={error || 'Blog not found'}
                    onBack={() => push && push('/blog')}
                />
            </Container>
        );
    }

    return (
        <Container>
            <BlogDetail
                blog={activeBlog}
                author={author}
                relatedBlogs={relatedBlogs}
            />
        </Container>
    );
};

export default BlogDetailClient;
