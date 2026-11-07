import React from 'react';
import { SafeList } from '@/app/types';
import { JORBITES_URL } from '@/app/utils/constants';

interface ListsPageJsonLdProps {
    communityLists?: SafeList[];
}

const ListsPageJsonLd: React.FC<ListsPageJsonLdProps> = ({
    communityLists = [],
}) => {
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
                ],
            },
            {
                '@type': 'CollectionPage',
                name: 'Listas de Recetas | Jorbites',
                description:
                    'Organiza tus recetas favoritas en colecciones personalizadas y descubre las mejores listas de recetas de la comunidad.',
                url: `${JORBITES_URL}/lists`,
                mainEntity: {
                    '@type': 'ItemList',
                    numberOfItems: communityLists.length,
                    itemListElement: communityLists.map((list, index) => ({
                        '@type': 'ListItem',
                        position: index + 1,
                        name: list.name,
                        url: `${JORBITES_URL}/lists/${list.id}`,
                    })),
                },
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

export default ListsPageJsonLd;
