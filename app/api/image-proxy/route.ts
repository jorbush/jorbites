import { NextRequest, NextResponse } from 'next/server';
import { badRequest, internalServerError } from '@/app/utils/apiErrors';
import { logger, withAxiom } from '@/app/lib/axiom/server';

export const GET = withAxiom(async (request: NextRequest) => {
    logger.info('GET /api/image-proxy - start');
    const url = request.nextUrl.searchParams.get('url');
    const width = request.nextUrl.searchParams.get('w');
    const height = request.nextUrl.searchParams.get('h');
    const quality = request.nextUrl.searchParams.get('q') || 'auto:good';

    if (!url) {
        logger.error('GET /api/image-proxy - missing URL parameter');
        return badRequest('URL parameter is required');
    }

    try {
        let imageUrl = url;

        if (url.includes('cloudinary.com')) {
            try {
                const cloudinaryRegex =
                    /^(https?:\/\/res\.cloudinary\.com\/[^/]+)\/image\/upload(?:\/([^/]+))?\/(.+)$/;
                const matches = url.match(cloudinaryRegex);

                if (matches) {
                    const [, baseUrl, _existingTransforms, imagePath] = matches;

                    let qualityParam = 'q_auto:good';
                    if (quality === 'low') {
                        qualityParam = 'q_10,e_blur:800';
                    } else if (quality !== 'auto:good') {
                        qualityParam = `q_${quality}`;
                    }

                    // For maximum quality without dimensions, only apply format and quality transformations
                    if (quality === 'auto:best' && !width && !height) {
                        imageUrl = `${baseUrl}/image/upload/f_auto,${qualityParam}/${imagePath}`;
                    } else {
                        // Use provided dimensions or defaults
                        const w = width || '400';
                        const h = height || '400';
                        imageUrl = `${baseUrl}/image/upload/f_auto,${qualityParam},w_${w},h_${h},c_fill/${imagePath}`;
                    }
                } else {
                    console.error(
                        '[Image Proxy] Invalid Cloudinary URL format:',
                        url
                    );
                }
            } catch (error) {
                console.error(
                    '[Image Proxy] Error parsing Cloudinary URL:',
                    error
                );
            }
        } else if (url.includes('googleusercontent.com')) {
            try {
                // For Google images, we can add size parameters
                // Google supports s parameter for size (s=96 for 96x96 pixels)
                if (width || height) {
                    const size = Math.max(
                        parseInt(width || '400'),
                        parseInt(height || '400')
                    );

                    // If the URL already has parameters, add size parameter
                    if (url.includes('=')) {
                        // Replace existing size parameter or add new one
                        if (url.includes('=s')) {
                            imageUrl = url.replace(/=s\d+/, `=s${size}`);
                        } else {
                            imageUrl = `${url}-s${size}`;
                        }
                    } else {
                        // Add size parameter for basic URLs
                        imageUrl = `${url}=s${size}`;
                    }
                }
                // If no dimensions specified, use original URL for maximum quality
            } catch (error) {
                console.error('[Image Proxy] Error parsing Google URL:', error);
            }
        } else if (url.includes('githubusercontent.com')) {
            try {
                // For GitHub images, we can add size parameters
                // GitHub supports s parameter for size (&s=96 for 96x96 pixels)
                if (width || height) {
                    const size = Math.max(
                        parseInt(width || '400'),
                        parseInt(height || '400')
                    );

                    // Parse the URL to add or replace size parameter
                    const urlObj = new URL(url);
                    urlObj.searchParams.set('s', size.toString());
                    imageUrl = urlObj.toString();
                }
                // If no dimensions specified, use original URL for maximum quality
            } catch (error) {
                console.error('[Image Proxy] Error parsing GitHub URL:', error);
            }
        }

        console.log('[Image Proxy] Fetching from:', imageUrl);
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
            console.error(
                `[Image Proxy] Fetch error: ${imageResponse.status} ${imageResponse.statusText}`
            );
            return badRequest(
                `Failed to fetch image: ${imageResponse.statusText}`
            );
        }

        const imageData = await imageResponse.arrayBuffer();
        const contentType =
            imageResponse.headers.get('Content-Type') || 'image/jpeg';

        logger.info('GET /api/image-proxy - success', {
            url: imageUrl.substring(0, 100),
            contentType,
        });
        return new NextResponse(imageData, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error: any) {
        logger.error('GET /api/image-proxy - error', {
            error: error.message,
            url,
        });
        return internalServerError('Failed to process image request');
    }
});
