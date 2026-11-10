import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CommentRateButton from '@/app/components/comments/CommentRateButton';

let mockMounted = true;
let mockTranslate = (key: string) => key;

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => mockTranslate(key),
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => mockMounted,
}));

describe('CommentRateButton', () => {
    const defaultProps = {
        rating: null,
        showRating: false,
        onToggleRating: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
        mockMounted = true;
        mockTranslate = (key: string) => key;
    });

    afterEach(() => {
        cleanup();
    });

    it('renders rate button with default inactive state', () => {
        render(<CommentRateButton {...defaultProps} />);

        const button = screen.getByTestId('rate-toggle-btn');
        expect(button).toBeDefined();
        expect(button.className).toContain('border-neutral-200/80');
    });

    it('renders active state when rating is provided', () => {
        render(
            <CommentRateButton
                {...defaultProps}
                rating={4}
            />
        );

        const button = screen.getByTestId('rate-toggle-btn');
        expect(button.className).toContain('border-amber-300/80');
    });

    it('renders active state when showRating is true', () => {
        render(
            <CommentRateButton
                {...defaultProps}
                showRating={true}
            />
        );

        const button = screen.getByTestId('rate-toggle-btn');
        expect(button.className).toContain('border-amber-300/80');
    });

    it('calls onToggleRating when clicked', () => {
        render(<CommentRateButton {...defaultProps} />);

        fireEvent.click(screen.getByTestId('rate-toggle-btn'));
        expect(defaultProps.onToggleRating).toHaveBeenCalledTimes(1);
    });

    it('displays translated text when mounted and translation exists', () => {
        mockTranslate = (key: string) => (key === 'rate' ? 'Calificar' : key);
        render(<CommentRateButton {...defaultProps} />);

        const button = screen.getByTestId('rate-toggle-btn');
        expect(button.getAttribute('title')).toBe('Calificar');
        expect(button.textContent).toContain('Calificar');
    });

    it('falls back to "Rate" when not mounted', () => {
        mockMounted = false;
        mockTranslate = (key: string) => (key === 'rate' ? 'Calificar' : key);
        render(<CommentRateButton {...defaultProps} />);

        const button = screen.getByTestId('rate-toggle-btn');
        expect(button.getAttribute('title')).toBe('Rate');
        expect(button.textContent).toContain('Rate');
    });
});
