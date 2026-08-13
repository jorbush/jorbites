import { NextRequest, NextResponse } from 'next/server';
import { badRequest, internalServerError } from '@/app/utils/apiErrors';
import { logger } from '@/app/lib/axiom/server';

const r2PublicDomain = (process.env.R2_PUBLIC_DOMAIN || 'images.jorbites.com')
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');

const ALLOWED_DOMAINS = new Set([
    'res.cloudinary.com',
    'lh3.googleusercontent.com',
    'avatars.githubusercontent.com',
    'img.youtube.com',
    r2PublicDomain,
]);

const ALLOWED_FORMATS = new Set(['webp', 'png', 'jpg', 'jpeg', 'avif']);
const ALLOWED_QUALITIES = new Set([
    'auto:eco',
    'auto:good',
    'auto:best',
    'low',
]);

function parseDimension(val: string | null): number | undefined {
    if (!val) return undefined;
    if (!/^\d+$/.test(val)) return NaN;
    const num = parseInt(val, 10);
    return num > 0 && num <= 8192 ? num : NaN;
}

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    const rawWidth = request.nextUrl.searchParams.get('w');
    const rawHeight = request.nextUrl.searchParams.get('h');
    const rawQuality = request.nextUrl.searchParams.get('q') || 'auto:good';
    const requestedFormat =
        request.nextUrl.searchParams.get('f')?.toLowerCase() || 'webp';
    const format = ALLOWED_FORMATS.has(requestedFormat)
        ? requestedFormat === 'jpeg'
            ? 'jpg'
            : requestedFormat
        : 'webp';

    const width = parseDimension(rawWidth);
    const height = parseDimension(rawHeight);

    if (!url) {
        logger.error('GET /api/image-proxy - missing URL parameter');
        return badRequest('URL parameter is required');
    }

    let parsedUrl: URL;
    try {
        parsedUrl = new URL(url);
    } catch {
        logger.error('GET /api/image-proxy - invalid URL format', { url });
        return badRequest('Invalid URL format');
    }

    const isAllowedDomain =
        ALLOWED_DOMAINS.has(parsedUrl.hostname) ||
        parsedUrl.hostname.endsWith('.r2.cloudflarestorage.com');

    if (
        (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') ||
        !isAllowedDomain
    ) {
        logger.error('GET /api/image-proxy - URL domain not allowed', {
            hostname: parsedUrl.hostname,
        });
        return badRequest('URL domain not allowed');
    }

    if ((rawWidth && isNaN(width!)) || (rawHeight && isNaN(height!))) {
        logger.error(
            'GET /api/image-proxy - invalid width or height parameter',
            {
                rawWidth,
                rawHeight,
            }
        );
        return badRequest('Invalid width or height parameter');
    }

    if (!ALLOWED_QUALITIES.has(rawQuality)) {
        logger.error('GET /api/image-proxy - invalid quality parameter', {
            rawQuality,
        });
        return badRequest('Invalid quality parameter');
    }
    const quality = rawQuality as
        | 'auto:eco'
        | 'auto:good'
        | 'auto:best'
        | 'low';

    logger.info('GET /api/image-proxy - start', {
        url: url.substring(0, 100),
        width,
        height,
        quality,
        format,
    });

    try {
        let imageUrl = url;

        if (parsedUrl.hostname === 'res.cloudinary.com') {
            try {
                const cloudinaryRegex =
                    /^(https?:\/\/res\.cloudinary\.com\/[^/]+)\/image\/upload(?:\/([^/]+))?\/(.+)$/;
                const matches = url.match(cloudinaryRegex);

                if (matches) {
                    // Note: _existingTransforms is intentionally ignored to strip existing transforms and apply proxy options
                    const [, baseUrl, _existingTransforms, imagePath] = matches;

                    let qualityParam = 'q_auto:good';
                    if (quality === 'low') {
                        qualityParam = 'q_10,e_blur:800';
                    } else if (quality !== 'auto:good') {
                        qualityParam = `q_${quality}`;
                    }

                    const transformParams = [`f_${format}`, qualityParam];
                    if (width && height) {
                        transformParams.push(
                            `w_${width}`,
                            `h_${height}`,
                            'c_fill'
                        );
                    } else if (width) {
                        transformParams.push(`w_${width}`, 'c_scale');
                    } else if (height) {
                        transformParams.push(`h_${height}`, 'c_scale');
                    }
                    imageUrl = `${baseUrl}/image/upload/${transformParams.join(',')}/${imagePath}`;
                } else {
                    logger.error(
                        'GET /api/image-proxy - invalid Cloudinary URL format',
                        {
                            url,
                        }
                    );
                }
            } catch (error) {
                // Inner try/catch falls back to original URL on transform parse error
                const message =
                    error instanceof Error ? error.message : String(error);
                logger.error(
                    'GET /api/image-proxy - error parsing Cloudinary URL',
                    {
                        error: message,
                    }
                );
            }
        } else if (parsedUrl.hostname === 'lh3.googleusercontent.com') {
            try {
                if (width || height) {
                    const size = Math.max(width || 0, height || 0);

                    // Note: Google avatar URLs embed sizing parameters directly into path segments (e.g. /photo=s96-c).
                    // Using URL.pathname setter would percent-encode '=' and '-', breaking the URL. We operate on the raw string instead.
                    if (url.includes('=')) {
                        if (url.includes('=s')) {
                            imageUrl = url.replace(/=s\d+/, `=s${size}`);
                        } else {
                            imageUrl = `${url}-s${size}`;
                        }
                    } else {
                        imageUrl = `${url}=s${size}`;
                    }
                }
            } catch (error) {
                // Inner try/catch falls back to original URL on transform parse error
                const message =
                    error instanceof Error ? error.message : String(error);
                logger.error(
                    'GET /api/image-proxy - error parsing Google URL',
                    {
                        error: message,
                    }
                );
            }
        } else if (parsedUrl.hostname === 'avatars.githubusercontent.com') {
            try {
                if (width || height) {
                    const size = Math.max(width || 0, height || 0);

                    const urlObj = new URL(url);
                    urlObj.searchParams.set('s', size.toString());
                    imageUrl = urlObj.toString();
                }
            } catch (error) {
                // Inner try/catch falls back to original URL on transform parse error
                const message =
                    error instanceof Error ? error.message : String(error);
                logger.error(
                    'GET /api/image-proxy - error parsing GitHub URL',
                    {
                        error: message,
                    }
                );
            }
        }

        logger.info('GET /api/image-proxy - fetching upstream', {
            imageUrl: imageUrl.substring(0, 100),
        });
        const imageResponse = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Jorbites Image Proxy',
                Accept: 'image/webp,image/avif,image/*',
            },
            cache: 'force-cache',
            next: {
                revalidate: 60 * 60 * 24 * 30, // 30 days
            },
        });

        if (!imageResponse.ok) {
            logger.error('GET /api/image-proxy - upstream fetch failed', {
                status: imageResponse.status,
                statusText: imageResponse.statusText,
            });
            return badRequest('Failed to fetch image');
        }

        const imageData = await imageResponse.arrayBuffer();
        const contentType =
            imageResponse.headers.get('Content-Type') || 'image/jpeg';

        logger.info('GET /api/image-proxy - success', {
            url: imageUrl.substring(0, 100),
            contentType,
        });
        // Access-Control-Allow-Origin: * allows frontend client apps to safely display proxied assets cross-origin
        return new NextResponse(imageData, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error: unknown) {
        const message = error instanceof Error ? error.message : String(error);
        logger.error('GET /api/image-proxy - error', {
            error: message,
            url,
        });
        return internalServerError('Failed to process image request');
    }
}
