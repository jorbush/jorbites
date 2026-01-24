import { Metadata } from 'next';
import BlogDetailClient from './blog-detail-client';
import { getBlogById } from '@/app/utils/blog-utils';

interface IParams {
    id: string;
}

interface PageProps {
    params: Promise<IParams>;
}

export async function generateMetadata(props: {
    params: Promise<IParams>;
}): Promise<Metadata> {
    const params = await props.params;
    const blog = await getBlogById(params.id);

    if (!blog) {
        return {
            title: `Blog Post Not Found | Jorbites`,
            description: 'The blog post you are looking for could not be found',
        };
    }

    // Extract first image from content or use default
    const imageMatch = blog.content.match(/!\[.*?\]\((.*?)\)/);
    const ogImage = imageMatch ? imageMatch[1] : '/avocado.webp';

    return {
        title: `${blog.frontmatter.title} | Blog | Jorbites`,
        description: blog.frontmatter.description || 'Blog post',
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
        },
        twitter: {
            card: 'summary_large_image',
            title: `${blog.frontmatter.title} | Jorbites`,
            description: blog.frontmatter.description,
            images: [ogImage],
        },
    };
}

const BlogPage = async (props: PageProps) => {
    const params = await props.params;
    return <BlogDetailClient id={params.id} />;
};

export default BlogPage;
