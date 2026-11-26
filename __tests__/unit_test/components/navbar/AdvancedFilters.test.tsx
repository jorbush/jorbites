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
                filter_by_date: 'Filter by date',
                date: 'Date',
                from_date: 'From date',
                to_date: 'To date',
                apply: 'Apply',
                cancel: 'Cancel',
                cuisine_italian: 'Italian',
                cuisine_spanish: 'Spanish',
                difficulty: 'Difficulty',
                difficulty_easy: 'Easy',
                difficulty_medium: 'Medium',
                difficulty_hard: 'Hard',
                dietary_tags: 'Tags',
                dietary_vegan: 'Vegan',
                dietary_one_pot: 'One-Pot',
                dietary_spicy: 'Spicy',
                exclude_allergens: 'Hide recipes with…',
                allergen_gluten: 'Gluten',
                allergen_milk: 'Dairy',
                macros_per_serving: 'Macros per serving (g)',
                min_protein: 'Min protein',
                max_carbs: 'Max carbs',
                max_fat: 'Max fat',
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
        mockPathname.mockReturnValue('/');
        // Clear all search params
        Array.from(mockSearchParams.keys()).forEach((key) => {
            mockSearchParams.delete(key);
        });
        vi.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
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

        it('shows active state when difficulty, tags, allergens, or macros are active', () => {
            mockSearchParams.set('excludeAllergens', 'gluten');

            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            expect(button.className).toContain('bg-green-450');
            expect(button.querySelector('.bg-rose-500')).not.toBeNull();
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
            expect(screen.getByTestId('difficulty-pill-easy')).toBeDefined();
            expect(screen.getByTestId('difficulty-pill-medium')).toBeDefined();
            expect(screen.getByTestId('difficulty-pill-hard')).toBeDefined();
            expect(screen.getByTestId('dietary-tag-pill-vegan')).toBeDefined();
            expect(
                screen.getByTestId('exclude-allergen-pill-gluten')
            ).toBeDefined();
            expect(screen.getByTestId('min-protein-input')).toBeDefined();
            expect(screen.getByTestId('max-carbs-input')).toBeDefined();
            expect(screen.getByTestId('max-fat-input')).toBeDefined();
            expect(screen.getByTestId('min-calories-input')).toBeDefined();
            expect(screen.getByTestId('max-calories-input')).toBeDefined();
            expect(screen.getByTestId('min-yield-input')).toBeDefined();
            expect(screen.getByTestId('max-yield-input')).toBeDefined();
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
        it('allows selecting and toggling difficulty pills', () => {
            render(<AdvancedFilters />);

            fireEvent.click(screen.getByTestId('advanced-filters-button'));

            const easyPill = screen.getByTestId('difficulty-pill-easy');
            const hardPill = screen.getByTestId('difficulty-pill-hard');
            expect(easyPill.className).not.toContain('bg-green-450');

            fireEvent.click(easyPill);
            expect(easyPill.className).toContain('bg-green-450');
            expect(easyPill.getAttribute('aria-pressed')).toBe('true');

            fireEvent.click(hardPill);
            expect(hardPill.className).toContain('bg-green-450');
            expect(easyPill.className).not.toContain('bg-green-450');

            fireEvent.click(hardPill);
            expect(hardPill.className).not.toContain('bg-green-450');
        });

        it('allows multi-selecting dietary tag pills', () => {
            render(<AdvancedFilters />);

            fireEvent.click(screen.getByTestId('advanced-filters-button'));

            const veganPill = screen.getByTestId('dietary-tag-pill-vegan');
            const onePotPill = screen.getByTestId('dietary-tag-pill-one-pot');

            fireEvent.click(veganPill);
            fireEvent.click(onePotPill);

            expect(veganPill.className).toContain('bg-green-450');
            expect(onePotPill.className).toContain('bg-green-450');

            fireEvent.click(veganPill);
            expect(veganPill.className).not.toContain('bg-green-450');
            expect(onePotPill.className).toContain('bg-green-450');
        });

        it('allows multi-selecting excluded EU-14 allergen pills', () => {
            render(<AdvancedFilters />);

            fireEvent.click(screen.getByTestId('advanced-filters-button'));

            const glutenPill = screen.getByTestId(
                'exclude-allergen-pill-gluten'
            );
            const milkPill = screen.getByTestId('exclude-allergen-pill-milk');

            fireEvent.click(glutenPill);
            fireEvent.click(milkPill);

            expect(glutenPill.getAttribute('aria-pressed')).toBe('true');
            expect(milkPill.getAttribute('aria-pressed')).toBe('true');

            fireEvent.click(glutenPill);
            expect(glutenPill.getAttribute('aria-pressed')).toBe('false');
            expect(milkPill.getAttribute('aria-pressed')).toBe('true');
        });

        it('allows entering macro inputs', () => {
            render(<AdvancedFilters />);

            fireEvent.click(screen.getByTestId('advanced-filters-button'));

            const minProtein = screen.getByTestId(
                'min-protein-input'
            ) as HTMLInputElement;
            const maxCarbs = screen.getByTestId(
                'max-carbs-input'
            ) as HTMLInputElement;
            const maxFat = screen.getByTestId(
                'max-fat-input'
            ) as HTMLInputElement;

            fireEvent.change(minProtein, { target: { value: '30' } });
            fireEvent.change(maxCarbs, { target: { value: '45' } });
            fireEvent.change(maxFat, { target: { value: '18' } });

            expect(minProtein.value).toBe('30');
            expect(maxCarbs.value).toBe('45');
            expect(maxFat.value).toBe('18');
        });

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

        it('allows selecting and toggling cuisine pills', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            const italianPill = screen.getByTestId('cuisine-pill-italian');
            expect(italianPill.className).not.toContain('bg-green-450');

            fireEvent.click(italianPill);
            expect(italianPill.className).toContain('bg-green-450');

            fireEvent.click(italianPill);
            expect(italianPill.className).not.toContain('bg-green-450');
        });

        it('allows entering date range', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            const startDate = screen.getByTestId(
                'start-date-input'
            ) as HTMLInputElement;
            const endDate = screen.getByTestId(
                'end-date-input'
            ) as HTMLInputElement;

            fireEvent.change(startDate, { target: { value: '2024-01-01' } });
            fireEvent.change(endDate, { target: { value: '2024-01-10' } });

            expect(startDate.value).toBe('2024-01-01');
            expect(endDate.value).toBe('2024-01-10');
        });

        it('initializes inputs with current URL parameter values', () => {
            mockSearchParams.set('minCalories', '300');
            mockSearchParams.set('maxYield', '4');
            mockSearchParams.set('recipeCuisine', 'Spanish');
            mockSearchParams.set('startDate', '2024-01-02');
            mockSearchParams.set('endDate', '2024-01-12');
            mockSearchParams.set('difficulty', 'Medium');
            mockSearchParams.set('dietaryTags', 'vegan,spicy');
            mockSearchParams.set('excludeAllergens', 'gluten,milk');
            mockSearchParams.set('minProtein', '25');
            mockSearchParams.set('maxCarbohydrates', '40');
            mockSearchParams.set('maxFat', '15');

            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            const minCalories = screen.getByTestId(
                'min-calories-input'
            ) as HTMLInputElement;
            const maxYield = screen.getByTestId(
                'max-yield-input'
            ) as HTMLInputElement;
            const spanishPill = screen.getByTestId('cuisine-pill-spanish');
            const startDate = screen.getByTestId(
                'start-date-input'
            ) as HTMLInputElement;
            const endDate = screen.getByTestId(
                'end-date-input'
            ) as HTMLInputElement;
            const mediumPill = screen.getByTestId('difficulty-pill-medium');
            const veganPill = screen.getByTestId('dietary-tag-pill-vegan');
            const spicyPill = screen.getByTestId('dietary-tag-pill-spicy');
            const glutenPill = screen.getByTestId(
                'exclude-allergen-pill-gluten'
            );
            const milkPill = screen.getByTestId('exclude-allergen-pill-milk');
            const minProtein = screen.getByTestId(
                'min-protein-input'
            ) as HTMLInputElement;
            const maxCarbs = screen.getByTestId(
                'max-carbs-input'
            ) as HTMLInputElement;
            const maxFat = screen.getByTestId(
                'max-fat-input'
            ) as HTMLInputElement;

            expect(minCalories.value).toBe('300');
            expect(maxYield.value).toBe('4');
            expect(spanishPill.className).toContain('bg-green-450');
            expect(startDate.value).toBe('2024-01-02');
            expect(endDate.value).toBe('2024-01-12');
            expect(mediumPill.className).toContain('bg-green-450');
            expect(veganPill.className).toContain('bg-green-450');
            expect(spicyPill.className).toContain('bg-green-450');
            expect(glutenPill.getAttribute('aria-pressed')).toBe('true');
            expect(milkPill.getAttribute('aria-pressed')).toBe('true');
            expect(minProtein.value).toBe('25');
            expect(maxCarbs.value).toBe('40');
            expect(maxFat.value).toBe('15');
        });
    });

    describe('Apply and Clear functionality', () => {
        it('updates URL when applying advanced filters', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            const minCalories = screen.getByTestId('min-calories-input');
            const maxYield = screen.getByTestId('max-yield-input');
            const italianPill = screen.getByTestId('cuisine-pill-italian');
            const startDate = screen.getByTestId('start-date-input');
            const endDate = screen.getByTestId('end-date-input');
            const easyPill = screen.getByTestId('difficulty-pill-easy');
            const veganPill = screen.getByTestId('dietary-tag-pill-vegan');
            const onePotPill = screen.getByTestId('dietary-tag-pill-one-pot');
            const glutenPill = screen.getByTestId(
                'exclude-allergen-pill-gluten'
            );
            const minProtein = screen.getByTestId('min-protein-input');

            fireEvent.change(minCalories, { target: { value: '150' } });
            fireEvent.change(maxYield, { target: { value: '5' } });
            fireEvent.click(italianPill);
            fireEvent.change(startDate, { target: { value: '2024-01-05' } });
            fireEvent.change(endDate, { target: { value: '2024-01-08' } });
            fireEvent.click(easyPill);
            fireEvent.click(veganPill);
            fireEvent.click(onePotPill);
            fireEvent.click(glutenPill);
            fireEvent.change(minProtein, { target: { value: '30' } });

            const applyButton = screen.getByTestId('apply-filters-button');
            fireEvent.click(applyButton);

            expect(mockReplace).toHaveBeenCalledWith(
                '/?minCalories=150&maxYield=5&recipeCuisine=Italian&startDate=2024-01-05&endDate=2024-01-08&difficulty=Easy&dietaryTags=vegan%2Cone-pot&excludeAllergens=gluten&minProtein=30'
            );
        });

        it('applies new filters on favorites page', () => {
            mockPathname.mockReturnValue('/favorites');

            render(<AdvancedFilters />);

            fireEvent.click(screen.getByTestId('advanced-filters-button'));
            fireEvent.click(screen.getByTestId('difficulty-pill-hard'));
            fireEvent.click(
                screen.getByTestId('exclude-allergen-pill-peanuts')
            );
            fireEvent.click(screen.getByTestId('apply-filters-button'));

            expect(mockReplace).toHaveBeenCalledWith(
                '/favorites?difficulty=Hard&excludeAllergens=peanuts'
            );
        });

        it('updates URL when clearing advanced filters', () => {
            mockSearchParams.set('minCalories', '200');
            mockSearchParams.set('recipeCuisine', 'Mexican');
            mockSearchParams.set('startDate', '2024-01-05');
            mockSearchParams.set('endDate', '2024-01-08');
            mockSearchParams.set('difficulty', 'Easy');
            mockSearchParams.set('dietaryTags', 'vegan');
            mockSearchParams.set('excludeAllergens', 'gluten');
            mockSearchParams.set('minProtein', '25');

            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            fireEvent.click(button);

            const clearButton = screen.getByTestId('clear-filters-button');
            fireEvent.click(clearButton);

            expect(mockReplace).toHaveBeenCalledWith('/');
        });
    });
});
