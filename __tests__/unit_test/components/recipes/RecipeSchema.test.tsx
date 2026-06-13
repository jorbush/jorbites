import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RecipeSchema from '@/app/components/recipes/RecipeSchema';

describe('RecipeSchema', () => {
    const mockProps = {
        title: 'Test Recipe',
        description: 'A test recipe description',
        imageSrc:
            'https://res.cloudinary.com/demo/image/upload/v1234567890/recipe.jpg',
        createdAt: '2023-01-01T00:00:00.000Z',
        userName: 'Test User',
        minutes: 45,
        ingredients: ['Ing 1', 'Ing 2'],
        steps: ['Step 1', 'Step 2', 'Step 3', 'Step 4'],
        categories: ['Main Course'],
        extraImages: [
            'https://res.cloudinary.com/demo/image/upload/v1/step1.jpg',
            'https://res.cloudinary.com/demo/image/upload/v1/step2.jpg',
        ],
    };

    it('renders with correct JSON-LD structure', () => {
        render(<RecipeSchema {...mockProps} />);

        const scriptTag = document.querySelector(
            'script[type="application/ld+json"]'
        );
        expect(scriptTag).not.toBeNull();

        const json = JSON.parse(scriptTag?.innerHTML || '{}');
        expect(json['@context']).toBe('https://schema.org');
        expect(json['@type']).toBe('Recipe');
        expect(json.name).toBe(mockProps.title);
        expect(json.recipeInstructions).toHaveLength(4);
        expect(json.recipeInstructions[0]['@type']).toBe('HowToStep');
        expect(json.recipeInstructions[0].text).toBe('Step 1');
    });

    it('generates high-res image URLs for Cloudinary images', () => {
        render(<RecipeSchema {...mockProps} />);

        const scriptTag = document.querySelector(
            'script[type="application/ld+json"]'
        );
        const json = JSON.parse(scriptTag?.innerHTML || '{}');

        // Check main image
        const expectedMainImageUrl =
            'https://res.cloudinary.com/demo/image/upload/w_1200,h_900,c_fill,q_auto:good/v1234567890/recipe.jpg';
        expect(json.image).toBe(expectedMainImageUrl);

        // Check step 1 image (should come from extraImages[0])
        const expectedStep1Image =
            'https://res.cloudinary.com/demo/image/upload/w_1200,h_900,c_fill,q_auto:good/v1/step1.jpg';
        expect(json.recipeInstructions[0].image).toBe(expectedStep1Image);

        // Check step 2 image (should come from extraImages[1])
        const expectedStep2Image =
            'https://res.cloudinary.com/demo/image/upload/w_1200,h_900,c_fill,q_auto:good/v1/step2.jpg';
        expect(json.recipeInstructions[1].image).toBe(expectedStep2Image);

        // Check step 3 image (should fallback to main image as no extra image for index 2)
        expect(json.recipeInstructions[2].image).toBe(expectedMainImageUrl);
    });

    it('replaces existing transformations in Cloudinary URLs', () => {
        const propsWithTransforms = {
            ...mockProps,
            imageSrc:
                'https://res.cloudinary.com/demo/image/upload/w_500,h_500/v1234567890/recipe.jpg',
        };
        render(<RecipeSchema {...propsWithTransforms} />);

        const scriptTag = document.querySelector(
            'script[type="application/ld+json"]'
        );
        const json = JSON.parse(scriptTag?.innerHTML || '{}');

        const expectedImageUrl =
            'https://res.cloudinary.com/demo/image/upload/w_1200,h_900,c_fill,q_auto:good/v1234567890/recipe.jpg';
        // Should NOT contain w_500,h_500
        expect(json.image).toBe(expectedImageUrl);
        expect(json.image).not.toContain('w_500');
    });
    it('includes video object when youtubeUrl is provided', () => {
        const props = {
            ...mockProps,
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        };
        const { container } = render(<RecipeSchema {...props} />);

        const scriptTag = container.querySelector(
            'script[type="application/ld+json"]'
        );
        const data = JSON.parse(scriptTag?.innerHTML || '{}');

        expect(data.video).toBeDefined();
        expect(data.video).toMatchObject({
            '@type': 'VideoObject',
            name: mockProps.title,
            description: mockProps.description,
            contentUrl: props.youtubeUrl,
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        });
        expect(data.video.thumbnailUrl).toContain(
            'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
        );
    });

    it('does not include video object if youtubeUrl is invalid', () => {
        const props = {
            ...mockProps,
            youtubeUrl: 'https://invalid-url.com',
        };
        const { container } = render(<RecipeSchema {...props} />);

        const scriptTag = container.querySelector(
            'script[type="application/ld+json"]'
        );
        const data = JSON.parse(scriptTag?.innerHTML || '{}');

        expect(data.video).toBeUndefined();
    });

    it('does not include video object if youtubeUrl is null', () => {
        const props = {
            ...mockProps,
            youtubeUrl: null,
        };
        const { container } = render(<RecipeSchema {...props} />);

        const scriptTag = container.querySelector(
            'script[type="application/ld+json"]'
        );
        const data = JSON.parse(scriptTag?.innerHTML || '{}');

        expect(data.video).toBeUndefined();
    });

    it('includes aggregateRating when averageRating and ratingCount are provided', () => {
        const props = {
            ...mockProps,
            averageRating: 4.8,
            ratingCount: 15,
        };
        const { container } = render(<RecipeSchema {...props} />);

        const scriptTag = container.querySelector(
            'script[type="application/ld+json"]'
        );
        const data = JSON.parse(scriptTag?.innerHTML || '{}');

        expect(data.aggregateRating).toBeDefined();
        expect(data.aggregateRating).toMatchObject({
            '@type': 'AggregateRating',
            ratingValue: '4.8',
            ratingCount: 15,
            bestRating: '5',
            worstRating: '1',
        });
    });

    it('includes reviews schema when comments with ratings are provided', () => {
        const mockComments = [
            {
                id: 'c1',
                userId: 'u1',
                comment: 'Delicious!',
                rating: 5,
                createdAt: '2023-01-02T10:00:00.000Z',
                recipeId: 'recipe1',
                user: {
                    id: 'u1',
                    name: 'Reviewer Alice',
                    image: null,
                    level: 3,
                    verified: false,
                    badges: [],
                },
            },
            {
                id: 'c2',
                userId: 'u2',
                comment: 'Good, but too sweet',
                rating: 3,
                createdAt: '2023-01-03T12:00:00.000Z',
                recipeId: 'recipe1',
                user: {
                    id: 'u2',
                    name: 'Reviewer Bob',
                    image: null,
                    level: 2,
                    verified: true,
                    badges: [],
                },
            },
            {
                id: 'c3',
                userId: 'u3',
                comment: 'Just a question without a rating',
                rating: null,
                createdAt: '2023-01-04T15:00:00.000Z',
                recipeId: 'recipe1',
                user: {
                    id: 'u3',
                    name: 'Guest User',
                    image: null,
                    level: 1,
                    verified: false,
                    badges: [],
                },
            },
        ];
        const props = {
            ...mockProps,
            comments: mockComments,
        };
        const { container } = render(<RecipeSchema {...props} />);

        const scriptTag = container.querySelector(
            'script[type="application/ld+json"]'
        );
        const data = JSON.parse(scriptTag?.innerHTML || '{}');

        expect(data.review).toBeDefined();
        expect(data.review).toHaveLength(2); // Only c1 and c2 have ratings

        expect(data.review[0]).toMatchObject({
            '@type': 'Review',
            author: {
                '@type': 'Person',
                name: 'Reviewer Alice',
            },
            datePublished: '2023-01-02T10:00:00.000Z',
            reviewBody: 'Delicious!',
            reviewRating: {
                '@type': 'Rating',
                ratingValue: 5,
                bestRating: '5',
                worstRating: '1',
            },
        });

        expect(data.review[1]).toMatchObject({
            '@type': 'Review',
            author: {
                '@type': 'Person',
                name: 'Reviewer Bob',
            },
            datePublished: '2023-01-03T12:00:00.000Z',
            reviewBody: 'Good, but too sweet',
            reviewRating: {
                '@type': 'Rating',
                ratingValue: 3,
                bestRating: '5',
                worstRating: '1',
            },
        });
    });

    it('escapes < and > characters to prevent XSS script breakout', () => {
        const props = {
            ...mockProps,
            title: 'Test </script><script>alert(1)</script> Recipe',
        };
        const { container } = render(<RecipeSchema {...props} />);

        const scriptTag = container.querySelector(
            'script[type="application/ld+json"]'
        );

        // The raw closing/opening script tags should NOT be present in innerHTML/textContent
        expect(scriptTag?.innerHTML).not.toContain('</script>');
        expect(scriptTag?.innerHTML).not.toContain('<script>');

        // But the JSON should still parse correctly and decode the escaped characters
        const data = JSON.parse(scriptTag?.innerHTML || '{}');
        expect(data.name).toBe(
            'Test </script><script>alert(1)</script> Recipe'
        );
    });
});
