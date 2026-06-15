'use client';

import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
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
}

const BlogDetailClient: React.FC<BlogDetailClientProps> = ({ id, lang }) => {
    const { t, i18n } = useTranslation();
    const { push } = useRouter() || {};

    useTheme();

    const currentLang = lang || i18n.language || 'en';

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

    const { data: relatedBlogsData } = useSWR<{ blogs: Blog[] }>(
        blog
            ? `/api/blogs?lang=${currentLang}&page=1&pageSize=4&category=${relatedCategory}&exclude=${id}`
            : null,
        fetcher
    );

    const relatedBlogs = useMemo(() => {
        return (relatedBlogsData?.blogs || []).slice(0, 3);
    }, [relatedBlogsData]);

    const handleBack = () => {
        push?.('/blog');
    };

    if (blogLoading) {
        return <BlogDetailSkeleton />;
    }

    return (
        <Container>
            {blogError ? (
                <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
                    <h1 className="text-2xl font-bold text-neutral-800 dark:text-neutral-200">
                        {t('blog_not_found') || 'Blog post not found'}
                    </h1>
                    <p className="max-w-md text-neutral-500">
                        {t('blog_not_found_desc') ||
                            'The blog post you are looking for might have been removed or is temporarily unavailable.'}
                    </p>
                    <button
                        type="button"
                        onClick={handleBack}
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
