import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import ListJsonLd from '@/app/components/lists/ListJsonLd';
import { SafeList, SafeRecipe, SafeUser } from '@/app/types';

describe('ListJsonLd Component', () => {
    afterEach(() => {
        cleanup();
    });

    const mockUser: SafeUser = {
        id: 'chef-1',
        name: 'Chef Mario',
        email: null,
        image: null,
        emailVerified: null,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        favoriteIds: [],
        emailNotifications: false,
        level: 5,
        verified: true,
        badges: [],
    };

    const mockPublicList: SafeList = {
        id: 'list-42',
        name: 'Mejores Pastas <script>alert(1)</script>',
        userId: 'chef-1',
        recipeIds: ['recipe-1', 'recipe-2'],
        isDefault: false,
        isPrivate: false,
        createdAt: '2024-01-01T00:00:00.000Z',
        updatedAt: '2024-01-01T00:00:00.000Z',
        user: mockUser,
    };

    const mockPrivateList: SafeList = {
        ...mockPublicList,
        isPrivate: true,
    };

    const mockRecipes: (SafeRecipe & { user: SafeUser })[] = [
        {
            id: 'recipe-1',
            title: 'Pasta Carbonara',
            imageSrc:
                'https://res.cloudinary.com/demo/image/upload/v12345/carbonara.jpg',
            minutes: 20,
            description: 'Auténtica carbonara italiana',
            category: 'Italiana',
            method: 'Cocinar',
            numLikes: 10,
            ingredients: ['Pasta', 'Huevo', 'Guanciale', 'Pecorino'],
            steps: ['Hervir pasta', 'Mezclar'],
            extraImages: [],
            userId: 'chef-1',
            createdAt: '2024-01-01T00:00:00.000Z',
            coCooksIds: [],
            linkedRecipeIds: [],
            user: mockUser,
        },
        {
            id: 'recipe-2',
            title: 'Pesto Genovese',
            imageSrc: null as any,
            minutes: 15,
            description: 'Pesto tradicional',
            category: 'Italiana',
            method: 'Triturar',
            numLikes: 7,
            ingredients: ['Albahaca', 'Piñones'],
            steps: ['Triturar todo'],
            extraImages: [],
            userId: 'chef-1',
            createdAt: '2024-01-02T00:00:00.000Z',
            coCooksIds: [],
            linkedRecipeIds: [],
            user: mockUser,
        },
    ];

    it('returns null when list is private', () => {
        const { container } = render(
            <ListJsonLd
                list={mockPrivateList}
                recipes={mockRecipes}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders application/ld+json script with BreadcrumbList and ItemList for public list', () => {
        const { container } = render(
            <ListJsonLd
                list={mockPublicList}
                recipes={mockRecipes}
            />
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
        expect(breadcrumb.itemListElement).toHaveLength(3);
        expect(breadcrumb.itemListElement[0].name).toBe('Inicio');
        expect(breadcrumb.itemListElement[0].item).toBe('https://jorbites.com');
        expect(breadcrumb.itemListElement[1].name).toBe('Listas');
        expect(breadcrumb.itemListElement[1].item).toBe(
            'https://jorbites.com/lists'
        );
        expect(breadcrumb.itemListElement[2].name).toBe(
            'Mejores Pastas <script>alert(1)</script>'
        );
        expect(breadcrumb.itemListElement[2].item).toBe(
            'https://jorbites.com/lists/list-42'
        );

        // Check ItemList
        const itemList = jsonContent['@graph'].find(
            (item: any) => item['@type'] === 'ItemList'
        );
        expect(itemList).toBeDefined();
        expect(itemList.name).toBe('Mejores Pastas <script>alert(1)</script>');
        expect(itemList.url).toBe('https://jorbites.com/lists/list-42');
        expect(itemList.numberOfItems).toBe(2);
        expect(itemList.author).toEqual({
            '@type': 'Person',
            name: 'Chef Mario',
        });

        expect(itemList.itemListElement).toHaveLength(2);
        expect(itemList.itemListElement[0].position).toBe(1);
        expect(itemList.itemListElement[0].name).toBe('Pasta Carbonara');
        expect(itemList.itemListElement[0].url).toBe(
            'https://jorbites.com/recipes/recipe-1'
        );
        expect(itemList.itemListElement[0].image).toContain('cloudinary.com');

        expect(itemList.itemListElement[1].position).toBe(2);
        expect(itemList.itemListElement[1].name).toBe('Pesto Genovese');
        expect(itemList.itemListElement[1].url).toBe(
            'https://jorbites.com/recipes/recipe-2'
        );
        expect(itemList.itemListElement[1].image).toBeUndefined();
    });

    it('escapes < and > in HTML output to prevent script breakout', () => {
        const { container } = render(
            <ListJsonLd
                list={mockPublicList}
                recipes={mockRecipes}
            />
        );
        const scriptHtml = container.innerHTML;

        expect(scriptHtml).not.toContain('<script>alert(1)</script>');
        expect(scriptHtml).toContain('\\u003cscript\\u003e');
    });
});
