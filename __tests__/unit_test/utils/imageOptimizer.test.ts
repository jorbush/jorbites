import { describe, it, expect } from 'vitest';
import { getProxyImageSrcAndSrcSet } from '@/app/utils/imageOptimizer';

describe('getProxyImageSrcAndSrcSet', () => {
    it('returns fallback image when src is empty or undefined', () => {
        const result1 = getProxyImageSrcAndSrcSet({ src: '' });
        expect(result1.src).toBe('/avocado.webp');
        expect(result1.srcSet).toBe('');

        const result2 = getProxyImageSrcAndSrcSet({ src: undefined as any });
        expect(result2.src).toBe('/avocado.webp');
        expect(result2.srcSet).toBe('');
    });

    it('returns original path and empty srcSet for local images', () => {
        const result = getProxyImageSrcAndSrcSet({ src: '/images/recipe.jpg' });
        expect(result.src).toBe('/images/recipe.jpg');
        expect(result.srcSet).toBe('');
    });

    it('returns original path and empty srcSet for non-remote URLs', () => {
        const result = getProxyImageSrcAndSrcSet({
            src: 'data:image/png;base64,123',
        });
        expect(result.src).toBe('data:image/png;base64,123');
        expect(result.srcSet).toBe('');
    });

    it('generates proxy URLs for remote images', () => {
        const result = getProxyImageSrcAndSrcSet({
            src: 'https://res.cloudinary.com/dzv3dzkbx/image/upload/v1721469287/recipe.jpg',
            width: 800,
            height: 600,
            quality: 'auto:good',
        });
        expect(result.src).toContain('/api/image-proxy');
        expect(result.src).toContain(
            'url=https%3A%2F%2Fres.cloudinary.com%2Fdzv3dzkbx%2Fimage%2Fupload%2Fv1721469287%2Frecipe.jpg'
        );
        expect(result.src).toContain('w=800');
        expect(result.src).toContain('h=600');
        expect(result.src).toContain('q=auto%3Agood');
    });

    it('supports maxQuality without dimensions', () => {
        const result = getProxyImageSrcAndSrcSet({
            src: 'https://res.cloudinary.com/dzv3dzkbx/image/upload/v1721469287/recipe.jpg',
            maxQuality: true,
        });
        expect(result.src).toContain('/api/image-proxy');
        expect(result.src).toContain(
            'url=https%3A%2F%2Fres.cloudinary.com%2Fdzv3dzkbx%2Fimage%2Fupload%2Fv1721469287%2Frecipe.jpg'
        );
        expect(result.src).toContain('q=auto%3Abest');
        expect(result.src).not.toContain('w=');
        expect(result.src).not.toContain('h=');
    });

    it('generates responsive srcset for fill layout', () => {
        const result = getProxyImageSrcAndSrcSet({
            src: 'https://res.cloudinary.com/test/image.jpg',
            fill: true,
            quality: 'auto:best',
        });
        expect(result.srcSet).toBeDefined();
        // Check that it contains multiple widths
        expect(result.srcSet).toContain('384w');
        expect(result.srcSet).toContain('750w');
        expect(result.srcSet).toContain('1200w');
        expect(result.srcSet).toContain('2048w');
        // Check that each URL inside srcset is properly parameterized
        expect(result.srcSet).toContain('/api/image-proxy?url=');
        expect(result.srcSet).toContain('q=auto%3Abest');
    });

    it('generates 1x/2x/3x srcset for fixed layout', () => {
        const result = getProxyImageSrcAndSrcSet({
            src: 'https://res.cloudinary.com/test/image.jpg',
            width: 100,
            height: 100,
            quality: 'auto:good',
        });
        expect(result.srcSet).toBeDefined();
        expect(result.srcSet).toContain('1x');
        expect(result.srcSet).toContain('2x');
        expect(result.srcSet).toContain('3x');
        expect(result.srcSet).toContain('w=100&h=100');
        expect(result.srcSet).toContain('w=200&h=200');
        expect(result.srcSet).toContain('w=300&h=300');
    });
});
