import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import ScrollableContainer from '@/app/components/utils/ScrollableContainer';

describe('<ScrollableContainer />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders children correctly', () => {
        render(
            <ScrollableContainer>
                <div data-testid="child-1">Child 1</div>
                <div data-testid="child-2">Child 2</div>
                <div data-testid="child-3">Child 3</div>
            </ScrollableContainer>
        );

        expect(screen.getByTestId('child-1')).toBeDefined();
        expect(screen.getByTestId('child-2')).toBeDefined();
        expect(screen.getByTestId('child-3')).toBeDefined();
        expect(screen.getByText('Child 1')).toBeDefined();
        expect(screen.getByText('Child 2')).toBeDefined();
        expect(screen.getByText('Child 3')).toBeDefined();
    });

    it('applies default container styles', () => {
        const { container } = render(
            <ScrollableContainer>
                <div>Test content</div>
            </ScrollableContainer>
        );

        const outerDiv = container.firstChild as HTMLElement;
        expect(outerDiv.className).toContain('relative');

        const scrollableDiv = outerDiv.querySelector('.scrollbar-hide');
        expect(scrollableDiv?.className).toContain('scrollbar-hide');
        expect(scrollableDiv?.className).toContain('flex');
        expect(scrollableDiv?.className).toContain('gap-2');
        expect(scrollableDiv?.className).toContain('overflow-x-auto');
        expect(scrollableDiv?.className).toContain('pb-2');
    });

    it('applies custom className when provided', () => {
        const { container } = render(
            <ScrollableContainer className="custom-class mt-4">
                <div>Test content</div>
            </ScrollableContainer>
        );

        const outerDiv = container.firstChild as HTMLElement;
        expect(outerDiv.className).toContain('relative');
        expect(outerDiv.className).toContain('mt-4');
        expect(outerDiv.className).toContain('custom-class');
    });

    it('renders fade overlays with correct styles', () => {
        const { container } = render(
            <ScrollableContainer>
                <div>Test content</div>
            </ScrollableContainer>
        );

        const overlays = container.querySelectorAll('.pointer-events-none');
        expect(overlays).toHaveLength(2);

        // Left overlay
        const leftOverlay = overlays[0] as HTMLElement;
        expect(leftOverlay.className).toContain('absolute');
        expect(leftOverlay.className).toContain('top-0');
        expect(leftOverlay.className).toContain('left-0');
        expect(leftOverlay.className).toContain('h-full');
        expect(leftOverlay.className).toContain('w-1.5');
        expect(leftOverlay.className).toContain('bg-gradient-to-r');
        expect(leftOverlay.className).toContain('from-white');
        expect(leftOverlay.className).toContain('to-transparent');
        expect(leftOverlay.className).toContain('dark:from-neutral-900');

        // Right overlay
        const rightOverlay = overlays[1] as HTMLElement;
        expect(rightOverlay.className).toContain('absolute');
        expect(rightOverlay.className).toContain('top-0');
        expect(rightOverlay.className).toContain('right-0');
        expect(rightOverlay.className).toContain('h-full');
        expect(rightOverlay.className).toContain('w-1.5');
        expect(rightOverlay.className).toContain('bg-gradient-to-l');
        expect(rightOverlay.className).toContain('from-white');
        expect(rightOverlay.className).toContain('to-transparent');
        expect(rightOverlay.className).toContain('dark:from-neutral-900');
    });

    it('works with no children', () => {
        const { container } = render(<ScrollableContainer />);

        const outerDiv = container.firstChild as HTMLElement;
        expect(outerDiv).toBeDefined();
        expect(outerDiv.className).toContain('relative');

        const scrollableDiv = outerDiv.querySelector('.scrollbar-hide');
        expect(scrollableDiv).toBeDefined();

        const overlays = container.querySelectorAll('.pointer-events-none');
        expect(overlays).toHaveLength(2);
    });

    it('works with single child', () => {
        render(
            <ScrollableContainer>
                <span data-testid="single-child">Only child</span>
            </ScrollableContainer>
        );

        expect(screen.getByTestId('single-child')).toBeDefined();
        expect(screen.getByText('Only child')).toBeDefined();
    });

    it('maintains proper structure with multiple nested elements', () => {
        render(
            <ScrollableContainer className="test-wrapper">
                <div>
                    <span>Nested content 1</span>
                </div>
                <div>
                    <span>Nested content 2</span>
                </div>
            </ScrollableContainer>
        );

        expect(screen.getByText('Nested content 1')).toBeDefined();
        expect(screen.getByText('Nested content 2')).toBeDefined();
    });
});
