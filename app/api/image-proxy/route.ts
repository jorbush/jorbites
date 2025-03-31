import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Extract query parameters
    const url = request.nextUrl.searchParams.get('url');
    const width = request.nextUrl.searchParams.get('w') || '400';
    const height = request.nextUrl.searchParams.get('h') || '400';
    const quality = request.nextUrl.searchParams.get('q') || 'auto:good';

    if (!url) {
        return new Response('URL parameter is required', { status: 400 });
    }

    try {
        let imageUrl = url;
        const acceptHeader = request.headers.get('accept') || '';
        const supportsWebp = acceptHeader.includes('image/webp');
        const supportsAvif = acceptHeader.includes('image/avif');

        // Select best format based on browser support
        let format = 'auto';
        if (supportsAvif) {
            format = 'avif';
        } else if (supportsWebp) {
            format = 'webp';
        }

        // Process Cloudinary URLs
        if (url.includes('cloudinary.com')) {
            try {
                const cloudinaryRegex =
                    /^(https?:\/\/res\.cloudinary\.com\/[^\/]+)\/image\/upload(?:\/([^\/]+))?\/(.+)$/;
                const matches = url.match(cloudinaryRegex);

                if (matches) {
                    const [, baseUrl, _, imagePath] = matches;

                    // Create properly sized image URL with next-gen format
                    imageUrl = `${baseUrl}/image/upload/f_${format},q_${quality},w_${width},h_${height},c_fill/${imagePath}`;

                    console.log(`[Image Proxy] Optimized URL: ${imageUrl}`);
                }
            } catch (error) {
                console.error(
                    '[Image Proxy] Error parsing Cloudinary URL:',
                    error
                );
            }
        }

        // Cache header preparation
        const cacheControl = 'public, max-age=31536000, immutable';

        // Fetch the image directly from Cloudinary with our parameters
        const imageResponse = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Jorbites Image Proxy',
                Accept: 'image/avif,image/webp,image/*',
            },
            cache: 'force-cache',
            next: {
                revalidate: 60 * 60 * 24 * 30, // 30 days
            },
        });

        if (!imageResponse.ok) {
            console.error(
                `[Image Proxy] Failed to fetch: ${imageResponse.status} ${imageResponse.statusText}`
            );
            return new Response(
                `Failed to fetch image: ${imageResponse.statusText}`,
                {
                    status: imageResponse.status,
                }
            );
        }

        // Return optimized image with strong caching
        const imageData = await imageResponse.arrayBuffer();
        const contentType =
            imageResponse.headers.get('Content-Type') || 'image/jpeg';

        return new NextResponse(imageData, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': cacheControl,
                'CDN-Cache-Control': cacheControl,
                'Vercel-CDN-Cache-Control': cacheControl,
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('[Image Proxy] Unhandled error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
