import ClientOnly from '@/app/components/utils/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getLists from '@/app/actions/getLists';
import ListsClient from '@/app/lists/ListsClient';
import ListsPageJsonLd from '@/app/components/lists/ListsPageJsonLd';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Listas de Recetas | Jorbites',
    description:
        'Organiza tus recetas favoritas en colecciones personalizadas y descubre las mejores listas de recetas creadas por la comunidad de Jorbites.',
    keywords: [
        'listas de recetas',
        'colecciones de recetas',
        'recetas',
        'recetario',
        'guardar recetas',
        'recipe lists',
        'jorbites',
    ],
    alternates: {
        canonical: '/lists',
    },
    openGraph: {
        title: 'Listas de Recetas | Jorbites',
        description:
            'Organiza tus recetas favoritas en colecciones personalizadas y descubre las mejores listas de recetas creadas por la comunidad de Jorbites.',
        url: '/lists',
        siteName: 'Jorbites',
        type: 'website',
        images: [
            {
                url: '/jorbites-social.jpg',
                width: 1200,
                height: 630,
                alt: 'Listas de Recetas en Jorbites',
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'Listas de Recetas | Jorbites',
        description:
            'Organiza tus recetas favoritas en colecciones personalizadas y descubre las mejores listas de recetas creadas por la comunidad de Jorbites.',
        images: ['/jorbites-social.jpg'],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            'max-video-preview': -1,
            'max-image-preview': 'large',
            'max-snippet': -1,
        },
    },
};

const ListsPage = async () => {
    const [currentUser, { myLists, communityLists }] = await Promise.all([
        getCurrentUser(),
        getLists(),
    ]);

    return (
        <>
            <ListsPageJsonLd communityLists={communityLists} />
            <ClientOnly>
                <ListsClient
                    initialMyLists={myLists}
                    initialCommunityLists={communityLists}
                    currentUser={currentUser}
                />
            </ClientOnly>
        </>
    );
};

export default ListsPage;
