import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import Badge from '@/app/components/utils/Badge';

// Mock Next.js Image component
vi.mock('next/image', () => ({
    default: vi.fn(({ onLoad, onError, ...props }) => {
        return (
            <img
                {...props}
                onLoad={(e) => {
                    if (onLoad) onLoad(e);
                }}
                onError={(e) => {
                    if (onError) onError(e);
                }}
            />
        );
    }),
}));

describe('Badge Component', () => {
    const defaultProps = {
        src: '/badges/test-badge.webp',
        alt: 'Test badge',
        size: 50,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders skeleton placeholder while loading', () => {
        render(<Badge {...defaultProps} />);

        // Should show skeleton initially
        const skeleton = document.querySelector('.animate-pulse');
        expect(skeleton).toBeDefined();
        expect(skeleton?.className).toContain('bg-neutral-200');
    });

    it('shows image and hides skeleton after loading', async () => {
        render(<Badge {...defaultProps} />);

        // Find and trigger the image load event
        const image = screen.getByRole('img');
        fireEvent.load(image);

        await waitFor(() => {
            // Skeleton should be hidden after load
            const skeleton = document.querySelector('.animate-pulse');
            expect(skeleton).toBeNull();

            // Image should be visible
            expect(image.className).toContain('opacity-100');
        });
    });

    it('shows error fallback when image fails to load', async () => {
        render(<Badge {...defaultProps} />);

        const image = screen.getByRole('img');
        fireEvent.error(image);

        await waitFor(() => {
            // Should show error fallback
            expect(screen.getByText('?')).toBeDefined();

            // Skeleton should be hidden
            const skeleton = document.querySelector('.animate-pulse');
            expect(skeleton).toBeNull();
        });
    });

    it('calls onClick handler when clicked', () => {
        const handleClick = vi.fn();
        render(
            <Badge
                {...defaultProps}
                onClick={handleClick}
            />
        );

        const badgeContainer = document.querySelector('.cursor-pointer');
        expect(badgeContainer).toBeDefined();

        fireEvent.click(badgeContainer!);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('applies custom className and size', () => {
        const customProps = {
            ...defaultProps,
            className: 'custom-class',
            size: 60,
        };

        render(<Badge {...customProps} />);

        const container = document.querySelector(
            '.cursor-pointer'
        ) as HTMLElement;
        expect(container?.className).toContain('custom-class');
        expect(container?.style.width).toBe('60px');
        expect(container?.style.height).toBe('60px');
    });

    it('renders with correct accessibility attributes', () => {
        render(<Badge {...defaultProps} />);

        const image = screen.getByRole('img');
        expect(image.getAttribute('alt')).toBe('Test badge');
        expect(image.getAttribute('aria-label')).toBe('Test badge');
    });
});
