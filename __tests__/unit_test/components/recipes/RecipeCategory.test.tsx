import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import RecipeCategoryView from '@/app/components/recipes/RecipeCategory';
import { FaUtensils } from 'react-icons/fa';
import React from 'react';

// Mock the react-i18next hook
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key.toUpperCase(),
    }),
}));

describe('<RecipeCategoryView />', () => {
    const defaultProps = {
        icon: FaUtensils,
        label: 'Main Course',
        description: 'Primary dishes for a meal',
    };

    afterEach(() => {
        cleanup();
        vi.resetAllMocks();
    });

    it('renders the component with correct icon, label, and description', () => {
        render(<RecipeCategoryView {...defaultProps} />);

        // Check if the icon is rendered
        const iconElement = screen.getByTestId('fautensils');
        expect(iconElement).toBeDefined();
        expect(iconElement.getAttribute('class')).contain('text-neutral-600');

        // Check if the label is rendered and translated
        const labelElement = screen.getByText('MAIN COURSE');
        expect(labelElement).toBeDefined();
        expect(labelElement.className).contain('text-lg font-semibold');

        // Check if the description is rendered
        const descriptionElement = screen.getByText(defaultProps.description);
        expect(descriptionElement).toBeDefined();
        expect(descriptionElement.className).contain(
            'font-light text-neutral-500'
        );
    });

    it('applies correct styles to the component', () => {
        render(<RecipeCategoryView {...defaultProps} />);

        const containerElement = screen.getByTestId('recipe-category-view');
        expect(containerElement.className).contain('flex flex-col gap-6');

        const innerContainerElement = screen.getByTestId(
            'recipe-category-inner'
        );
        expect(innerContainerElement.className).contain(
            'flex flex-row items-center gap-4'
        );
    });
});
