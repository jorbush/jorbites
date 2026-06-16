/**
 * Extracts the first image URL from an array of recipes
 */
export function getFirstRecipeImageUrl(
    recipes: any[] | undefined
): string | null {
    if (!recipes || recipes.length === 0) return null;
    return recipes[0]?.imageSrc || null;
}

export interface ImageOptimizeParams {
    src: string;
    width?: number;
    height?: number;
    quality?: 'auto:eco' | 'auto:good' | 'auto:best';
    fill?: boolean;
    maxQuality?: boolean;
}

export function getProxyImageSrcAndSrcSet({
    src,
    width,
    height,
    quality = 'auto:good',
    fill = false,
    maxQuality = false,
}: ImageOptimizeParams) {
    const fallbackImage = '/avocado.webp';
    if (!src || src === '') {
        return { src: fallbackImage, srcSet: '' };
    }

    if (src.startsWith('/')) {
        return { src, srcSet: '' };
    }

    const isProxyable =
        src.includes('cloudinary.com') ||
        src.includes('googleusercontent.com') ||
        src.includes('githubusercontent.com');

    if (!isProxyable) {
        return { src, srcSet: '' };
    }

    const useMaxQuality = maxQuality || quality === 'auto:best';
    const q = useMaxQuality ? 'auto:best' : quality;

    const buildUrl = (w?: number, h?: number) => {
        const params = new URLSearchParams();
        params.set('url', src);
        if (w) params.set('w', w.toString());
        if (h) params.set('h', h.toString());
        params.set('q', q);
        return `/api/image-proxy?${params.toString()}`;
    };

    let optimizedSrc = '';
    if (useMaxQuality && !width && !height) {
        optimizedSrc = buildUrl();
    } else {
        optimizedSrc = buildUrl(width || 400, height || 400);
    }

    let srcSet = '';
    if (fill) {
        // For fill, we generate a responsive width-based srcSet
        const widths = [384, 640, 750, 828, 1080, 1200, 1920, 2048];
        const ratio = width && height ? height / width : null;

        srcSet = widths
            .map((w) => {
                const h = ratio ? Math.round(w * ratio) : undefined;
                return `${buildUrl(w, h)} ${w}w`;
            })
            .join(', ');
    } else if (width && height) {
        // For fixed size, generate 1x, 2x, 3x descriptors
        srcSet = [
            `${buildUrl(width, height)} 1x`,
            `${buildUrl(width * 2, height * 2)} 2x`,
            `${buildUrl(width * 3, height * 3)} 3x`,
        ].join(', ');
    }

    return { src: optimizedSrc, srcSet };
}
