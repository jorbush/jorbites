'use client';

import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Blog } from '@/app/utils/markdownUtils';
import BlogDetail, {
    BlogDetailSkeleton,
} from '@/app/components/blog/BlogDetail';
import { useRouter } from 'next/navigation';
import useTheme from '@/app/hooks/useTheme';
import { SafeUser } from '@/app/types';
import axios from 'axios';

interface BlogDetailClientProps {
    id: string;
}

const BlogDetailClient: React.FC<BlogDetailClientProps> = ({ id }) => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [blog, setBlog] = useState<Blog | null>(null);
    const [author, setAuthor] = useState<SafeUser | null>(null);
    const [relatedBlogs, setRelatedBlogs] = useState<Blog[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useTheme();

    useEffect(() => {
        const loadBlogAndAuthor = async () => {
            setLoading(true);
            setError(null);

            try {
                // Fetch blog data based on current language
                const blogResponse = await fetch(
                    `/api/blogs/${id}?lang=${i18n.language || 'en'}`
                );

                if (!blogResponse.ok) {
                    if (blogResponse.status === 404) {
                        setError('Blog not found');
                    } else {
                        throw new Error('Failed to fetch blog');
                    }
                    return;
                }

                const blogData = await blogResponse.json();
                setBlog(blogData);

                // Fetch author data if user_id is available
                if (blogData.frontmatter.user_id) {
                    try {
                        const { data } = await axios.get(
                            `/api/user/${blogData.frontmatter.user_id}`
                        );
                        setAuthor(data);
                    } catch (error) {
                        console.error('Failed to load author', error);
                        // Don't set error, just leave author as null
                    }
                }

                // Fetch other blogs for "See more" section
                // If current blog is a release, show only release blogs
                try {
                    const category =
                        blogData.category === 'releases'
                            ? 'releases'
                            : 'general';
                    const blogsResponse = await fetch(
                        `/api/blogs?lang=${i18n.language || 'en'}&pageSize=4&category=${category}`
                    );
                    if (blogsResponse.ok) {
                        const blogsData = await blogsResponse.json();
                        // Filter out the current blog and limit to 3
                        const otherBlogs = blogsData.blogs
                            .filter((b: Blog) => b.id !== id)
                            .slice(0, 3);
                        setRelatedBlogs(otherBlogs);
                    }
                } catch (error) {
                    console.error('Failed to load related blogs', error);
                    // Don't set error, just leave relatedBlogs as empty
                }
            } catch (error) {
                console.error('Error loading blog:', error);
                setError('Failed to load blog');
            } finally {
                setLoading(false);
            }
        };

        loadBlogAndAuthor();
    }, [id, i18n.language]);

    return (
        <Container>
            {loading ? (
                <BlogDetailSkeleton />
            ) : error ? (
                <div className="py-10 text-center">
                    <h2 className="mb-4 text-2xl font-bold text-red-500 dark:text-red-400">
                        {error}
                    </h2>
                    <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                        {t('blog_not_found_message') ||
                            "The blog post you're looking for could not be found."}
                    </p>
                    <button
                        onClick={() => router.push('/blog')}
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
