import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import ListsPageJsonLd from '@/app/components/lists/ListsPageJsonLd';
import { SafeList } from '@/app/types';

describe('ListsPageJsonLd Component', () => {
    afterEach(() => {
        cleanup();
    });

    const mockLists: SafeList[] = [
        {
            id: 'list-1',
            name: 'Postres Deliciosos <script>alert(1)</script>',
            userId: 'user-1',
            recipeIds: ['recipe-1'],
            isDefault: false,
            isPrivate: false,
            createdAt: '2024-01-01T00:00:00.000Z',
            updatedAt: '2024-01-01T00:00:00.000Z',
        },
        {
            id: 'list-2',
            name: 'Cenas Rápidas',
            userId: 'user-2',
            recipeIds: ['recipe-2', 'recipe-3'],
            isDefault: false,
            isPrivate: false,
            createdAt: '2024-01-02T00:00:00.000Z',
            updatedAt: '2024-01-02T00:00:00.000Z',
        },
    ];

    it('renders application/ld+json script with BreadcrumbList and CollectionPage with ItemList', () => {
        const { container } = render(
            <ListsPageJsonLd communityLists={mockLists} />
        );
        const script = container.querySelector(
            'script[type="application/ld+json"]'
        );
        expect(script).not.toBeNull();

        const jsonContent = JSON.parse(script!.textContent || '{}');
        expect(jsonContent['@context']).toBe('https://schema.org');
        expect(jsonContent['@graph']).toBeDefined();
        expect(jsonContent['@graph']).toHaveLength(2);

        // Check BreadcrumbList
        const breadcrumb = jsonContent['@graph'].find(
            (item: any) => item['@type'] === 'BreadcrumbList'
        );
        expect(breadcrumb).toBeDefined();
        expect(breadcrumb.itemListElement).toHaveLength(2);
        expect(breadcrumb.itemListElement[0].name).toBe('Inicio');
        expect(breadcrumb.itemListElement[0].item).toBe('https://jorbites.com');
        expect(breadcrumb.itemListElement[1].name).toBe('Listas');
        expect(breadcrumb.itemListElement[1].item).toBe(
            'https://jorbites.com/lists'
        );

        // Check CollectionPage
        const collection = jsonContent['@graph'].find(
            (item: any) => item['@type'] === 'CollectionPage'
        );
        expect(collection).toBeDefined();
        expect(collection.name).toBe('Listas de Recetas | Jorbites');
        expect(collection.url).toBe('https://jorbites.com/lists');

        // Check ItemList inside CollectionPage
        expect(collection.mainEntity['@type']).toBe('ItemList');
        expect(collection.mainEntity.numberOfItems).toBe(2);
        expect(collection.mainEntity.itemListElement).toHaveLength(2);
        expect(collection.mainEntity.itemListElement[0]).toEqual({
            '@type': 'ListItem',
            position: 1,
            name: 'Postres Deliciosos <script>alert(1)</script>',
            url: 'https://jorbites.com/lists/list-1',
        });
        expect(collection.mainEntity.itemListElement[1]).toEqual({
            '@type': 'ListItem',
            position: 2,
            name: 'Cenas Rápidas',
            url: 'https://jorbites.com/lists/list-2',
        });
    });

    it('handles empty lists gracefully', () => {
        const { container } = render(<ListsPageJsonLd communityLists={[]} />);
        const script = container.querySelector(
            'script[type="application/ld+json"]'
        );
        expect(script).not.toBeNull();

        const jsonContent = JSON.parse(script!.textContent || '{}');
        const collection = jsonContent['@graph'].find(
            (item: any) => item['@type'] === 'CollectionPage'
        );
        expect(collection.mainEntity.numberOfItems).toBe(0);
        expect(collection.mainEntity.itemListElement).toEqual([]);
    });

    it('escapes < and > in HTML output to prevent script breakout', () => {
        const { container } = render(
            <ListsPageJsonLd communityLists={mockLists} />
        );
        const scriptHtml = container.innerHTML;

        expect(scriptHtml).not.toContain('<script>alert(1)</script>');
        expect(scriptHtml).toContain('\\u003cscript\\u003e');
    });
});
