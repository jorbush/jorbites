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
    default: vi.fn(({ onLoad, onError, alt, ...props }) => {
        return (
            <img
                alt={alt}
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
    });

    it('renders quest_solver_1.webp, quest_solver_10.webp, and quest_solver_25.webp badge components with tooltips', async () => {
        const questBadges = [
            {
                src: '/badges/quest_solver_1.webp',
                alt: 'Bronze Quest Solver',
                tooltipText: 'Quest Solver (Bronze) - 1 Quest Fulfilled',
            },
            {
                src: '/badges/quest_solver_10.webp',
                alt: 'Silver Quest Solver',
                tooltipText: 'Quest Veteran (Silver) - 10 Quests Fulfilled',
            },
            {
                src: '/badges/quest_solver_25.webp',
                alt: 'Gold Quest Master',
                tooltipText: 'Quest Master (Gold) - 25 Quests Fulfilled',
            },
        ];

        for (const badge of questBadges) {
            const { container, unmount } = render(<Badge {...badge} />);

            const img = screen.getByAltText(badge.alt);
            expect(img).toBeDefined();
            expect(img.getAttribute('src')).toBe(badge.src);

            const wrapper = container.firstChild as HTMLElement;
            fireEvent.mouseEnter(wrapper);

            await waitFor(
                () => {
                    const tooltip = screen.getByTestId('tooltip');
                    expect(tooltip).toBeDefined();
                    expect(tooltip.textContent).toContain(badge.tooltipText);
                },
                { timeout: 1000 }
            );

            unmount();
        }
    });
});
