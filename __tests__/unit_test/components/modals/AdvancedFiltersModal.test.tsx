import {
    render,
    screen,
    fireEvent,
    cleanup,
    act,
} from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import AdvancedFiltersModal from '@/app/components/modals/AdvancedFiltersModal';
import useAdvancedFiltersModal from '@/app/hooks/useAdvancedFiltersModal';
import React from 'react';

vi.mock('@/app/hooks/useTheme', () => ({
    default: vi.fn(),
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

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
    }),
    useSearchParams: () => mockSearchParams,
    usePathname: () => mockPathname(),
}));

describe('<AdvancedFiltersModal />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        mockPathname.mockReturnValue('/');
        useAdvancedFiltersModal.getState().onClose();
        Array.from(mockSearchParams.keys()).forEach((key) => {
            mockSearchParams.delete(key);
        });
        vi.useFakeTimers();
        vi.setSystemTime(new Date('2024-01-15'));
    });

    afterEach(() => {
        cleanup();
        vi.useRealTimers();
    });

    describe('Modal visibility and lifecycle', () => {
        it('renders nothing when modal is closed', () => {
            render(<AdvancedFiltersModal />);

            expect(screen.queryByTestId('advanced-filters-modal')).toBeNull();
        });

        it('renders all filter sections when modal is open', () => {
            useAdvancedFiltersModal.getState().onOpen();

            render(<AdvancedFiltersModal />);

            expect(screen.getByTestId('advanced-filters-modal')).toBeDefined();
            expect(screen.getByTestId('modal-title').textContent).toContain(
                'Filter options'
            );
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
            expect(screen.getByTestId('start-date-input')).toBeDefined();
            expect(screen.getByTestId('end-date-input')).toBeDefined();
            expect(screen.getByTestId('cuisine-pill-italian')).toBeDefined();
        });

        it('disables Apply button when no filters are active or selected', () => {
            useAdvancedFiltersModal.getState().onOpen();

            render(<AdvancedFiltersModal />);

            const applyButton = screen.getByTestId(
                'modal-action-button'
            ) as HTMLButtonElement;
            expect(applyButton.disabled).toBe(true);
            expect(screen.queryByTestId('clear-filters-button')).toBeNull();
        });

        it('closes modal when Cancel button is clicked', () => {
            useAdvancedFiltersModal.getState().onOpen();

            render(<AdvancedFiltersModal />);

            const cancelButton = screen.getByTestId('secondary-action-button');
            fireEvent.click(cancelButton);

            expect(useAdvancedFiltersModal.getState().isOpen).toBe(false);
            expect(screen.queryByTestId('advanced-filters-modal')).toBeNull();
        });

        it('closes modal when close (X) button is clicked', () => {
            useAdvancedFiltersModal.getState().onOpen();

            render(<AdvancedFiltersModal />);

            fireEvent.click(screen.getByTestId('close-modal-button'));
            act(() => {
                vi.advanceTimersByTime(300);
            });

            expect(useAdvancedFiltersModal.getState().isOpen).toBe(false);
            expect(screen.queryByTestId('advanced-filters-modal')).toBeNull();
        });
    });

    describe('Filter input functionality', () => {
        it('allows selecting and toggling difficulty pills', () => {
            useAdvancedFiltersModal.getState().onOpen();

            render(<AdvancedFiltersModal />);

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
            useAdvancedFiltersModal.getState().onOpen();

            render(<AdvancedFiltersModal />);

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
            useAdvancedFiltersModal.getState().onOpen();

            render(<AdvancedFiltersModal />);

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

        it('allows entering macro, calories, yield, and date inputs', () => {
            useAdvancedFiltersModal.getState().onOpen();

            render(<AdvancedFiltersModal />);

            const minProtein = screen.getByTestId(
                'min-protein-input'
            ) as HTMLInputElement;
            const maxCarbs = screen.getByTestId(
                'max-carbs-input'
            ) as HTMLInputElement;
            const maxFat = screen.getByTestId(
                'max-fat-input'
            ) as HTMLInputElement;
            const minCalories = screen.getByTestId(
                'min-calories-input'
            ) as HTMLInputElement;
            const maxCalories = screen.getByTestId(
                'max-calories-input'
            ) as HTMLInputElement;
            const minYield = screen.getByTestId(
                'min-yield-input'
            ) as HTMLInputElement;
            const maxYield = screen.getByTestId(
                'max-yield-input'
            ) as HTMLInputElement;
            const startDate = screen.getByTestId(
                'start-date-input'
            ) as HTMLInputElement;
            const endDate = screen.getByTestId(
                'end-date-input'
            ) as HTMLInputElement;

            fireEvent.change(minProtein, { target: { value: '30' } });
            fireEvent.change(maxCarbs, { target: { value: '45' } });
            fireEvent.change(maxFat, { target: { value: '18' } });
            fireEvent.change(minCalories, { target: { value: '250' } });
            fireEvent.change(maxCalories, { target: { value: '600' } });
            fireEvent.change(minYield, { target: { value: '2' } });
            fireEvent.change(maxYield, { target: { value: '6' } });
            fireEvent.change(startDate, { target: { value: '2024-01-01' } });
            fireEvent.change(endDate, { target: { value: '2024-01-10' } });

            expect(minProtein.value).toBe('30');
            expect(maxCarbs.value).toBe('45');
            expect(maxFat.value).toBe('18');
            expect(minCalories.value).toBe('250');
            expect(maxCalories.value).toBe('600');
            expect(minYield.value).toBe('2');
            expect(maxYield.value).toBe('6');
            expect(startDate.value).toBe('2024-01-01');
            expect(endDate.value).toBe('2024-01-10');
        });

        it('allows selecting and toggling cuisine pills', () => {
            useAdvancedFiltersModal.getState().onOpen();

            render(<AdvancedFiltersModal />);

            const italianPill = screen.getByTestId('cuisine-pill-italian');
            expect(italianPill.className).not.toContain('bg-green-450');

            fireEvent.click(italianPill);
            expect(italianPill.className).toContain('bg-green-450');

            fireEvent.click(italianPill);
            expect(italianPill.className).not.toContain('bg-green-450');
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

            useAdvancedFiltersModal.getState().onOpen();
            render(<AdvancedFiltersModal />);

            expect(
                (screen.getByTestId('min-calories-input') as HTMLInputElement)
                    .value
            ).toBe('300');
            expect(
                (screen.getByTestId('max-yield-input') as HTMLInputElement)
                    .value
            ).toBe('4');
            expect(
                screen.getByTestId('cuisine-pill-spanish').className
            ).toContain('bg-green-450');
            expect(
                (screen.getByTestId('start-date-input') as HTMLInputElement)
                    .value
            ).toBe('2024-01-02');
            expect(
                (screen.getByTestId('end-date-input') as HTMLInputElement).value
            ).toBe('2024-01-12');
            expect(
                screen.getByTestId('difficulty-pill-medium').className
            ).toContain('bg-green-450');
            expect(
                screen.getByTestId('dietary-tag-pill-vegan').className
            ).toContain('bg-green-450');
            expect(
                screen.getByTestId('dietary-tag-pill-spicy').className
            ).toContain('bg-green-450');
            expect(
                screen
                    .getByTestId('exclude-allergen-pill-gluten')
                    .getAttribute('aria-pressed')
            ).toBe('true');
            expect(
                screen
                    .getByTestId('exclude-allergen-pill-milk')
                    .getAttribute('aria-pressed')
            ).toBe('true');
            expect(
                (screen.getByTestId('min-protein-input') as HTMLInputElement)
                    .value
            ).toBe('25');
            expect(
                (screen.getByTestId('max-carbs-input') as HTMLInputElement)
                    .value
            ).toBe('40');
            expect(
                (screen.getByTestId('max-fat-input') as HTMLInputElement).value
            ).toBe('15');
        });
    });

    describe('Apply and Clear functionality', () => {
        it('updates URL and closes modal when applying advanced filters', () => {
            useAdvancedFiltersModal.getState().onOpen();

            render(<AdvancedFiltersModal />);

            fireEvent.change(screen.getByTestId('min-calories-input'), {
                target: { value: '150' },
            });
            fireEvent.change(screen.getByTestId('max-yield-input'), {
                target: { value: '5' },
            });
            fireEvent.click(screen.getByTestId('cuisine-pill-italian'));
            fireEvent.change(screen.getByTestId('start-date-input'), {
                target: { value: '2024-01-05' },
            });
            fireEvent.change(screen.getByTestId('end-date-input'), {
                target: { value: '2024-01-08' },
            });
            fireEvent.click(screen.getByTestId('difficulty-pill-easy'));
            fireEvent.click(screen.getByTestId('dietary-tag-pill-vegan'));
            fireEvent.click(screen.getByTestId('dietary-tag-pill-one-pot'));
            fireEvent.click(screen.getByTestId('exclude-allergen-pill-gluten'));
            fireEvent.change(screen.getByTestId('min-protein-input'), {
                target: { value: '30' },
            });

            fireEvent.click(screen.getByTestId('modal-action-button'));

            expect(mockReplace).toHaveBeenCalledWith(
                '/?minCalories=150&maxYield=5&recipeCuisine=Italian&startDate=2024-01-05&endDate=2024-01-08&difficulty=Easy&dietaryTags=vegan%2Cone-pot&excludeAllergens=gluten&minProtein=30'
            );
            expect(useAdvancedFiltersModal.getState().isOpen).toBe(false);
        });

        it('applies new filters on favorites page', () => {
            mockPathname.mockReturnValue('/favorites');
            useAdvancedFiltersModal.getState().onOpen();

            render(<AdvancedFiltersModal />);

            fireEvent.click(screen.getByTestId('difficulty-pill-hard'));
            fireEvent.click(
                screen.getByTestId('exclude-allergen-pill-peanuts')
            );
            fireEvent.click(screen.getByTestId('modal-action-button'));

            expect(mockReplace).toHaveBeenCalledWith(
                '/favorites?difficulty=Hard&excludeAllergens=peanuts'
            );
        });

        it('clears active URL filters and closes modal when Clear button is clicked', () => {
            mockSearchParams.set('minCalories', '200');
            mockSearchParams.set('recipeCuisine', 'Mexican');
            mockSearchParams.set('startDate', '2024-01-05');
            mockSearchParams.set('endDate', '2024-01-08');
            mockSearchParams.set('difficulty', 'Easy');
            mockSearchParams.set('dietaryTags', 'vegan');
            mockSearchParams.set('excludeAllergens', 'gluten');
            mockSearchParams.set('minProtein', '25');

            useAdvancedFiltersModal.getState().onOpen();
            render(<AdvancedFiltersModal />);

            fireEvent.click(screen.getByTestId('clear-filters-button'));

            expect(mockReplace).toHaveBeenCalledWith('/');
            expect(useAdvancedFiltersModal.getState().isOpen).toBe(false);
        });

        it('resets unsaved temporary selections without closing when no URL filters are active', () => {
            useAdvancedFiltersModal.getState().onOpen();
            render(<AdvancedFiltersModal />);

            const easyPill = screen.getByTestId('difficulty-pill-easy');
            fireEvent.click(easyPill);
            expect(easyPill.className).toContain('bg-green-450');

            fireEvent.click(screen.getByTestId('clear-filters-button'));

            expect(easyPill.className).not.toContain('bg-green-450');
            expect(mockReplace).not.toHaveBeenCalled();
            expect(useAdvancedFiltersModal.getState().isOpen).toBe(true);
        });
    });
});
