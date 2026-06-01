import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import StarRating from '@/app/components/utils/StarRating';

describe('StarRating', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    describe('Display Mode', () => {
        it('renders 5 stars with correct full, half, and empty counts for rating 3.5', () => {
            render(
                <StarRating
                    rating={3.5}
                    interactive={false}
                />
            );

            expect(screen.getByTestId('star-filled-0')).toBeDefined();
            expect(screen.getByTestId('star-filled-1')).toBeDefined();
            expect(screen.getByTestId('star-filled-2')).toBeDefined();
            expect(screen.getByTestId('star-half-3')).toBeDefined();
            expect(screen.getByTestId('star-empty-4')).toBeDefined();
        });

        it('renders 5 stars with correct full, half, and empty counts for rating 5', () => {
            render(
                <StarRating
                    rating={5}
                    interactive={false}
                />
            );

            expect(screen.getByTestId('star-filled-0')).toBeDefined();
            expect(screen.getByTestId('star-filled-1')).toBeDefined();
            expect(screen.getByTestId('star-filled-2')).toBeDefined();
            expect(screen.getByTestId('star-filled-3')).toBeDefined();
            expect(screen.getByTestId('star-filled-4')).toBeDefined();
        });

        it('renders 5 stars with correct full, half, and empty counts for rating 0', () => {
            render(
                <StarRating
                    rating={0}
                    interactive={false}
                />
            );

            expect(screen.getByTestId('star-empty-0')).toBeDefined();
            expect(screen.getByTestId('star-empty-1')).toBeDefined();
            expect(screen.getByTestId('star-empty-2')).toBeDefined();
            expect(screen.getByTestId('star-empty-3')).toBeDefined();
            expect(screen.getByTestId('star-empty-4')).toBeDefined();
        });
    });

    describe('Interactive Mode', () => {
        it('renders 5 buttons for rating inputs', () => {
            render(
                <StarRating
                    rating={0}
                    interactive={true}
                />
            );

            expect(screen.getByTestId('star-1')).toBeDefined();
            expect(screen.getByTestId('star-2')).toBeDefined();
            expect(screen.getByTestId('star-3')).toBeDefined();
            expect(screen.getByTestId('star-4')).toBeDefined();
            expect(screen.getByTestId('star-5')).toBeDefined();
        });

        it('calls onChange with the correct value when a star is clicked', () => {
            const onChange = vi.fn();
            render(
                <StarRating
                    rating={0}
                    interactive={true}
                    onChange={onChange}
                />
            );

            fireEvent.click(screen.getByTestId('star-4'));

            expect(onChange).toHaveBeenCalledWith(4);
        });

        it('handles hover effects correctly', () => {
            render(
                <StarRating
                    rating={2}
                    interactive={true}
                />
            );

            const star4 = screen.getByTestId('star-4');

            // Hover over star 4
            fireEvent.mouseEnter(star4);

            // Under hover rating 4, stars 1-4 should be filled
            expect(star4.className).toContain('text-amber-500');
            expect(screen.getByTestId('star-3').className).toContain(
                'text-amber-500'
            );
            expect(screen.getByTestId('star-5').className).not.toContain(
                'text-amber-500'
            );

            // Mouse leave
            fireEvent.mouseLeave(star4);

            // Should revert to rating 2
            expect(screen.getByTestId('star-2').className).toContain(
                'text-amber-500'
            );
            expect(screen.getByTestId('star-3').className).not.toContain(
                'text-amber-500'
            );
        });
    });
});
