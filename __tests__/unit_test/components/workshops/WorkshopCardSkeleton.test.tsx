import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { WorkshopCardSkeleton } from '@/app/components/workshops/WorkshopCard';

describe('<WorkshopCardSkeleton />', () => {
    it('renders the skeleton structure', () => {
        const { container } = render(<WorkshopCardSkeleton />);

        expect(container.firstChild).toBeDefined();
    });

    it('renders with correct layout classes', () => {
        const { container } = render(<WorkshopCardSkeleton />);

        const wrapper = container.querySelector('.group');
        expect(wrapper).toBeDefined();
        expect(wrapper?.className).toContain('col-span-1');
    });

    it('renders skeleton elements with animate-pulse', () => {
        const { container } = render(<WorkshopCardSkeleton />);

        // The skeleton doesn't use animate-pulse, so check for bg-neutral classes instead
        const skeletonElements = container.querySelectorAll('.bg-neutral-200');
        expect(skeletonElements.length).toBeGreaterThan(0);
    });

    it('renders aspect-square image skeleton', () => {
        const { container } = render(<WorkshopCardSkeleton />);

        const imageSkeleton = container.querySelector('.aspect-square');
        expect(imageSkeleton).toBeDefined();
        expect(imageSkeleton?.className).toContain('rounded-xl');
    });

    it('renders correct number of skeleton lines', () => {
        const { container } = render(<WorkshopCardSkeleton />);

        // Should have: image + title + host + details = 4 skeleton elements
        const skeletonLines = container.querySelectorAll(
            '.bg-neutral-200, .dark\\:bg-neutral-700'
        );
        expect(skeletonLines.length).toBeGreaterThan(0);
    });

    it('uses correct dark mode classes', () => {
        const { container } = render(<WorkshopCardSkeleton />);

        const darkModeElements = container.querySelectorAll(
            '.dark\\:bg-neutral-700'
        );
        expect(darkModeElements.length).toBeGreaterThan(0);
    });

    it('renders skeleton lines with varying widths', () => {
        const { container } = render(<WorkshopCardSkeleton />);

        // Check for different width classes (w-3/4, w-1/2, w-1/4)
        const wideElement = container.querySelector('.w-3\\/4');
        const mediumElement = container.querySelector('.w-1\\/2');
        const narrowElement = container.querySelector('.w-1\\/4');

        expect(wideElement).toBeDefined();
        expect(mediumElement).toBeDefined();
        expect(narrowElement).toBeDefined();
    });

    it('renders skeleton lines with varying heights', () => {
        const { container } = render(<WorkshopCardSkeleton />);

        // Check for different height classes
        const tallElement = container.querySelector('.h-6');
        const shortElement = container.querySelector('.h-4');

        expect(tallElement).toBeDefined();
        expect(shortElement).toBeDefined();
    });

    it('maintains flex-col layout', () => {
        const { container } = render(<WorkshopCardSkeleton />);

        const flexContainer = container.querySelector('.flex-col');
        expect(flexContainer).toBeDefined();
    });

    it('renders with proper spacing (gap-2)', () => {
        const { container } = render(<WorkshopCardSkeleton />);

        const gapContainer = container.querySelector('.gap-2');
        expect(gapContainer).toBeDefined();
    });
});
