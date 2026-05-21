import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RecipeBookPDF } from '@/app/components/profile/RecipeBookPDF';

// Helper to flatten arrays of styles (common in @react-pdf/renderer but not supported natively in react-dom styles)
const flattenStyle = (style: any): any => {
    if (!style) return undefined;
    if (Array.isArray(style)) {
        return Object.assign({}, ...style.map(flattenStyle));
    }
    return style;
};

// Mock @react-pdf/renderer as HTML elements to test the rendering structure
vi.mock('@react-pdf/renderer', () => {
    return {
        Document: ({ children }: any) => (
            <div data-testid="pdf-document">{children}</div>
        ),
        Page: ({ children, style }: any) => (
            <div
                data-testid="pdf-page"
                style={flattenStyle(style)}
            >
                {children}
            </div>
        ),
        Text: ({ children, style, render }: any) => {
            if (render) {
                return (
                    <span data-testid="pdf-text-render">
                        {render({ pageNumber: 2, totalPages: 5 })}
                    </span>
                );
            }
            return (
                <span
                    data-testid="pdf-text"
                    style={flattenStyle(style)}
                >
                    {children}
                </span>
            );
        },
        View: ({ children, style }: any) => (
            <div
                data-testid="pdf-view"
                style={flattenStyle(style)}
            >
                {children}
            </div>
        ),
        Image: ({ src, style }: any) => (
            <img
                data-testid="pdf-image"
                src={src}
                style={flattenStyle(style)}
                alt="pdf-img"
            />
        ),
        Font: {
            register: vi.fn(),
            registerEmojiSource: vi.fn(),
        },
        StyleSheet: {
            create: (styles: any) => styles,
        },
    };
});

describe('RecipeBookPDF Component', () => {
    const mockRecipes = [
        {
            id: 'recipe-1',
            title: 'Chocolate Cake',
            description: 'Delicious chocolate cake',
            imageSrc: 'https://example.com/cake.jpg',
            minutes: 45,
            method: 'Oven',
            categories: ['Dessert'],
            ingredients: ['1 cup sugar', '2 cups flour', '1/2 cup cocoa'],
            steps: ['Mix dry ingredients', 'Add wet ingredients', 'Bake'],
            createdAt: '2026-05-21T00:00:00.000Z',
            numLikes: 5,
            userId: 'user-123',
        },
        {
            id: 'recipe-2',
            title: 'Salad',
            description: 'Healthy green salad',
            imageSrc: '/images/placeholder.webp',
            minutes: 10,
            method: 'No-cook',
            categories: ['Salads', 'Healthy'],
            ingredients: ['Lettuce', 'Tomatoes', 'Cucumber'],
            steps: ['Chop vegetables', 'Toss with dressing'],
            createdAt: '2026-05-21T00:00:00.000Z',
            numLikes: 12,
            userId: 'user-123',
        },
    ];

    const mockLabels = {
        title: 'My Recipe Book',
        createdBy: 'Created by',
        subtitle: 'Collection of 2 recipes',
        ingredients: 'Ingredients',
        steps: 'Steps',
        minutes: 'Minutes',
        method: 'Method',
        categories: 'Categories',
        page: 'Page',
        of: 'of',
        tableOfContents: 'Table of Contents',
        timeUnit: 'min',
        recipes: 'recipes',
    };

    afterEach(() => {
        cleanup();
    });

    it('renders the cover page with title, subtitle, author, and logo', () => {
        render(
            <RecipeBookPDF
                recipes={mockRecipes}
                userName="Alice"
                logoUrl="https://example.com/logo.png"
                labels={mockLabels}
            />
        );

        // Check cover title & details
        expect(screen.getByText('My Recipe Book')).toBeDefined();
        expect(screen.getByText('Collection of 2 recipes')).toBeDefined();
        expect(screen.getByText('Created by Alice')).toBeDefined();
        expect(screen.getByText('2 recipes')).toBeDefined();

        // Check logo image src
        const images = screen.getAllByTestId('pdf-image');
        expect(images[0].getAttribute('src')).toBe(
            'https://example.com/logo.png'
        );
    });

    it('renders the table of contents', () => {
        render(
            <RecipeBookPDF
                recipes={mockRecipes}
                userName="Alice"
                logoUrl="https://example.com/logo.png"
                labels={mockLabels}
            />
        );

        expect(screen.getAllByText('Table of Contents')).toBeDefined();
        expect(screen.getByText('1. Chocolate Cake')).toBeDefined();
        expect(screen.getByText('2. Salad')).toBeDefined();

        // Page number displays should be 3 and 4 (since cover is 1, TOC is 2)
        expect(screen.getByText('3')).toBeDefined();
        expect(screen.getByText('4')).toBeDefined();
    });

    it('renders recipe sheets with ingredients, steps, and metadata', () => {
        render(
            <RecipeBookPDF
                recipes={mockRecipes}
                userName="Alice"
                logoUrl="https://example.com/logo.png"
                labels={mockLabels}
            />
        );

        // Verify titles
        expect(screen.getAllByText('Chocolate Cake').length).toBeGreaterThan(0);
        expect(screen.getAllByText('Salad').length).toBeGreaterThan(0);

        // Verify ingredients are rendered
        expect(screen.getByText('1 cup sugar')).toBeDefined();
        expect(screen.getByText('2 cups flour')).toBeDefined();
        expect(screen.getByText('Lettuce')).toBeDefined();

        // Verify steps are rendered
        expect(screen.getByText('Mix dry ingredients')).toBeDefined();
        expect(screen.getByText('Chop vegetables')).toBeDefined();

        // Verify metadata (minutes, method, categories)
        expect(screen.getByText('45 min')).toBeDefined();
        expect(screen.getByText('10 min')).toBeDefined();
        expect(screen.getByText('Oven')).toBeDefined();
        expect(screen.getByText('No-cook')).toBeDefined();
        expect(screen.getByText('Dessert')).toBeDefined();
        expect(screen.getByText('Salads')).toBeDefined();
        expect(screen.getByText('Healthy')).toBeDefined();

        // Check that the image source is proxied
        const images = screen.getAllByTestId('pdf-image');
        expect(images[1].getAttribute('src')).toContain(
            '/api/image-proxy?url=https%3A%2F%2Fexample.com%2Fcake.jpg'
        );
        expect(images[2].getAttribute('src')).toContain(
            '/images/placeholder.png'
        );
        expect(images[2].getAttribute('src')).not.toContain('/api/image-proxy');
    });

    it('renders page footers correctly', () => {
        render(
            <RecipeBookPDF
                recipes={mockRecipes}
                userName="Alice"
                logoUrl="https://example.com/logo.png"
                labels={mockLabels}
            />
        );

        // The mock text-render uses our mock totalPages of 5 and pageNumber of 2
        const pageFooters = screen.getAllByTestId('pdf-text-render');
        expect(pageFooters.length).toBeGreaterThan(0);
        expect(pageFooters[0].textContent).toBe('Page 2 of 5');
    });

    it('parses and renders bold, italic, and bold-italic markdown formatting (including newlines)', () => {
        const recipesWithMarkdown = [
            {
                id: 'recipe-md',
                title: 'Markdown Recipe',
                description:
                    'This is **bold** and *italic* and **_bold-italic_** text. Also __bold__ and _italic_ and __*bold-italic*__ and ***bold-italic-stars***.',
                imageSrc: '/images/placeholder.webp',
                minutes: 15,
                method: 'Stove',
                categories: ['Test'],
                ingredients: ['**1** cup of *sugar*', '__2__ cups of _flour_'],
                steps: [
                    'Step **1**:\nMix *everything* together.',
                    'Step __2__:\nBake with **_love_**.',
                ],
                createdAt: '2026-05-21T00:00:00.000Z',
                numLikes: 3,
                userId: 'user-123',
            },
        ];

        render(
            <RecipeBookPDF
                recipes={recipesWithMarkdown}
                userName="Alice"
                logoUrl="https://example.com/logo.png"
                labels={mockLabels}
            />
        );

        // Find all elements with data-testid="pdf-text"
        const textSpans = screen.getAllByTestId('pdf-text');

        // Assert we have bold styled elements
        const boldElements = textSpans.filter((span) => {
            const style = (span as HTMLElement).style;
            return style.fontWeight === '700' && style.fontStyle !== 'italic';
        });
        expect(boldElements.some((el) => el.textContent === 'bold')).toBe(true);
        expect(boldElements.some((el) => el.textContent === '1')).toBe(true);
        expect(boldElements.some((el) => el.textContent === '2')).toBe(true);

        // Assert we have italic styled elements
        const italicElements = textSpans.filter((span) => {
            const style = (span as HTMLElement).style;
            return style.fontStyle === 'italic' && style.fontWeight !== '700';
        });
        expect(italicElements.some((el) => el.textContent === 'italic')).toBe(
            true
        );
        expect(italicElements.some((el) => el.textContent === 'sugar')).toBe(
            true
        );
        expect(italicElements.some((el) => el.textContent === 'flour')).toBe(
            true
        );
        expect(
            italicElements.some((el) => el.textContent === 'everything')
        ).toBe(true);

        // Assert we have bold-italic styled elements
        const boldItalicElements = textSpans.filter((span) => {
            const style = (span as HTMLElement).style;
            return style.fontWeight === '700' && style.fontStyle === 'italic';
        });
        expect(
            boldItalicElements.some((el) => el.textContent === 'bold-italic')
        ).toBe(true);
        expect(
            boldItalicElements.some(
                (el) => el.textContent === 'bold-italic-stars'
            )
        ).toBe(true);
        expect(boldItalicElements.some((el) => el.textContent === 'love')).toBe(
            true
        );
    });
});
