'use client';

import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Blog } from '@/app/utils/markdownUtils';
import useTheme from '@/app/hooks/useTheme';
import { FcNews } from 'react-icons/fc';
import SectionHeader from '@/app/components/utils/SectionHeader';
import BlogCard, { BlogCardSkeleton } from '@/app/components/blog/BlogCard';
import Pagination from '@/app/components/navigation/Pagination';
import ActionCard from '@/app/components/shared/ActionCard';
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
    const [blogs, setBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [totalPages, setTotalPages] = useState(1);
    const [currentPage, setCurrentPage] = useState(initialPage);

    useTheme();

    useEffect(() => {
        const loadBlogs = async () => {
            setLoading(true);

            try {
                const response = await fetch(
                    `/api/blogs?lang=${i18n.language || 'en'}&page=${currentPage}&pageSize=12`
                );
                if (!response.ok) throw new Error('Failed to fetch blogs');

                const data = await response.json();
                setBlogs(data.blogs);
                setTotalPages(data.totalPages);
                setCurrentPage(data.currentPage);
            } catch (error) {
                console.error('Error loading blogs:', error);
            } finally {
                setLoading(false);
            }
        };

        loadBlogs();
    }, [i18n.language, currentPage]);

    const handleContactEmail = () => {
        window.location.href = 'mailto:jorbites@gmail.com';
    };

    return (
        <Container>
            <div className="px-4 py-8">
                <SectionHeader
                    icon={FcNews}
                    title={t('blog')}
                    description={t('blog_description')}
                />

                {loading ? (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <BlogCardSkeleton key={index} />
                        ))}
                    </div>
                ) : blogs.length === 0 ? (
                    <div className="py-10 text-center">
                        <p className="text-neutral-600 dark:text-neutral-400">
                            {t('no_blogs_found')}
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {blogs.map((blog) => (
                                <BlogCard
                                    key={blog.id}
                                    blog={blog}
                                />
                            ))}
                        </div>

                        {totalPages > 1 && (
                            <Pagination
                                totalPages={totalPages}
                                currentPage={currentPage}
                                searchParams={{ page: currentPage }}
                            />
                        )}

                        {currentUser && (
                            <div className="mt-12">
                                <ActionCard
                                    title={t('blog_contribute_title')}
                                    subtitle={t('blog_contribute_subtitle')}
                                    buttonText={t('contact_us')}
                                    onClick={handleContactEmail}
                                    emoji="✍️"
                                />
                            </div>
                        )}
                    </>
                )}
            </div>
        </Container>
    );
};

export default BlogsClient;
