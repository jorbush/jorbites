import React from 'react';
import { render } from '@testing-library/react';
import RecipeSchema from '@/app/components/recipes/RecipeSchema';
import { vi, describe, it, expect } from 'vitest';

describe('RecipeSchema', () => {
    const defaultProps = {
        title: 'Test Recipe',
        description: 'Test Description',
        createdAt: '2023-01-01T00:00:00Z',
        imageSrc: 'https://example.com/image.jpg',
    };

    const getJsonLd = (container: HTMLElement) => {
        const script = container.querySelector(
            'script[type="application/ld+json"]'
        );
        return script ? JSON.parse(script.innerHTML) : null;
    };

    it('renders basic recipe schema correctly', () => {
        const { container } = render(<RecipeSchema {...defaultProps} />);
        const data = getJsonLd(container);

        expect(data).toMatchObject({
            '@context': 'https://schema.org',
            '@type': 'Recipe',
            name: defaultProps.title,
            description: defaultProps.description,
            datePublished: defaultProps.createdAt,
            image: defaultProps.imageSrc,
        });
        expect(data.video).toBeUndefined();
    });

    it('includes video object when youtubeUrl is provided', () => {
        const props = {
            ...defaultProps,
            youtubeUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        };
        const { container } = render(<RecipeSchema {...props} />);
        const data = getJsonLd(container);

        expect(data.video).toBeDefined();
        expect(data.video).toMatchObject({
            '@type': 'VideoObject',
            name: defaultProps.title,
            description: defaultProps.description,
            contentUrl: props.youtubeUrl,
            embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
        });
        expect(data.video.thumbnailUrl).toContain(
            'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
        );
    });

    it('does not include video object if youtubeUrl is invalid', () => {
        const props = {
            ...defaultProps,
            youtubeUrl: 'https://invalid-url.com',
        };
        const { container } = render(<RecipeSchema {...props} />);
        const data = getJsonLd(container);

        expect(data.video).toBeUndefined();
    });

    it('does not include video object if youtubeUrl is null', () => {
        const props = {
            ...defaultProps,
            youtubeUrl: null,
        };
        const { container } = render(<RecipeSchema {...props} />);
        const data = getJsonLd(container);

        expect(data.video).toBeUndefined();
    });
});
