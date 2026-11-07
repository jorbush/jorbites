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

const useActiveBlogLanguage = (
    lang?: string,
    fallbackLang?: string
): string => {
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

    return clientLang || lang || fallbackLang || i18n.language || 'es';
};

const useBlogAuthor = (
    userId?: string | null,
    initialAuthor?: SafeUser | null
): SafeUser | null => {
    const { data: authorData } = useSWR<SafeUser>(
        userId ? `/api/user/${userId}` : null,
        axiosFetcher,
        initialAuthor ? { fallbackData: initialAuthor } : undefined
    );

    return authorData || initialAuthor || null;
};

const useRelatedBlogs = (
    activeBlog: Blog | null | undefined,
    currentLang: string,
    initialRelatedBlogs: Blog[],
    isMatchingInitialBlog: boolean
): Blog[] => {
    const activeId = activeBlog?.id;
    const relatedCategory =
        activeBlog?.category === 'releases' ? 'releases' : 'general';

    const fallbackData = useMemo(() => {
        if (initialRelatedBlogs.length > 0 && isMatchingInitialBlog) {
            return { blogs: initialRelatedBlogs, totalPages: 1 };
        }
        return undefined;
    }, [initialRelatedBlogs, isMatchingInitialBlog]);

    const { data: relatedBlogsData } = useSWR(
        activeBlog
            ? `/api/blogs?lang=${currentLang}&pageSize=4&category=${relatedCategory}`
            : null,
        fetcher,
        fallbackData ? { fallbackData } : undefined
    );

    return useMemo(() => {
        if (relatedBlogsData?.blogs) {
            return relatedBlogsData.blogs
                .filter((b: Blog) => b.id !== activeId)
                .slice(0, 2);
        }
        return isMatchingInitialBlog ? initialRelatedBlogs : EMPTY_BLOGS;
    }, [
        relatedBlogsData,
        activeId,
        initialRelatedBlogs,
        isMatchingInitialBlog,
    ]);
};

const getBlogErrorMessage = (error: unknown): string | null => {
    if (!error) return null;
    if ((error as { status?: number })?.status === 404) {
        return 'Blog not found';
    }
    return 'Failed to load blog';
};

const useBlogDetailData = ({
    id,
    lang,
    initialBlog,
    initialAuthor,
    initialRelatedBlogs = EMPTY_BLOGS,
}: UseBlogDetailDataParams) => {
    const currentLang = useActiveBlogLanguage(lang, initialBlog?.language);
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
    const author = useBlogAuthor(
        activeBlog?.frontmatter?.user_id,
        initialAuthor
    );
    const relatedBlogs = useRelatedBlogs(
        activeBlog,
        currentLang,
        initialRelatedBlogs,
        isMatchingInitialBlog
    );

    const loading = blogLoading && !activeBlog;
    const error = getBlogErrorMessage(blogError);

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
