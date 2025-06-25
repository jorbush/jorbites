import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import Avatar from '@/app/components/utils/Avatar';
import React from 'react';

// Mock CustomProxyImage component
vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt, width, height, className, style, quality }: any) => (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            style={style}
            data-quality={quality}
            data-testid="custom-proxy-image"
        />
    ),
}));

describe('<Avatar/>', () => {
    afterEach(() => {
        cleanup();
    });

    it('should render with default size and placeholder image when src is null', () => {
        render(<Avatar src={null} />);

        const img = screen.getByAltText('Avatar');
        expect(img).toBeDefined();
        expect(img.getAttribute('src')).toBe('/images/placeholder.webp');
        expect(img.getAttribute('width')).toBe('60'); // 2x for high-DPI
        expect(img.getAttribute('height')).toBe('60'); // 2x for high-DPI
        expect(img.style.width).toBe('30px');
        expect(img.style.height).toBe('30px');
    });

    it('should render with provided src and size', () => {
        const src = 'https://example.com/avatar.jpg';
        const size = 50;
        render(
            <Avatar
                src={src}
                size={size}
            />
        );

        const img = screen.getByAltText('Avatar');
        expect(img).toBeDefined();
        expect(img.getAttribute('src')).toBe(src);
        expect(img.getAttribute('width')).toBe((size * 2).toString()); // 2x for high-DPI
        expect(img.getAttribute('height')).toBe((size * 2).toString()); // 2x for high-DPI
        expect(img.style.width).toBe(`${size}px`);
        expect(img.style.height).toBe(`${size}px`);
    });

    it('should call onClick handler when clicked', () => {
        const handleClick = vi.fn();
        render(
            <Avatar
                src="https://example.com/avatar.jpg"
                onClick={handleClick}
            />
        );

        const container = screen.getByAltText('Avatar').parentElement;
        fireEvent.click(container!);
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should not have cursor-pointer class when onClick is not provided', () => {
        render(<Avatar src="https://example.com/avatar.jpg" />);

        const container = screen.getByAltText('Avatar').parentElement;
        expect(container?.className).not.toContain('cursor-pointer');
    });

    it('should have cursor-pointer class when onClick is provided', () => {
        render(
            <Avatar
                src="https://example.com/avatar.jpg"
                onClick={() => {}}
            />
        );

        const container = screen.getByAltText('Avatar').parentElement;
        expect(container?.className).toContain('cursor-pointer');
    });

    it('should apply extra classes to the image', () => {
        const extraClasses = 'border-2 border-blue-500';
        render(
            <Avatar
                src="https://example.com/avatar.jpg"
                extraClasses={extraClasses}
            />
        );

        const img = screen.getByAltText('Avatar');
        expect(img.className).toContain('border-2');
        expect(img.className).toContain('border-blue-500');
    });

    it('should use default quality when not specified', () => {
        render(<Avatar src="https://example.com/avatar.jpg" />);

        const img = screen.getByAltText('Avatar');
        expect(img.getAttribute('data-quality')).toBe('auto:good');
    });

    it('should use custom quality when specified', () => {
        render(
            <Avatar
                src="https://example.com/avatar.jpg"
                quality="auto:best"
            />
        );

        const img = screen.getByAltText('Avatar');
        expect(img.getAttribute('data-quality')).toBe('auto:best');
    });
});
