import { Metadata } from 'next';
import { Suspense } from 'react';
import ClientOnly from '@/app/components/utils/ClientOnly';
import BlogsClient from './blogs-client';
import getCurrentUser from '@/app/actions/getCurrentUser';
import Container from '@/app/components/utils/Container';
import { BlogCardSkeleton } from '@/app/components/blog/BlogCard';

export const metadata: Metadata = {
    title: 'Blog | Jorbites',
    description:
        'Descubre artículos sobre gastronomía, recetas y novedades de Jorbites. Lee consejos de cocina y mantente al día con la comunidad.',
    openGraph: {
        title: 'Blog de Gastronomía y Recetas | Jorbites',
        description:
            'Lee artículos sobre cocina, recetas especiales y novedades de la comunidad Jorbites.',
        type: 'website',
        url: 'https://jorbites.com/blog',
    },
    alternates: {
        canonical: '/blog',
    },
};

interface BlogPageProps {
    searchParams: Promise<{ page?: string; category?: string }>;
}

const BlogPage = async ({ searchParams }: BlogPageProps) => {
    const [currentUser, resolvedParams] = await Promise.all([
        getCurrentUser(),
        searchParams,
    ]);
    const page = parseInt(resolvedParams.page || '1');
    const category = resolvedParams.category;

    return (
        <Suspense
            fallback={
                <Container>
                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
                        {[...Array(2)].map((_, index) => (
                            <BlogCardSkeleton key={index} />
                        ))}
                    </div>
                </Container>
            }
        >
            <ClientOnly>
                <BlogsClient
                    currentUser={currentUser}
                    initialPage={page}
                    category={category}
                    page={page}
                />
            </ClientOnly>
        </Suspense>
    );
};

export default BlogPage;
