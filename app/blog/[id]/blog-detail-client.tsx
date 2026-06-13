'use client';

import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import { Blog } from '@/app/utils/markdownUtils';
import BlogDetail, {
    BlogDetailSkeleton,
} from '@/app/components/blog/BlogDetail';
import { useRouter, useSearchParams } from 'next/navigation';
import useTheme from '@/app/hooks/useTheme';
import { SafeUser } from '@/app/types';
import useSWR from 'swr';
import { fetcher, axiosFetcher } from '@/app/utils/fetcher';

interface BlogDetailClientProps {
    id: string;
}

const BlogDetailClient: React.FC<BlogDetailClientProps> = ({ id }) => {
    const { t, i18n } = useTranslation();
    const { push } = useRouter() || {};
    const { get } = useSearchParams() || {}; // Do not undo the descructuring of useSearchParams here
    const langParam = get?.('lang');

    useTheme();

    const currentLang = langParam || i18n.language || 'en';

    const {
        data: blog,
        error: blogError,
        isLoading: blogLoading,
    } = useSWR<Blog>(`/api/blogs/${id}?lang=${currentLang}`, fetcher);

    const { data: authorData } = useSWR<SafeUser>(
        blog?.frontmatter?.user_id
            ? `/api/user/${blog.frontmatter.user_id}`
            : null,
        axiosFetcher
    );

    const author = authorData || null;

    const relatedCategory =
        blog?.category === 'releases' ? 'releases' : 'general';
    const { data: relatedBlogsData } = useSWR(
        blog
            ? `/api/blogs?lang=${currentLang}&pageSize=4&category=${relatedCategory}`
            : null,
        fetcher
    );

    const relatedBlogs = useMemo(() => {
        if (!relatedBlogsData?.blogs) return [];
        return relatedBlogsData.blogs
            .filter((b: Blog) => b.id !== id)
            .slice(0, 3);
    }, [relatedBlogsData, id]);

    const loading = blogLoading;

    const error = useMemo(() => {
        if (!blogError) return null;
        if ((blogError as any).status === 404) return 'Blog not found';
        return 'Failed to load blog';
    }, [blogError]);

    return (
        <Container>
            {loading ? (
                <BlogDetailSkeleton />
            ) : error ? (
                <div className="py-10 text-center">
                    <h2 className="mb-4 text-2xl font-semibold text-red-500 dark:text-red-400">
                        {error}
                    </h2>
                    <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                        {t('blog_not_found_message') ||
                            "The blog post you're looking for could not be found."}
                    </p>
                    <button
                        type="button"
                        onClick={() => push('/blog')}
                        className="bg-green-450 cursor-pointer rounded-lg px-4 py-2 text-black"
                    >
                        {t('back_to_blog') || 'Back to Blog'}
                    </button>
                </div>
            ) : blog ? (
                <BlogDetail
                    blog={blog}
                    author={author}
                    relatedBlogs={relatedBlogs}
                />
            ) : null}
        </Container>
    );
};

export default BlogDetailClient;
