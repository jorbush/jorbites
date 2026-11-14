import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import HorizontalScrollSection from '@/app/components/utils/HorizontalScrollSection';

describe('HorizontalScrollSection', () => {
    beforeEach(() => {
        // Mock scrollTo for testing
        Element.prototype.scrollTo = vi.fn();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the title correctly', () => {
        render(
            <HorizontalScrollSection
                title="Test Title"
                hasItems={true}
            >
                <div>Item 1</div>
            </HorizontalScrollSection>
        );

        expect(screen.getByText('Test Title')).toBeDefined();
    });

    it('renders children when hasItems is true', () => {
        render(
            <HorizontalScrollSection
                title="Test Title"
                hasItems={true}
            >
                <div>Item 1</div>
                <div>Item 2</div>
            </HorizontalScrollSection>
        );

        expect(screen.getByText('Item 1')).toBeDefined();
        expect(screen.getByText('Item 2')).toBeDefined();
    });

    it('shows empty message when hasItems is false', () => {
        const emptyMessage = 'No items available';
        render(
            <HorizontalScrollSection
                title="Test Title"
                hasItems={false}
                emptyMessage={emptyMessage}
            >
                <div>Item 1</div>
            </HorizontalScrollSection>
        );

        expect(screen.getByText(emptyMessage)).toBeDefined();
        expect(screen.queryByText('Item 1')).toBeNull();
    });

    it('uses default empty message when not provided', () => {
        render(
            <HorizontalScrollSection
                title="Test Title"
                hasItems={false}
            >
                <div>Item 1</div>
            </HorizontalScrollSection>
        );

        expect(screen.getByText('No items found')).toBeDefined();
    });

    it('renders scroll buttons with correct aria labels', () => {
        const { container } = render(
            <HorizontalScrollSection
                title="Test Title"
                hasItems={true}
            >
                <div>Item 1</div>
            </HorizontalScrollSection>
        );

        // Check for aria labels
        const leftButton = container.querySelector(
            '[aria-label="Scroll left"]'
        );
        const rightButton = container.querySelector(
            '[aria-label="Scroll right"]'
        );

        // Buttons exist in the DOM even if hidden initially
        expect(leftButton).toBeDefined();
        expect(rightButton).toBeDefined();
    });

    it('applies correct CSS classes to scroll container', () => {
        const { container } = render(
            <HorizontalScrollSection
                title="Test Title"
                hasItems={true}
            >
                <div>Item 1</div>
            </HorizontalScrollSection>
        );

        const scrollContainer = container.querySelector('.overflow-x-auto');
        expect(scrollContainer).toBeDefined();
        expect(scrollContainer?.classList.contains('scrollbar-hide')).toBe(
            true
        );
        expect(scrollContainer?.classList.contains('scroll-smooth')).toBe(true);
        expect(scrollContainer?.classList.contains('scroll-px-1')).toBe(true);
        expect(scrollContainer?.classList.contains('sm:scroll-px-3')).toBe(
            true
        );
    });

    it('hides edge fade overlays below md screens when scrollable', () => {
        const { container } = render(
            <HorizontalScrollSection
                title="Test Title"
                hasItems={true}
            >
                <div>Item 1</div>
            </HorizontalScrollSection>
        );

        const scrollContainer = container.querySelector(
            '.overflow-x-auto'
        ) as HTMLElement;

        Object.defineProperty(scrollContainer, 'scrollWidth', {
            configurable: true,
            value: 1000,
        });
        Object.defineProperty(scrollContainer, 'clientWidth', {
            configurable: true,
            value: 300,
        });
        Object.defineProperty(scrollContainer, 'scrollLeft', {
            configurable: true,
            value: 100,
        });

        fireEvent.scroll(scrollContainer);

        const leftFade = container.querySelector('.bg-gradient-to-r');
        const rightFade = container.querySelector('.bg-gradient-to-l');

        expect(leftFade).not.toBeNull();
        expect(rightFade).not.toBeNull();
        expect(leftFade?.classList.contains('hidden')).toBe(true);
        expect(leftFade?.classList.contains('md:block')).toBe(true);
        expect(rightFade?.classList.contains('hidden')).toBe(true);
        expect(rightFade?.classList.contains('md:block')).toBe(true);
    });

    it('uses scoped group/scroll class to avoid polluting child card hover states', () => {
        const { container } = render(
            <HorizontalScrollSection
                title="Test Title"
                hasItems={true}
            >
                <div>Item 1</div>
            </HorizontalScrollSection>
        );

        const groupWrapper = container.querySelector('.group\\/scroll');
        expect(groupWrapper).not.toBeNull();
        expect(groupWrapper?.classList.contains('group')).toBe(false);
    });
});
