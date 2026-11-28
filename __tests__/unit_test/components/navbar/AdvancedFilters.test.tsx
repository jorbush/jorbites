import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import AdvancedFilters from '@/app/components/navbar/AdvancedFilters';
import useAdvancedFiltersModal from '@/app/hooks/useAdvancedFiltersModal';
import React from 'react';

// Mock the icons
vi.mock('react-icons/fi', () => ({
    FiSliders: () => <div data-testid="sliders-icon" />,
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => {
            const translations: { [key: string]: string } = {
                filter_options: 'Filter options',
            };
            return translations[key] || key;
        },
    }),
}));

const mockSearchParams = new URLSearchParams();

// Mock next/navigation
vi.mock('next/navigation', () => ({
    useSearchParams: () => mockSearchParams,
}));

describe('<AdvancedFilters />', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        useAdvancedFiltersModal.getState().onClose();
        Array.from(mockSearchParams.keys()).forEach((key) => {
            mockSearchParams.delete(key);
        });
    });

    afterEach(() => {
        cleanup();
    });

    describe('Basic rendering', () => {
        it('renders filter button with sliders icon and dialog aria attributes', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            expect(button).toBeDefined();
            expect(button.getAttribute('aria-label')).toBe('Filter options');
            expect(button.getAttribute('aria-haspopup')).toBe('dialog');
            expect(button.getAttribute('aria-expanded')).toBe('false');
            expect(screen.getByTestId('sliders-icon')).toBeDefined();
        });

        it('shows notification circle when advanced filters are active', () => {
            mockSearchParams.set('minCalories', '200');

            render(<AdvancedFilters />);

            const notificationCircle = screen
                .getByTestId('advanced-filters-button')
                .querySelector('.bg-rose-500');
            expect(notificationCircle).not.toBeNull();
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

    describe('Modal trigger interaction', () => {
        it('opens the advanced filters modal when button is clicked', () => {
            render(<AdvancedFilters />);

            const button = screen.getByTestId('advanced-filters-button');
            expect(useAdvancedFiltersModal.getState().isOpen).toBe(false);

            fireEvent.click(button);

            expect(useAdvancedFiltersModal.getState().isOpen).toBe(true);
            expect(button.getAttribute('aria-expanded')).toBe('true');
        });
    });
});
