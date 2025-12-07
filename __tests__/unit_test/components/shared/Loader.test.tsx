import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import Loader from '@/app/components/shared/Loader';
import React from 'react';

describe('<Loader />', () => {
    beforeEach(() => {
        vi.useFakeTimers();
    });

    afterEach(() => {
        vi.useRealTimers();
        cleanup();
    });

    it('renders the loader component', () => {
        render(<Loader />);
        const image = screen.getByAltText('Loading...');
        expect(image).toBeDefined();
    });

    it('renders with default height', () => {
        const { container } = render(<Loader />);
        const loaderDiv = container.querySelector('div');
        expect(loaderDiv?.style.height).toBe('70vh');
    });

    it('renders with custom height', () => {
        const { container } = render(<Loader height="50vh" />);
        const loaderDiv = container.querySelector('div');
        expect(loaderDiv?.style.height).toBe('50vh');
    });

    it('renders the avocado image with correct dimensions', () => {
        render(<Loader />);
        const image = screen.getByAltText('Loading...') as HTMLImageElement;
        expect(image).toBeDefined();
        // Next.js Image component sets width and height as attributes
        expect(image.getAttribute('width')).toBe('80');
        expect(image.getAttribute('height')).toBe('80');
    });

    it('applies correct CSS classes', () => {
        const { container } = render(<Loader />);
        const loaderDiv = container.querySelector('div');
        expect(loaderDiv?.className).toContain('flex');
        expect(loaderDiv?.className).toContain('flex-col');
        expect(loaderDiv?.className).toContain('items-center');
        expect(loaderDiv?.className).toContain('justify-center');
    });
});
