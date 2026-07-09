import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import AdvancedFilters from '@/app/components/navbar/AdvancedFilters';
import React from 'react';

// Mock the icons
vi.mock('react-icons/fi', () => ({
    FiSliders: () => <div data-testid="sliders-icon" />,
    FiX: () => <div data-testid="x-icon" />,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: { [key: string]: string } = {
                filter_options: 'Filter options',
                clear_all_filters: 'Clear all filters',
                calories: 'Calories',
                min_calories: 'Min calories',
                max_calories: 'Max calories',
                yield: 'Yield',
                min_yield: 'Min servings',
                max_yield: 'Max servings',
                recipe_cuisine: 'Cuisine',
                cuisine_placeholder: 'e.g. Italian, Spanish',
                popular_cuisines: 'Popular cuisines',
                apply: 'Apply',
                cancel: 'Cancel',
                cuisine_italian: 'Italian',
                cuisine_spanish: 'Spanish',
            };
            return translations[key] || key;
        },
    }),
}));

const mockPush = vi.fn();
const mockReplace = vi.fn();
const mockSearchParams = new URLSearchParams();
const mockPathname = vi.fn(() => '/');

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
    useSearchParams: () => mockSearchParams,
    usePathname: () => mockPathname(),
}));

describe('<AdvancedFilters />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // Clear all search params
        Array.from(mockSearchParams.keys()).forEach((key) => {
            mockSearchParams.delete(key);
        });
    });

    afterEach(() => {
        cleanup();
    });

    describe('Basic rendering', () => {
        it('renders filter button with sliders icon', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            expect(button).toBeDefined();
            expect(button.getAttribute('aria-label')).toBe('Filter options');
            expect(screen.getByTestId('sliders-icon')).toBeDefined();
        });

        it('shows notification circle when advanced filters are active', () => {
            mockSearchParams.set('minCalories', '200');

            render(<AdvancedFilters />);

            const notificationCircle = screen
                .getByTestId('advanced-filters-button')
                .querySelector('.bg-rose-500');
            expect(notificationCircle).toBeDefined();
        });

        it('does not show notification circle when no advanced filters are active', () => {
            render(<AdvancedFilters />);

            const notificationCircle = screen
                .getByTestId('advanced-filters-button')
                .querySelector('.bg-rose-500');
            expect(notificationCircle).toBeNull();
        });

        it('applies active styling when filters are active', () => {
            mockSearchParams.set('recipeCuisine', 'Mexican');

            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            expect(button.className).toContain('bg-green-450');
            expect(button.className).toContain('text-white');
        });
    });

    describe('Dropdown interaction', () => {
        it('opens dropdown when button is clicked', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            expect(
                screen.getByTestId('advanced-filters-dropdown')
            ).toBeDefined();
            expect(screen.getByText('Filter options')).toBeDefined();
            expect(screen.getByTestId('min-calories-input')).toBeDefined();
            expect(screen.getByTestId('max-calories-input')).toBeDefined();
            expect(screen.getByTestId('min-yield-input')).toBeDefined();
            expect(screen.getByTestId('max-yield-input')).toBeDefined();
            expect(screen.getByTestId('cuisine-input')).toBeDefined();
        });

        it('closes dropdown when clicking outside', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            expect(
                screen.getByTestId('advanced-filters-dropdown')
            ).toBeDefined();

            // Click outside
            fireEvent.mouseDown(document.body);

            expect(
                screen.queryByTestId('advanced-filters-dropdown')
            ).toBeNull();
        });

        it('closes dropdown when cancel button is clicked', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            const cancelButton = screen.getByTestId('cancel-filters-button');
            fireEvent.click(cancelButton);

            expect(
                screen.queryByTestId('advanced-filters-dropdown')
            ).toBeNull();
        });
    });

    describe('Filter input functionality', () => {
        it('allows entering calories range', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            const minCalories = screen.getByTestId(
                'min-calories-input'
            ) as HTMLInputElement;
            const maxCalories = screen.getByTestId(
                'max-calories-input'
            ) as HTMLInputElement;

            fireEvent.change(minCalories, { target: { value: '250' } });
            fireEvent.change(maxCalories, { target: { value: '600' } });

            expect(minCalories.value).toBe('250');
            expect(maxCalories.value).toBe('600');
        });

        it('allows entering yield range', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            const minYield = screen.getByTestId(
                'min-yield-input'
            ) as HTMLInputElement;
            const maxYield = screen.getByTestId(
                'max-yield-input'
            ) as HTMLInputElement;

            fireEvent.change(minYield, { target: { value: '2' } });
            fireEvent.change(maxYield, { target: { value: '6' } });

            expect(minYield.value).toBe('2');
            expect(maxYield.value).toBe('6');
        });

        it('allows entering and clicking cuisine', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            const cuisineInput = screen.getByTestId(
                'cuisine-input'
            ) as HTMLInputElement;
            fireEvent.change(cuisineInput, { target: { value: 'Japanese' } });
            expect(cuisineInput.value).toBe('Japanese');

            const italianPill = screen.getByTestId('cuisine-pill-italian');
            fireEvent.click(italianPill);
            expect(cuisineInput.value).toBe('Italian');
        });

        it('initializes inputs with current URL parameter values', () => {
            mockSearchParams.set('minCalories', '300');
            mockSearchParams.set('maxYield', '4');
            mockSearchParams.set('recipeCuisine', 'Spanish');

            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            const minCalories = screen.getByTestId(
                'min-calories-input'
            ) as HTMLInputElement;
            const maxYield = screen.getByTestId(
                'max-yield-input'
            ) as HTMLInputElement;
            const cuisineInput = screen.getByTestId(
                'cuisine-input'
            ) as HTMLInputElement;

            expect(minCalories.value).toBe('300');
            expect(maxYield.value).toBe('4');
            expect(cuisineInput.value).toBe('Spanish');
        });
    });

    describe('Apply and Clear functionality', () => {
        it('updates URL when applying advanced filters', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            const minCalories = screen.getByTestId('min-calories-input');
            const maxYield = screen.getByTestId('max-yield-input');
            const cuisineInput = screen.getByTestId('cuisine-input');

            fireEvent.change(minCalories, { target: { value: '150' } });
            fireEvent.change(maxYield, { target: { value: '5' } });
            fireEvent.change(cuisineInput, { target: { value: 'Italian' } });

            const applyButton = screen.getByTestId('apply-filters-button');
            fireEvent.click(applyButton);

            expect(mockReplace).toHaveBeenCalledWith(
                '/?minCalories=150&maxYield=5&recipeCuisine=Italian'
            );
        });

        it('updates URL when clearing advanced filters', () => {
            mockSearchParams.set('minCalories', '200');
            mockSearchParams.set('recipeCuisine', 'Mexican');

            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            const clearButton = screen.getByTestId('clear-filters-button');
            fireEvent.click(clearButton);

            expect(mockReplace).toHaveBeenCalledWith('/');
        });
    });
});
