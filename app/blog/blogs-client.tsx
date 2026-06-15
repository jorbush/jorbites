'use client';

import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import { Blog } from '@/app/utils/markdownUtils';
import { formatDate } from '@/app/utils/date-utils';
import useTheme from '@/app/hooks/useTheme';
import BlogCard, { BlogCardSkeleton } from '@/app/components/blog/BlogCard';
import ActionCard from '@/app/components/shared/ActionCard';
import Pagination from '@/app/components/navigation/Pagination';
import { CONTACT_EMAIL } from '@/app/utils/constants';
import { SafeUser } from '@/app/types';
import useSWR from 'swr';
import { fetcher } from '@/app/utils/fetcher';

const handleContactEmail = () => {
    window.location.href = `mailto:${CONTACT_EMAIL}`;
};

interface BlogsClientProps {
    currentUser?: SafeUser | null;
    initialPage: number;
    category?: string;
    page?: number;
}

const BlogsClient: React.FC<BlogsClientProps> = ({
    currentUser,
    initialPage,
    category,
    page,
}) => {
    const { t, i18n } = useTranslation();
    const { push } = useRouter() || {};

    const currentCategory = category === 'releases' ? 'releases' : 'general';
    const currentPage = page || initialPage;

    useTheme();

    const { data: mainData, isLoading: mainLoading } = useSWR<{
        blogs: Blog[];
        totalPages: number;
    }>(
        `/api/blogs?lang=${i18n.language || 'en'}&page=${currentPage}&pageSize=12&category=${currentCategory}`,
        fetcher
    );

    const { data: sidebarData, isLoading: sidebarLoading } = useSWR<{
        blogs: Blog[];
    }>(
        `/api/blogs?lang=${i18n.language || 'en'}&page=1&pageSize=5&category=releases`,
        fetcher
    );

    const mainBlogs = mainData?.blogs || [];
    const totalPages = mainData?.totalPages || 1;
    const sidebarBlogs = sidebarData?.blogs || [];

    const handleCategoryChange = (newCategory: 'general' | 'releases') => {
        if (newCategory === 'general') {
            push('/blog');
        } else {
            push(`/blog?category=${newCategory}`);
        }
    };

    return (
        <Container>
            <div className="py-8">
                {/* Hero / Header */}
                <div className="mb-10 text-center">
                    <h1 className="text-4xl font-bold text-neutral-800 sm:text-5xl dark:text-neutral-100">
                        {t('blog_title')}
                    </h1>
                    <p className="mx-auto mt-3 max-w-2xl text-neutral-500 dark:text-neutral-400">
                        {t('blog_subtitle')}
                    </p>
                </div>

                {/* Tabs */}
                <div className="mb-8 border-b border-neutral-200 dark:border-neutral-800">
                    <div className="flex gap-6">
                        <button
                            type="button"
                            onClick={() => handleCategoryChange('general')}
                            className={`pb-4 text-sm font-semibold transition ${
                                currentCategory === 'general'
                                    ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                            }`}
                        >
                            {t('blog_category_general')}
                        </button>
                        <button
                            type="button"
                            onClick={() => handleCategoryChange('releases')}
                            className={`pb-4 text-sm font-semibold transition ${
                                currentCategory === 'releases'
                                    ? 'border-b-2 border-green-500 text-green-600 dark:text-green-400'
                                    : 'text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200'
                            }`}
                        >
                            {t('blog_category_releases')}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
                    {/* Main Content (Blogs Grid) */}
                    <div className="lg:col-span-2">
                        {mainLoading ? (
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                {[...Array(4)].map((_, index) => (
                                    <BlogCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : mainBlogs.length === 0 ? (
                            <div className="py-12 text-center text-neutral-500">
                                {t('no_blogs_found')}
                            </div>
                        ) : (
                            <div>
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    {mainBlogs.map((blog) => (
                                        <BlogCard
                                            key={blog.id}
                                            blog={blog}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="mt-10">
                                        <Pagination
                                            totalPages={totalPages}
                                            currentPage={currentPage}
                                            searchParams={{
                                                category:
                                                    currentCategory ===
                                                    'releases'
                                                        ? 'releases'
                                                        : undefined,
                                            }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-8">
                        {/* Releases list */}
                        {currentCategory !== 'releases' && (
                            <div className="rounded-2xl border border-neutral-200 p-6 dark:border-neutral-800">
                                <h3 className="mb-4 text-lg font-bold text-neutral-800 dark:text-neutral-100">
                                    {t('latest_releases')}
                                </h3>

                                {sidebarLoading ? (
                                    <div className="space-y-4">
                                        {[...Array(3)].map((_, index) => (
                                            <div
                                                key={index}
                                                className="animate-pulse space-y-2"
                                            >
                                                <div className="h-4 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                                                <div className="h-3 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
                                            </div>
                                        ))}
                                    </div>
                                ) : sidebarBlogs.length === 0 ? (
                                    <p className="text-sm text-neutral-500">
                                        {t('no_releases_found') ||
                                            'No releases yet.'}
                                    </p>
                                ) : (
                                    <div className="space-y-4">
                                        {sidebarBlogs
                                            .slice(0, 3)
                                            .map((blog) => (
                                                <button
                                                    type="button"
                                                    key={blog.id}
                                                    className="group w-full cursor-pointer border-b border-neutral-100 pb-3 text-left last:border-0 last:pb-0 dark:border-neutral-800/50"
                                                    onClick={() =>
                                                        push(`/blog/${blog.id}`)
                                                    }
                                                >
                                                    <h4 className="line-clamp-2 text-sm font-semibold text-neutral-700 transition group-hover:text-green-600 dark:text-neutral-300 dark:group-hover:text-green-400">
                                                        {blog.frontmatter.title}
                                                    </h4>
                                                    <p className="mt-1 text-xs text-neutral-400">
                                                        {formatDate(
                                                            blog.frontmatter
                                                                .date,
                                                            i18n.language
                                                        )}
                                                    </p>
                                                </button>
                                            ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Contribute / Contact */}
                        {currentUser && (
                            <ActionCard
                                title={t('blog_contribute_title')}
                                subtitle={t('blog_contribute_subtitle')}
                                buttonText={t('contact_us')}
                                onClick={handleContactEmail}
                                variant="secondary"
                            />
                        )}
                    </div>
                </div>
            </div>
        </Container>
    );
};

export default BlogsClient;
