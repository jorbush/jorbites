import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import {
    chunkArray,
    parseFormattedText,
    estimateTextHeight,
    calculateLayoutParameters,
} from '@/app/utils/recipeBookUtils';

vi.mock('@react-pdf/renderer', () => ({
    Text: ({ children, style }: any) => (
        <span
            data-testid="pdf-text"
            style={style}
        >
            {children}
        </span>
    ),
}));

describe('recipeBookUtils', () => {
    describe('chunkArray', () => {
        it('chunks a non-empty array into correct chunk sizes', () => {
            const arr = [1, 2, 3, 4, 5];
            expect(chunkArray(arr, 2)).toEqual([[1, 2], [3, 4], [5]]);
            expect(chunkArray(arr, 3)).toEqual([
                [1, 2, 3],
                [4, 5],
            ]);
            expect(chunkArray(arr, 10)).toEqual([[1, 2, 3, 4, 5]]);
        });

        it('returns empty array when source is empty', () => {
            expect(chunkArray([], 2)).toEqual([]);
        });
    });

    describe('parseFormattedText', () => {
        it('returns empty string if input is empty or null', () => {
            expect(parseFormattedText('')).toBe('');
            expect(parseFormattedText(null as any)).toBe('');
        });

        it('returns raw text if no markdown formatting is present', () => {
            const result = parseFormattedText('Just plain text');
            expect(result).toEqual(['Just plain text']);
        });

        it('correctly parses bold markdown **bold** or __bold__', () => {
            const result = parseFormattedText(
                'text **bold** and __bold2__'
            ) as any[];
            expect(result.length).toBe(5);
            expect(result[0]).toBe('text ');
            expect(result[1].props.children).toBe('bold');
            expect(result[1].props.style).toEqual([{}, { fontWeight: 700 }]);
            expect(result[2]).toBe(' and ');
            expect(result[3].props.children).toBe('bold2');
            expect(result[3].props.style).toEqual([{}, { fontWeight: 700 }]);
            expect(result[4]).toBe('');
        });

        it('correctly parses italic markdown *italic* or _italic_', () => {
            const result = parseFormattedText(
                'text *italic* and _italic2_'
            ) as any[];
            expect(result.length).toBe(5);
            expect(result[0]).toBe('text ');
            expect(result[1].props.children).toBe('italic');
            expect(result[1].props.style).toEqual([
                {},
                { fontStyle: 'italic' },
            ]);
            expect(result[2]).toBe(' and ');
            expect(result[3].props.children).toBe('italic2');
            expect(result[3].props.style).toEqual([
                {},
                { fontStyle: 'italic' },
            ]);
            expect(result[4]).toBe('');
        });

        it('correctly parses bold-italic markdown ***bold-italic*** or **_bold-italic_**', () => {
            const result = parseFormattedText(
                'text ***bi1*** and **_bi2_**'
            ) as any[];
            expect(result.length).toBe(5);
            expect(result[0]).toBe('text ');
            expect(result[1].props.children).toBe('bi1');
            expect(result[1].props.style).toEqual([
                {},
                { fontWeight: 700, fontStyle: 'italic' },
            ]);
            expect(result[2]).toBe(' and ');
            expect(result[3].props.children).toBe('bi2');
            expect(result[3].props.style).toEqual([
                {},
                { fontWeight: 700, fontStyle: 'italic' },
            ]);
            expect(result[4]).toBe('');
        });
    });

    describe('estimateTextHeight', () => {
        it('estimates height based on line count, line height, and margins', () => {
            // "short text" -> 10 chars. With charsPerLine = 15 => 1 line.
            // 1 line * 12px height + 5px margin = 17px
            expect(estimateTextHeight('short text', 15, 12, 5)).toBe(17);

            // "long text that spans multiple lines" -> 37 chars. With charsPerLine = 15 => 3 lines.
            // 3 lines * 12px height + 5px margin = 41px
            expect(
                estimateTextHeight(
                    'long text that spans multiple lines',
                    15,
                    12,
                    5
                )
            ).toBe(41);
        });

        it('handles empty text gracefully', () => {
            expect(estimateTextHeight('', 15, 12, 5)).toBe(17);
        });
    });

    describe('calculateLayoutParameters', () => {
        const baseRecipe = {
            id: 'rec-1',
            title: 'Chocolate cake',
            description: 'Yummy chocolate cake',
            imageSrc: '/images/cake.webp',
            extraImages: [],
            minutes: 30,
            method: 'Bake',
            categories: ['Cake'],
            ingredients: ['flour', 'sugar', 'cocoa'],
            steps: ['mix', 'bake', 'serve'],
            createdAt: '2026-05-22T00:00:00.000Z',
            numLikes: 3,
            userId: 'user-1',
        };

        it('determines the layout as right-top for a short recipe on index 0', () => {
            const params = calculateLayoutParameters(baseRecipe, 0);
            expect(params.layout).toBe('right-top');
            expect(params.leftImageHeight).toBe(162);
            expect(params.rightImageHeight).toBe(208);
            expect(params.galleryColumn).toBe('left'); // Defaults to left when empty and plenty of space
        });

        it('determines a long recipe layout based on steps count', () => {
            const longRecipe = {
                ...baseRecipe,
                steps: Array(9).fill('A step description'),
            };
            const params = calculateLayoutParameters(longRecipe, 0);
            expect(params.layout).toBe('left-top'); // Long recipes map to left-top on even index
        });

        it('routes the gallery to right column when left column is full of ingredients', () => {
            const fullLeftRecipe = {
                ...baseRecipe,
                ingredients: Array(15).fill('An ingredient description'),
                extraImages: ['/images/step1.webp'],
            };
            const params = calculateLayoutParameters(fullLeftRecipe, 0);
            expect(params.galleryColumn).toBe('right');
        });

        it('scales down gallery image height under constrained layouts', () => {
            const highlyConstrainedRecipe = {
                ...baseRecipe,
                ingredients: Array(22).fill('Ingredient text here'),
                steps: Array(12).fill(
                    'Extremely long step text designed to take up a ton of space and push the layout boundaries! This makes the right column height overflow the printable page area.'
                ),
                extraImages: ['/images/step1.webp', '/images/step2.webp'],
            };
            const params = calculateLayoutParameters(
                highlyConstrainedRecipe,
                0
            );
            // Minimum gallery image height should cap at 50px
            expect(params.galleryImageHeight).toBe(50);
        });

        it('uses 2 colsPerRow by default for 3 extra images under normal layouts', () => {
            const normalRecipeWithImages = {
                ...baseRecipe,
                extraImages: [
                    '/images/step1.webp',
                    '/images/step2.webp',
                    '/images/step3.webp',
                ],
            };
            const params = calculateLayoutParameters(normalRecipeWithImages, 0);
            expect(params.colsPerRow).toBe(2);
        });

        it('switches colsPerRow to 3 when 3 extra images under constrained layouts would overflow', () => {
            const constrainedRecipeWithImages = {
                ...baseRecipe,
                ingredients: Array(22).fill('Ingredient text here'),
                steps: Array(12).fill(
                    'Extremely long step text designed to take up a ton of space and push the layout boundaries! This makes the right column height overflow the printable page area.'
                ),
                extraImages: [
                    '/images/step1.webp',
                    '/images/step2.webp',
                    '/images/step3.webp',
                ],
            };
            const params = calculateLayoutParameters(
                constrainedRecipeWithImages,
                0
            );
            expect(params.colsPerRow).toBe(3);
        });

        it('switches colsPerRow to 4 when 4 extra images under constrained layouts would overflow', () => {
            const constrainedRecipeWithImages = {
                ...baseRecipe,
                ingredients: Array(22).fill('Ingredient text here'),
                steps: Array(12).fill(
                    'Extremely long step text designed to take up a ton of space and push the layout boundaries! This makes the right column height overflow the printable page area.'
                ),
                extraImages: [
                    '/images/step1.webp',
                    '/images/step2.webp',
                    '/images/step3.webp',
                    '/images/step4.webp',
                ],
            };
            const params = calculateLayoutParameters(
                constrainedRecipeWithImages,
                0
            );
            expect(params.colsPerRow).toBe(4);
        });
    });
});
