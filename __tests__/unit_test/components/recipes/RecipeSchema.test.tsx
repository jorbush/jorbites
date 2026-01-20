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
});
