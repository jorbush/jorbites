import { Metadata } from 'next';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EmptyState from '@/app/components/utils/EmptyState';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getListById from '@/app/actions/getListById';
import ListClient from './ListClient';
import ListJsonLd from '@/app/components/lists/ListJsonLd';
import { NextResponse } from 'next/server';
import { createOGImageUrl } from '@/app/utils/seo-utils';

interface IParams {
    listId?: string;
}

export async function generateMetadata(props: {
    params: Promise<IParams>;
}): Promise<Metadata> {
    const params = await props.params;
    const listData = await getListById(params);

    if (!listData || listData instanceof NextResponse) {
        return {
            title: 'Lista no encontrada | Jorbites',
            description: 'La lista solicitada no pudo ser encontrada.',
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const { list, recipes } = listData;

    if (list.isPrivate) {
        return {
            title: `${list.name} | Jorbites`,
            description: 'Esta lista de recetas es privada.',
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    const listTitle = `${list.name} | Lista de Recetas | Jorbites`;
    const authorName = list.user?.name || 'la comunidad';
    const recipeCount = recipes.length;
    const recipeNamesPreview = recipes
        .slice(0, 3)
        .map((r) => r.title)
        .join(', ');
    const description =
        recipeCount > 0
            ? `Descubre la lista de recetas "${list.name}" creada por ${authorName} en Jorbites. Incluye ${recipeCount} ${recipeCount === 1 ? 'receta' : 'recetas'}: ${recipeNamesPreview}${recipeCount > 3 ? ' y más.' : '.'}`
            : `Descubre la lista de recetas "${list.name}" creada por ${authorName} en Jorbites.`;

    const firstImage = recipes.find((r) => r.imageSrc)?.imageSrc;
    const ogImage = createOGImageUrl(firstImage);

    return {
        title: listTitle,
        description,
        alternates: {
            canonical: `/lists/${params.listId}`,
        },
        openGraph: {
            title: `${list.name} | Jorbites`,
            description,
            url: `/lists/${params.listId}`,
            siteName: 'Jorbites',
            type: 'article',
            images: [
                {
                    url: ogImage,
                    width: 1200,
                    height: 630,
                    alt: list.name,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: `${list.name} | Jorbites`,
            description,
            images: [ogImage],
        },
        robots: {
            index: true,
            follow: true,
            googleBot: {
                index: true,
                follow: true,
                'max-image-preview': 'large',
                'max-snippet': -1,
            },
        },
    };
}

const ListPage = async (props: { params: Promise<IParams> }) => {
    const [params, currentUser] = await Promise.all([
        props.params,
        getCurrentUser(),
    ]);

    if (!params.listId) {
        return (
            <ClientOnly>
                <EmptyState
                    title="List not found"
                    subtitle="Invalid ID"
                />
            </ClientOnly>
        );
    }

    const listData = await getListById(params);

    if (!listData) {
        return (
            <ClientOnly>
                <EmptyState
                    title="List not found"
                    subtitle="It may have been deleted"
                />
            </ClientOnly>
        );
    }

    if (listData instanceof NextResponse) {
        if (listData.status === 401) {
            return (
                <ClientOnly>
                    <EmptyState
                        title="Unauthorized"
                        subtitle="This list is private"
                    />
                </ClientOnly>
            );
        }

        return (
            <ClientOnly>
                <EmptyState
                    title="List not found"
                    subtitle="It may have been deleted"
                />
            </ClientOnly>
        );
    }

    const { list, recipes } = listData;

    return (
        <>
            {!list.isPrivate && (
                <ListJsonLd
                    list={list}
                    recipes={recipes}
                />
            )}
            <ClientOnly>
                <ListClient
                    list={list}
                    recipes={recipes}
                    currentUser={currentUser}
                />
            </ClientOnly>
        </>
    );
};

export default ListPage;
