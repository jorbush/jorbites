'use client';

import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Blog } from '@/app/utils/markdownUtils';
import useTheme from '@/app/hooks/useTheme';
import BlogCard, { BlogCardSkeleton } from '@/app/components/blog/BlogCard';
import ActionCard from '@/app/components/shared/ActionCard';
import Pagination from '@/app/components/navigation/Pagination';
import { SafeUser } from '@/app/types';

interface BlogsClientProps {
    currentUser?: SafeUser | null;
    initialPage: number;
}

const BlogsClient: React.FC<BlogsClientProps> = ({
    currentUser,
    initialPage,
}) => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const searchParams = useSearchParams();

    const categoryParam = searchParams?.get('category');
    const pageParam = searchParams?.get('page');

    const currentCategory =
        categoryParam === 'releases' ? 'releases' : 'general';
    const currentPage = pageParam ? parseInt(pageParam) : initialPage;

    const [mainBlogs, setMainBlogs] = useState<Blog[]>([]);
    const [sidebarReleases, setSidebarReleases] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);

    useTheme();

    useEffect(() => {
        const loadBlogs = async () => {
            setLoading(true);

            try {
                // 1. Fetch Main Content (based on currentCategory)
                const mainResponse = await fetch(
                    `/api/blogs?lang=${i18n.language || 'en'}&page=${currentPage}&pageSize=12&category=${currentCategory}`
                );

                // 2. Fetch Sidebar Releases (always 'releases', limited to 5)
                // We always show the "What's New" sidebar regardless of main view,
                // effectively acting as a "Recent News" feed.
                const sidebarResponse = await fetch(
                    `/api/blogs?lang=${i18n.language || 'en'}&page=1&pageSize=5&category=releases`
                );

                if (!mainResponse.ok || !sidebarResponse.ok)
                    throw new Error('Failed to fetch blogs');

                const mainData = await mainResponse.json();
                const sidebarData = await sidebarResponse.json();

                setMainBlogs(mainData.blogs);
                setTotalPages(mainData.totalPages);
                setSidebarReleases(sidebarData.blogs);
            } catch (error) {
                console.error('Error loading blogs:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBlogs();
    }, [i18n.language, currentPage, currentCategory]);

    const handleContactEmail = () => {
        window.location.href = 'mailto:jorbites@gmail.com';
    };

    const handleViewAllReleases = () => {
        router.push('/blog?category=releases');
    };

    const handleBackToStories = () => {
        router.push('/blog?category=general');
    };

    return (
        <Container>
            <div className="px-4 py-12 md:px-8">
                <div className="mb-12 text-center">
                    <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-neutral-900 md:text-5xl dark:text-white">
                        {t('blog')}
                    </h1>
                    <p className="mx-auto max-w-2xl text-lg text-neutral-600 dark:text-neutral-400">
                        {t('blog_description')}
                    </p>
                </div>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <div className="mb-8 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                                {currentCategory === 'releases'
                                    ? t(
                                          'jorbites_releases',
                                          'Jorbites Releases'
                                      )
                                    : t('latest_stories', 'Latest Stories')}
                            </h2>
                            {currentCategory === 'releases' && (
                                <button
                                    onClick={handleBackToStories}
                                    className="text-primary-600 hover:text-primary-700 cursor-pointer text-sm font-medium dark:text-white"
                                >
                                    &larr;{' '}
                                    {t('back_to_stories', 'Back to stories')}
                                </button>
                            )}
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                {[...Array(4)].map((_, index) => (
                                    <BlogCardSkeleton key={index} />
                                ))}
                            </div>
                        ) : mainBlogs.length === 0 ? (
                            <div className="rounded-2xl border border-dashed border-neutral-300 py-20 text-center dark:border-neutral-700">
                                <p className="text-lg text-neutral-500">
                                    {t('no_blogs_found')}
                                </p>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                                    {mainBlogs.map((blog) => (
                                        <BlogCard
                                            key={blog.id}
                                            blog={blog}
                                        />
                                    ))}
                                </div>

                                {totalPages > 1 && (
                                    <div className="mt-12">
                                        <Pagination
                                            totalPages={totalPages}
                                            currentPage={currentPage}
                                            searchParams={{
                                                page: currentPage,
                                                category: currentCategory,
                                            }}
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>

                    {/* Sidebar - Releases & Actions */}
                    <div className="space-y-12 lg:col-span-1">
                        {/* Releases Section */}
                        <div>
                            <div className="mb-6 flex items-center justify-between">
                                <h3 className="flex items-center text-xl font-bold text-neutral-900 dark:text-white">
                                    <span className="text-primary-500 mr-2">
                                        ⚡
                                    </span>
                                    {t('whats_new', "What's New")}
                                </h3>
                                {currentCategory !== 'releases' && (
                                    <button
                                        onClick={handleViewAllReleases}
                                        className="text-primary-600 hover:text-primary-700 cursor-pointer text-sm font-semibold dark:text-white"
                                    >
                                        {t('view_all', 'View All')}
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4">
                                {loading ? (
                                    [...Array(3)].map((_, i) => (
                                        <div
                                            key={i}
                                            className="h-24 animate-pulse rounded-xl bg-neutral-100 dark:bg-neutral-800"
                                        ></div>
                                    ))
                                ) : sidebarReleases.length === 0 ? (
                                    <p className="text-neutral-500">
                                        {t('no_releases', 'No updates yet.')}
                                    </p>
                                ) : (
                                    sidebarReleases.map((blog) => (
                                        <div
                                            key={blog.id}
                                            onClick={() =>
                                                router.push(`/blog/${blog.id}`)
                                            }
                                            className="group hover:border-primary-500 dark:hover:border-primary-500 cursor-pointer rounded-xl border border-neutral-200 bg-white p-4 transition-all hover:shadow-md dark:border-neutral-800 dark:bg-neutral-800"
                                        >
                                            <div className="mb-2 flex items-center justify-between">
                                                <span className="bg-primary-100 text-primary-700 dark:bg-primary-900/30 rounded-full px-2 py-0.5 text-xs font-semibold dark:text-white">
                                                    {t('release', 'Release')}
                                                </span>
                                                <span className="text-xs text-neutral-500">
                                                    {new Date(
                                                        blog.frontmatter.date
                                                    ).toLocaleDateString()}
                                                </span>
                                            </div>
                                            <h4 className="group-hover:text-primary-600 dark:group-hover:text-primary-400 line-clamp-2 font-semibold text-neutral-800 dark:text-neutral-200">
                                                {blog.frontmatter.title}
                                            </h4>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>

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
