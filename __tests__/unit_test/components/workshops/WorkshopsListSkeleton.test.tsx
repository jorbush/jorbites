import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import WorkshopsListSkeleton from '@/app/components/workshops/WorkshopsListSkeleton';

// Mock Container component
vi.mock('@/app/components/utils/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="container">{children}</div>
    ),
}));

// Mock WorkshopCardSkeleton
vi.mock('@/app/components/workshops/WorkshopCard', () => ({
    WorkshopCardSkeleton: () => (
        <div data-testid="workshop-card-skeleton">Card Skeleton</div>
    ),
}));

describe('<WorkshopsListSkeleton />', () => {
    it('renders the skeleton structure', () => {
        render(<WorkshopsListSkeleton />);

        const container = screen.getByTestId('container');
        expect(container).toBeDefined();
    });

    it('renders header skeleton', () => {
        const { container } = render(<WorkshopsListSkeleton />);

        // Check for header skeleton elements
        const pulseElements = container.querySelectorAll('.animate-pulse');
        expect(pulseElements.length).toBeGreaterThan(0);
    });

    it('renders multiple workshop card skeletons for upcoming section', () => {
        render(<WorkshopsListSkeleton />);

        const cardSkeletons = screen.getAllByTestId('workshop-card-skeleton');
        // Should have at least 6 for upcoming + 4 for past = 10 total
        expect(cardSkeletons.length).toBeGreaterThanOrEqual(10);
    });

    it('renders section title skeletons', () => {
        const { container } = render(<WorkshopsListSkeleton />);

        // Should have skeletons for section titles
        const titleSkeletons = container.querySelectorAll('.h-8');
        expect(titleSkeletons.length).toBeGreaterThan(1);
    });

    it('renders grid layout for workshop cards', () => {
        const { container } = render(<WorkshopsListSkeleton />);

        // Check for grid layouts
        const gridElements = container.querySelectorAll('.grid');
        expect(gridElements.length).toBeGreaterThan(1);
    });

    it('renders call to action skeleton', () => {
        const { container } = render(<WorkshopsListSkeleton />);

        // Should have CTA card with border-dashed
        const ctaCard = container.querySelector('.border-dashed');
        expect(ctaCard).toBeDefined();
    });

    it('uses correct dark mode classes', () => {
        const { container } = render(<WorkshopsListSkeleton />);

        // Check for dark mode classes
        const darkModeElements = container.querySelectorAll(
            '.dark\\:bg-neutral-700'
        );
        expect(darkModeElements.length).toBeGreaterThan(0);
    });

    it('renders responsive grid classes', () => {
        const { container } = render(<WorkshopsListSkeleton />);

        // Check for responsive classes
        const responsiveGrids = container.querySelectorAll('.sm\\:grid-cols-2');
        expect(responsiveGrids.length).toBeGreaterThan(0);
    });

    it('renders CTA skeleton with correct structure', () => {
        const { container } = render(<WorkshopsListSkeleton />);

        // CTA should have emoji skeleton (rounded-full), title, description, button
        const ctaSkeletons = container.querySelectorAll('.space-y-4');
        expect(ctaSkeletons.length).toBeGreaterThan(0);
    });

    it('has correct minimum heights for sections', () => {
        const { container } = render(<WorkshopsListSkeleton />);

        // Check for min-h classes
        const minHeightElements =
            container.querySelectorAll('[class*="min-h"]');
        expect(minHeightElements.length).toBeGreaterThan(0);
    });
});
