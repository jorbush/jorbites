import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import RecipeCardSkeleton from '@/app/components/recipes/RecipeCardSkeleton';

describe('RecipeCardSkeleton', () => {
    it('renders skeleton structure correctly', () => {
        const { container } = render(<RecipeCardSkeleton />);

        // Check outer container has correct classes
        const outerDiv = container.firstChild as HTMLElement;
        expect(outerDiv.className).toContain('col-span-1');
        expect(outerDiv.className).toContain('animate-pulse');
    });

    it('contains flex container with proper gap', () => {
        const { container } = render(<RecipeCardSkeleton />);

        // Find the flex container
        const flexContainer = container.querySelector('.flex.flex-col');
        expect(flexContainer).toBeDefined();
        expect(flexContainer).not.toBeNull();
        expect(flexContainer?.className).toContain('w-full');
        expect(flexContainer?.className).toContain('gap-2');
    });

    it('renders image placeholder with aspect-square ratio', () => {
        const { container } = render(<RecipeCardSkeleton />);

        // Find image placeholder
        const imagePlaceholder = container.querySelector('.aspect-square');
        expect(imagePlaceholder).not.toBeNull();
        expect(imagePlaceholder?.className).toContain('bg-gray-200');
        expect(imagePlaceholder?.className).toContain('dark:bg-gray-700');
        expect(imagePlaceholder?.className).toContain('rounded-xl');
    });

    it('renders title and subtitle placeholders with correct dimensions', () => {
        const { container } = render(<RecipeCardSkeleton />);

        // Check for placeholder elements (we're looking for the divs representing text)
        const divs = container.querySelectorAll('.flex.flex-col > div');

        // First text placeholder (title) - after the image placeholder
        const titlePlaceholder = divs[1];
        expect(titlePlaceholder.className).toContain('h-6');
        expect(titlePlaceholder.className).toContain('w-3/4');
        expect(titlePlaceholder.className).toContain('bg-gray-200');
        expect(titlePlaceholder.className).toContain('dark:bg-gray-700');

        // Second text placeholder (subtitle)
        const subtitlePlaceholder = divs[2];
        expect(subtitlePlaceholder.className).toContain('h-4');
        expect(subtitlePlaceholder.className).toContain('w-1/4');
        expect(subtitlePlaceholder.className).toContain('bg-gray-200');
        expect(subtitlePlaceholder.className).toContain('dark:bg-gray-700');
    });

    it('renders all three skeleton elements', () => {
        const { container } = render(<RecipeCardSkeleton />);

        // Check that we have exactly 3 placeholder elements
        // (image placeholder, title placeholder, and subtitle placeholder)
        const placeholderElements = container.querySelectorAll(
            '.bg-gray-200.dark\\:bg-gray-700'
        );
        expect(placeholderElements.length).toBe(3);
    });
});
