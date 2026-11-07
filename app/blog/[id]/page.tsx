import { Metadata } from 'next';
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import BlogDetailClient from './blog-detail-client';
import { getBlogById, getPaginatedBlogs } from '@/app/utils/blog-utils';
import getUserById from '@/app/actions/getUserById';
import { BlogDetailSkeleton } from '@/app/components/blog/BlogDetail';
import BlogJsonLd from '@/app/components/blog/BlogJsonLd';
import { SafeUser } from '@/app/types';
import { Blog } from '@/app/utils/markdownUtils';

interface IParams {
    id: string;
}

interface PageProps {
    params: Promise<IParams>;
    searchParams: Promise<{ lang?: string }>;
}

export async function generateMetadata(props: {
    params: Promise<IParams>;
    searchParams?: Promise<{ lang?: string }>;
}): Promise<Metadata> {
    const [params, searchParams, cookieStore] = await Promise.all([
        props.params,
        props.searchParams
            ? props.searchParams
            : Promise.resolve({ lang: undefined }),
        cookies(),
    ]);
    const cookieLang = cookieStore.get('i18next')?.value;
    const lang = searchParams?.lang || cookieLang || 'es';
    const blog = await getBlogById(params.id, lang);

    if (!blog) {
        return {
            title: `Blog Post Not Found | Jorbites`,
            description: 'The blog post you are looking for could not be found',
        };
    }

    // Extract first image from content or use default
    const imageMatch = blog.content.match(/!\[.*?\]\((.*?)\)/);
    const ogImage = imageMatch ? imageMatch[1] : '/avocado.webp';

    let authorName = 'Jorbites';
    if (blog.frontmatter.user_id) {
        try {
            const author = await getUserById({
                userId: blog.frontmatter.user_id,
            });
            if (author?.name) {
                authorName = author.name;
            }
        } catch {
            // Keep default
        }
    }

    return {
        title: `${blog.frontmatter.title} | Blog | Jorbites`,
        description: blog.frontmatter.description || 'Blog post',
        authors: [{ name: authorName }],
        openGraph: {
            title: `${blog.frontmatter.title} | Jorbites`,
            description: blog.frontmatter.description,
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: blog.frontmatter.title,
                },
            ],
            type: 'article',
            publishedTime: blog.frontmatter.date,
            authors: [authorName],
            section:
                blog.category === 'releases' ? 'Releases' : 'Latest Stories',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${blog.frontmatter.title} | Jorbites`,
            description: blog.frontmatter.description,
            images: [ogImage],
        },
        alternates: {
            canonical: `/blog/${params.id}`,
        },
    };
}

const BlogPage = async (props: PageProps) => {
    const [params, searchParams, cookieStore] = await Promise.all([
        props.params,
        props.searchParams,
        cookies(),
    ]);
    const cookieLang = cookieStore.get('i18next')?.value;
    const serverLang = searchParams?.lang || cookieLang || 'es';
    const blog = await getBlogById(params.id, serverLang);

    let author: SafeUser | null = null;
    if (blog?.frontmatter?.user_id) {
        try {
            author = (await getUserById({
                userId: blog.frontmatter.user_id,
            })) as SafeUser | null;
        } catch (error) {
            console.error('Error fetching blog author on server:', error);
        }
    }

    let relatedBlogs: Blog[] = [];
    if (blog) {
        try {
            const relatedCategory =
                blog.category === 'releases' ? 'releases' : 'general';
            const relatedResult = await getPaginatedBlogs(
                serverLang,
                1,
                4,
                relatedCategory
            );
            relatedBlogs = relatedResult.blogs
                .filter((b) => b.id !== params.id)
                .slice(0, 2);
        } catch (error) {
            console.error('Error fetching related blogs on server:', error);
        }
    }

    return (
        <>
            {blog && (
                <BlogJsonLd
                    blog={blog}
                    author={author}
                />
            )}
            <Suspense fallback={<BlogDetailSkeleton />}>
                <BlogDetailClient
                    id={params.id}
                    lang={serverLang}
                    initialBlog={blog}
                    initialAuthor={author}
                    initialRelatedBlogs={relatedBlogs}
                />
            </Suspense>
        </>
    );
};

export default BlogPage;
