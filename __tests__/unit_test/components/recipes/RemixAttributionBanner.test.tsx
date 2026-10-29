import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RemixAttributionBanner from '@/app/components/recipes/RemixAttributionBanner';

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'remixed_from') return 'Remixed from';
            if (key === 'by_author') return 'by';
            if (key === 'earlier_recipe') return 'an earlier recipe';
            return options?.defaultValue || key;
        },
    }),
}));

describe('RemixAttributionBanner', () => {
    it('returns null when neither forkedFromRecipe nor forkedFromRecipeId is present', () => {
        const { container } = render(
            <RemixAttributionBanner
                forkedFromRecipe={null}
                forkedFromRecipeId={null}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders attribution banner with recipe link', () => {
        const mockForked = {
            id: 'original-123',
            title: 'Classic Carbonara',
            user: {
                id: 'author-456',
                name: 'Marco',
                image: 'https://img.test/marco.jpg',
            },
        };

        render(
            <RemixAttributionBanner
                forkedFromRecipe={mockForked}
                forkedFromRecipeId="original-123"
            />
        );

        const banner = screen.getByTestId('remix-attribution-banner');
        expect(banner).toBeInTheDocument();
        expect(screen.getByText('Remixed from')).toBeInTheDocument();

        const recipeLink = screen.getByRole('link', {
            name: 'Classic Carbonara',
        });
        expect(recipeLink).toBeInTheDocument();
        expect(recipeLink).toHaveAttribute('href', '/recipes/original-123');
    });

    it('renders fallback text when recipe data is missing but forkedFromRecipeId exists', () => {
        render(
            <RemixAttributionBanner
                forkedFromRecipe={null}
                forkedFromRecipeId="deleted-recipe-999"
            />
        );

        const banner = screen.getByTestId('remix-attribution-banner');
        expect(banner).toBeInTheDocument();
        expect(screen.getByText('an earlier recipe')).toBeInTheDocument();
    });
});
