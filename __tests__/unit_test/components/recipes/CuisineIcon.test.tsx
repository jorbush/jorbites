import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { CuisineIcon } from '@/app/components/recipes/CuisineIcon';

describe('CuisineIcon Component', () => {
    const cuisines = [
        'Spanish',
        'Catalan',
        'Italian',
        'Mexican',
        'Japanese',
        'Chinese',
        'Indian',
        'French',
        'American',
        'Mediterranean',
        'Middle Eastern',
        'Greek',
        'Thai',
        'Vietnamese',
        'Moroccan',
        'Turkish',
        'Latin American',
        'Caribbean',
        'Nordic',
        'British',
        'German',
        'Eastern European',
        'African',
        'Asian Fusion',
        'International',
    ];

    cuisines.forEach((cuisine) => {
        it(`renders circular flag SVG for ${cuisine} cuisine`, () => {
            const { container } = render(<CuisineIcon cuisine={cuisine} />);
            const svg = container.querySelector('svg');
            expect(svg).not.toBeNull();
            expect(svg?.getAttribute('width')).toBe('20');

            const expectedClipId = `clip-${cuisine.toLowerCase().replace(/\s+/g, '-')}`;
            const clipPath = container.querySelector(
                `clipPath#${expectedClipId}`
            );
            expect(clipPath).not.toBeNull();
        });
    });

    it('renders globe emoji for unsupported/unknown cuisines', () => {
        render(<CuisineIcon cuisine="Unknown Cuisine" />);
        expect(screen.getByText('🌍')).toBeDefined();
    });

    it('accepts custom size prop', () => {
        const { container } = render(
            <CuisineIcon
                cuisine="Italian"
                size={32}
            />
        );
        const svg = container.querySelector('svg');
        expect(svg?.getAttribute('width')).toBe('32');
    });
});
