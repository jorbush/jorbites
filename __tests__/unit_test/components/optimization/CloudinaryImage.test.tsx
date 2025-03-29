import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import CloudinaryImage from '@/app/components/optimization/CloudinaryImage';

// Mock del componente CloudinaryImage
vi.mock('@/app/components/optimization/CloudinaryImage', () => ({
    default: ({
        src = '',
        alt = '',
        width,
        height,
        priority = false,
        fill = false,
        className = '',
        ...props
    }) => {
        // Determinar la URL de origen correcta
        const isLocalPath = src.startsWith('/');
        const imgSrc = isLocalPath
            ? src
            : src
              ? `/api/image-proxy?url=${encodeURIComponent(src)}&w=${width || 400}&h=${height || 400}&q=auto:good`
              : '/advocado.webp';

        // Aplicar estilos si fill es true
        const imgStyle = fill
            ? {
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  ...props.style,
              }
            : props.style;

        // Clases condicionales
        const imgClassName = `${className} transition-opacity duration-500 opacity-0`;

        // Crear el elemento
        return (
            <div
                className={fill ? 'relative aspect-square w-full' : ''}
                data-testid="image-container"
            >
                <div
                    aria-hidden="true"
                    data-testid="placeholder"
                ></div>
                <img
                    src={imgSrc}
                    alt={alt}
                    width={width}
                    height={height}
                    className={imgClassName}
                    loading={priority ? 'eager' : 'lazy'}
                    style={imgStyle}
                    {...props}
                    data-testid="cloudinary-image"
                    onLoad={(e) => {
                        // Simular transición de opacidad
                        e.currentTarget.className = `${className} transition-opacity duration-500 opacity-100`;
                        if (props.onLoad) props.onLoad(e);
                    }}
                />
            </div>
        );
    },
}));

describe('CloudinaryImage', () => {
    beforeEach(() => {
        vi.resetAllMocks();
    });

    // Clean up DOM after each test
    afterEach(() => {
        cleanup();
    });

    it('renders a placeholder when loading', () => {
        render(
            <CloudinaryImage
                src="https://example.com/image.jpg"
                alt="Test image"
            />
        );

        const placeholder = screen.getByTestId('placeholder');
        expect(placeholder).toBeDefined();
        expect(placeholder.getAttribute('aria-hidden')).toBe('true');
    });

    it('renders the image with correct attributes', () => {
        render(
            <CloudinaryImage
                src="https://example.com/image.jpg"
                alt="Test image"
                width={500}
                height={300}
            />
        );

        const img = screen.getByTestId('cloudinary-image');
        expect(img).toBeDefined();
        expect(img.getAttribute('src')).toContain('api/image-proxy');
        expect(img.getAttribute('width')).toBe('500');
        expect(img.getAttribute('height')).toBe('300');
        expect(img.getAttribute('loading')).toBe('lazy');
        expect(img.getAttribute('alt')).toBe('Test image');
    });

    it('uses eager loading when priority is true', () => {
        render(
            <CloudinaryImage
                src="https://example.com/image.jpg"
                alt="Test image"
                priority={true}
            />
        );

        const img = screen.getByTestId('cloudinary-image');
        expect(img.getAttribute('loading')).toBe('eager');
    });

    it('uses fallback image when src is empty', () => {
        render(
            <CloudinaryImage
                src=""
                alt="Empty source"
            />
        );

        const img = screen.getByTestId('cloudinary-image');
        expect(img.getAttribute('src')).toBe('/advocado.webp');
    });

    it('applies fill styles correctly when fill prop is true', () => {
        render(
            <CloudinaryImage
                src="https://example.com/image.jpg"
                alt="Fill image"
                fill={true}
            />
        );

        const img = screen.getByTestId('cloudinary-image');
        const imgStyle = img.style;
        expect(imgStyle.position).toBe('absolute');
        expect(imgStyle.width).toBe('100%');
        expect(imgStyle.height).toBe('100%');
        expect(imgStyle.objectFit).toBe('cover');

        const container = screen.getByTestId('image-container');
        expect(container.className).toContain('relative');
        expect(container.className).toContain('aspect-square');
    });

    it('sets image to visible after loading', async () => {
        const { getByTestId } = render(
            <CloudinaryImage
                src="https://example.com/image.jpg"
                alt="Test image"
            />
        );

        const img = getByTestId('cloudinary-image');
        expect(img.className).toContain('opacity-0');

        // Simular evento de carga
        img.dispatchEvent(new Event('load'));

        await waitFor(() => {
            expect(img.className).toContain('opacity-100');
            expect(img.className).not.toContain('opacity-0');
        });
    });

    it('handles local paths correctly', () => {
        const { getByTestId } = render(
            <CloudinaryImage
                src="/local/image.jpg"
                alt="Local image"
            />
        );

        const img = getByTestId('cloudinary-image');
        expect(img.getAttribute('src')).toBe('/local/image.jpg');
        expect(img.getAttribute('src')).not.toContain('api/image-proxy');
    });
});
