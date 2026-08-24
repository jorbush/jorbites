import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import CommentRatingSection from '@/app/components/comments/CommentRatingSection';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('@/app/components/utils/StarRating', () => ({
    default: ({ rating, onChange }: any) => (
        <div data-testid="mock-star-rating">
            <span>Rating: {rating}</span>
            <button
                data-testid="star-4"
                onClick={() => onChange && onChange(4)}
            >
                4 Stars
            </button>
        </div>
    ),
}));

describe('CommentRatingSection', () => {
    const mockOnChange = vi.fn();
    const mockOnClear = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('has hidden / collapsed classes when showRating is false and rating is null', () => {
        const { container } = render(
            <CommentRatingSection
                rating={null}
                showRating={false}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />
        );

        const wrapper = container.querySelector('.overflow-hidden');
        expect(wrapper?.className).toContain('opacity-0');
        expect(wrapper?.className).toContain('max-h-0');
        expect(wrapper?.className).toContain('pointer-events-none');
    });

    it('has visible classes when showRating is true', () => {
        const { container } = render(
            <CommentRatingSection
                rating={null}
                showRating={true}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />
        );

        const wrapper = container.querySelector('.overflow-hidden');
        expect(wrapper?.className).toContain('opacity-100');
        expect(wrapper?.className).toContain('max-h-12');
    });

    it('calls onChange when a star rating is selected', () => {
        render(
            <CommentRatingSection
                rating={null}
                showRating={true}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />
        );

        fireEvent.click(screen.getByTestId('star-4'));
        expect(mockOnChange).toHaveBeenCalledWith(4);
    });

    it('shows clear rating button when rating is set and calls onClear on click', () => {
        render(
            <CommentRatingSection
                rating={4}
                showRating={true}
                onChange={mockOnChange}
                onClear={mockOnClear}
            />
        );

        const clearBtn = screen.getByTestId('clear-rating');
        expect(clearBtn).toBeDefined();

        fireEvent.click(clearBtn);
        expect(mockOnClear).toHaveBeenCalledTimes(1);
    });
});
