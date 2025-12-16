import { Metadata } from 'next';
import ClientOnly from '@/app/components/utils/ClientOnly';
import BlogsClient from './blogs-client';
import getCurrentUser from '@/app/actions/getCurrentUser';

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
};

interface BlogPageProps {
    searchParams: Promise<{ page?: string }>;
}

const BlogPage = async ({ searchParams }: BlogPageProps) => {
    const currentUser = await getCurrentUser();
    const resolvedParams = await searchParams;
    const page = parseInt(resolvedParams.page || '1');

    return (
        <ClientOnly>
            <BlogsClient
                currentUser={currentUser}
                initialPage={page}
            />
        </ClientOnly>
    );
};

export default BlogPage;
