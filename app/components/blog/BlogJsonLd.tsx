import React from 'react';
import { Blog } from '@/app/utils/markdownUtils';
import { SafeUser } from '@/app/types';
import { JORBITES_URL } from '@/app/utils/constants';

interface BlogJsonLdProps {
    blog: Blog;
    author?: SafeUser | null;
}

const BlogJsonLd: React.FC<BlogJsonLdProps> = ({ blog, author }) => {
    if (!blog || !blog.frontmatter) return null;

    // Extract first image from markdown content if present, or fallback
    const imageMatch = blog.content
        ? blog.content.match(/!\[.*?\]\((.*?)\)/)
        : null;
    const imageUrl = imageMatch
        ? imageMatch[1]
        : `${JORBITES_URL}/avocado.webp`;

    const blogUrl = `${JORBITES_URL}/blog/${blog.id}`;

    const authorEntity = author
        ? {
              '@type': 'Person',
              name: author.name || 'Jorbites Author',
              url: `${JORBITES_URL}/profile/${author.id}`,
              ...(author.image ? { image: author.image } : {}),
          }
        : {
              '@type': 'Organization',
              name: 'Jorbites',
              url: JORBITES_URL,
          };

    const blogJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': blogUrl,
        },
        headline: blog.frontmatter.title,
        description: blog.frontmatter.description || blog.frontmatter.title,
        image: [imageUrl],
        datePublished: blog.frontmatter.date,
        dateModified: blog.frontmatter.date,
        author: authorEntity,
        publisher: {
            '@type': 'Organization',
            name: 'Jorbites',
            url: JORBITES_URL,
            logo: {
                '@type': 'ImageObject',
                url: `${JORBITES_URL}/icon-192.png`,
            },
        },
        inLanguage: blog.language || 'en',
        articleSection:
            blog.category === 'releases' ? 'Releases' : 'Latest Stories',
        articleBody: blog.content,
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(blogJsonLd)
                    .replace(/</g, '\\u003c')
                    .replace(/>/g, '\\u003e'),
            }}
        />
    );
};

export default BlogJsonLd;
