import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CommentRating from '@/app/components/comments/CommentRating';

vi.mock('@/app/components/utils/StarRating', () => ({
    default: ({ rating, size }: { rating: number; size: number }) => (
        <span data-testid="mock-star-rating">
            Rating: {rating} (size: {size})
        </span>
    ),
}));

describe('CommentRating', () => {
    it('returns null when rating is null', () => {
        const { container } = render(<CommentRating rating={null} />);
        expect(container.firstChild).toBeNull();
    });

    it('returns null when rating is undefined', () => {
        const { container } = render(<CommentRating rating={undefined} />);
        expect(container.firstChild).toBeNull();
    });

    it('returns null when rating is 0 or negative', () => {
        const { container: zeroContainer } = render(
            <CommentRating rating={0} />
        );
        expect(zeroContainer.firstChild).toBeNull();

        const { container: negativeContainer } = render(
            <CommentRating rating={-1} />
        );
        expect(negativeContainer.firstChild).toBeNull();
    });

    it('renders StarRating when rating is positive', () => {
        render(<CommentRating rating={4} />);
        expect(screen.getByTestId('comment-rating')).toBeDefined();
        expect(screen.getByTestId('mock-star-rating').textContent).toContain(
            'Rating: 4 (size: 14)'
        );
    });
});
