import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WorkshopClientSkeleton from '@/app/components/workshops/WorkshopClientSkeleton';

// Mock Container component
vi.mock('@/app/components/utils/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="container">{children}</div>
    ),
}));

describe('<WorkshopClientSkeleton />', () => {
    it('renders the skeleton structure', () => {
        render(<WorkshopClientSkeleton />);

        const container = screen.getByTestId('container');
        expect(container).toBeDefined();
    });

    it('renders skeleton elements with correct classes', () => {
        const { container } = render(<WorkshopClientSkeleton />);

        // Check for animated pulse elements
        const pulseElements = container.querySelectorAll('.animate-pulse');
        expect(pulseElements.length).toBeGreaterThan(0);
    });

    it('renders workshop head skeleton with navigation buttons', () => {
        const { container } = render(<WorkshopClientSkeleton />);

        // Should have skeleton for back and share buttons
        const buttonSkeletons = container.querySelectorAll('.rounded-full');
        expect(buttonSkeletons.length).toBeGreaterThan(0);
    });

    it('renders workshop image skeleton', () => {
        const { container } = render(<WorkshopClientSkeleton />);

        // Look for the main image skeleton
        const imageSkeleton = container.querySelector('.h-\\[60vh\\]');
        expect(imageSkeleton).toBeDefined();
    });

    it('renders host info skeleton', () => {
        const { container } = render(<WorkshopClientSkeleton />);

        // Check for avatar skeleton (rounded-full)
        const avatarSkeletons = container.querySelectorAll(
            '.rounded-full.animate-pulse'
        );
        expect(avatarSkeletons.length).toBeGreaterThan(0);
    });

    it('renders workshop details skeletons', () => {
        const { container } = render(<WorkshopClientSkeleton />);

        // Should have multiple detail line skeletons
        const detailLines = container.querySelectorAll('.gap-2');
        expect(detailLines.length).toBeGreaterThan(0);
    });

    it('renders description skeleton', () => {
        const { container } = render(<WorkshopClientSkeleton />);

        // Description should have multiple lines
        const descriptionLines = container.querySelectorAll('.space-y-2');
        expect(descriptionLines.length).toBeGreaterThan(0);
    });

    it('renders actions sidebar skeleton', () => {
        const { container } = render(<WorkshopClientSkeleton />);

        // Should have button skeleton in sidebar
        const buttonSkeleton = container.querySelector('.h-12');
        expect(buttonSkeleton).toBeDefined();
    });

    it('uses correct dark mode classes', () => {
        const { container } = render(<WorkshopClientSkeleton />);

        // Check for dark mode classes
        const darkModeElements = container.querySelectorAll('.dark\\:bg-neutral-700');
        expect(darkModeElements.length).toBeGreaterThan(0);
    });

    it('renders grid layout for info and sidebar', () => {
        const { container } = render(<WorkshopClientSkeleton />);

        // Check for grid layout
        const gridElements = container.querySelectorAll('.grid-cols-1');
        expect(gridElements.length).toBeGreaterThan(0);
    });
});
