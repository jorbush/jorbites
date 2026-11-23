import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { RecipeNutritionSection } from '@/app/components/recipes/RecipeNutritionSection';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: { defaultValue?: string }) => {
            if (key === 'dietary_gluten_free') return 'Gluten-Free';
            if (key === 'dietary_high_protein') return 'High-Protein';
            if (options?.defaultValue) return options.defaultValue;
            return key;
        },
    }),
}));

describe('RecipeNutritionSection', () => {
    afterEach(() => {
        cleanup();
    });

    it('returns null when neither nutrition fields nor dietary tags are provided', () => {
        const { container } = render(<RecipeNutritionSection />);
        expect(container.firstChild).toBeNull();
    });

    it('renders all nutritional values including valid zero values', () => {
        render(
            <RecipeNutritionSection
                calories={420}
                protein={32}
                carbohydrates={0}
                fat={14}
                saturatedFat={0}
                fiber={0}
                sugar={0}
                sodium={450}
            />
        );

        expect(screen.getByTestId('recipe-nutrition-section')).toBeDefined();
        expect(screen.getByText('420 kcal')).toBeDefined();
        expect(screen.getByTestId('nutrient-protein').textContent).toContain(
            '32g'
        );
        expect(
            screen.getByTestId('nutrient-carbohydrates').textContent
        ).toContain('0g');
        expect(screen.getByTestId('nutrient-fat').textContent).toContain('14g');
        expect(
            screen.getByTestId('nutrient-saturatedFat').textContent
        ).toContain('0g');
        expect(screen.getByTestId('nutrient-fiber').textContent).toContain(
            '0g'
        );
        expect(screen.getByTestId('nutrient-sugar').textContent).toContain(
            '0g'
        );
        expect(screen.getByTestId('nutrient-sodium').textContent).toContain(
            '450mg'
        );
    });

    it('renders dietary tags even without extended macros', () => {
        render(
            <RecipeNutritionSection
                dietaryTags={['gluten-free', 'high-protein']}
            />
        );

        expect(screen.getByTestId('recipe-dietary-tags')).toBeDefined();
        expect(screen.getByTestId('dietary-tag-gluten-free')).toBeDefined();
        expect(screen.getByText('Gluten-Free')).toBeDefined();
        expect(screen.getByText('High-Protein')).toBeDefined();
    });
});
