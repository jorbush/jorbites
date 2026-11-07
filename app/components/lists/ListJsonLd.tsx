import React from 'react';
import { SafeList, SafeRecipe, SafeUser } from '@/app/types';
import { JORBITES_URL } from '@/app/utils/constants';
import { getHighResImageUrl } from '@/app/utils/seo-utils';

interface ListJsonLdProps {
    list: SafeList;
    recipes: (SafeRecipe & { user: SafeUser })[];
}

const ListJsonLd: React.FC<ListJsonLdProps> = ({ list, recipes }) => {
    if (!list || list.isPrivate) return null;

    const listName = list.name || 'Lista de Recetas';
    const authorName = list.user?.name || 'Usuario de Jorbites';
    const description = `Lista de recetas: ${listName} creada por ${authorName} en Jorbites.`;

    const jsonLd = {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'BreadcrumbList',
                itemListElement: [
                    {
                        '@type': 'ListItem',
                        position: 1,
                        name: 'Inicio',
                        item: JORBITES_URL,
                    },
                    {
                        '@type': 'ListItem',
                        position: 2,
                        name: 'Listas',
                        item: `${JORBITES_URL}/lists`,
                    },
                    {
                        '@type': 'ListItem',
                        position: 3,
                        name: listName,
                        item: `${JORBITES_URL}/lists/${list.id}`,
                    },
                ],
            },
            {
                '@type': 'ItemList',
                name: listName,
                description,
                url: `${JORBITES_URL}/lists/${list.id}`,
                numberOfItems: recipes.length,
                author: {
                    '@type': 'Person',
                    name: authorName,
                },
                itemListElement: recipes.map((recipe, index) => ({
                    '@type': 'ListItem',
                    position: index + 1,
                    name: recipe.title,
                    url: `${JORBITES_URL}/recipes/${recipe.id}`,
                    ...(recipe.imageSrc
                        ? { image: getHighResImageUrl(recipe.imageSrc) }
                        : {}),
                })),
            },
        ],
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(jsonLd)
                    .replace(/</g, '\\u003c')
                    .replace(/>/g, '\\u003e'),
            }}
        />
    );
};

export default ListJsonLd;
