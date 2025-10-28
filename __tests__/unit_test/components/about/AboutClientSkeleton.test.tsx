import { describe, it, expect, vi } from 'vitest';
import { render } from '@testing-library/react';
import AboutClientSkeleton from '@/app/components/about/AboutClientSkeleton';

// Mock Container component
vi.mock('@/app/components/utils/Container', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="container">{children}</div>
    ),
}));

describe('AboutClientSkeleton', () => {
    it('renders skeleton structure correctly', () => {
        const { container } = render(<AboutClientSkeleton />);

        // Check container is rendered
        const containerElement = container.querySelector(
            '[data-testid="container"]'
        );
        expect(containerElement).not.toBeNull();
    });

    it('renders heading skeleton', () => {
        const { container } = render(<AboutClientSkeleton />);

        // Find heading skeleton elements
        const headingSkeletons = container.querySelectorAll('.py-8 > div');
        expect(headingSkeletons.length).toBeGreaterThan(0);

        // Check for title skeleton
        const titleSkeleton = container.querySelector('.h-10');
        expect(titleSkeleton).not.toBeNull();
        expect(titleSkeleton?.className).toContain('animate-pulse');

        // Check for subtitle skeleton
        const subtitleSkeleton = container.querySelector('.h-6');
        expect(subtitleSkeleton).not.toBeNull();
        expect(subtitleSkeleton?.className).toContain('animate-pulse');
    });

    it('renders six section skeletons', () => {
        const { container } = render(<AboutClientSkeleton />);

        // Find all section elements
        const sections = container.querySelectorAll('section');
        expect(sections.length).toBe(6);
    });

    it('renders section skeletons with correct styling', () => {
        const { container } = render(<AboutClientSkeleton />);

        const sections = container.querySelectorAll('section');
        sections.forEach((section) => {
            expect(section.className).toContain('rounded-lg');
            expect(section.className).toContain('bg-neutral-50');
            expect(section.className).toContain('dark:bg-neutral-900');
        });
    });

    it('renders section header skeletons', () => {
        const { container } = render(<AboutClientSkeleton />);

        // Find section header skeletons
        const sectionHeaders = container.querySelectorAll('section .h-8');
        expect(sectionHeaders.length).toBe(6);

        sectionHeaders.forEach((header) => {
            expect(header.className).toContain('animate-pulse');
            expect(header.className).toContain('bg-neutral-200');
            expect(header.className).toContain('dark:bg-neutral-700');
        });
    });

    it('renders section content skeletons', () => {
        const { container } = render(<AboutClientSkeleton />);

        // Each section should have content skeleton lines
        const sections = container.querySelectorAll('section');
        sections.forEach((section) => {
            const contentLines = section.querySelectorAll('.space-y-2 > div');
            expect(contentLines.length).toBe(3);
        });
    });

    it('renders animate-pulse classes on all skeleton elements', () => {
        const { container } = render(<AboutClientSkeleton />);

        const animatedElements = container.querySelectorAll('.animate-pulse');
        // Should have at least heading (2) + sections (6 headers + 18 content lines) = 26
        expect(animatedElements.length).toBeGreaterThan(20);
    });

    it('renders max-w-4xl container', () => {
        const { container } = render(<AboutClientSkeleton />);

        const maxWidthContainer = container.querySelector('.max-w-4xl');
        expect(maxWidthContainer).not.toBeNull();
    });

    it('applies dark mode classes correctly', () => {
        const { container } = render(<AboutClientSkeleton />);

        // Check for dark mode classes
        const darkBgElements = container.querySelectorAll(
            '.dark\\:bg-neutral-700, .dark\\:bg-neutral-900'
        );
        expect(darkBgElements.length).toBeGreaterThan(0);
    });
});
