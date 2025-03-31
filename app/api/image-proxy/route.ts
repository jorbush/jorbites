import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Get parameters from query string
    const url = request.nextUrl.searchParams.get('url');
    const width = parseInt(request.nextUrl.searchParams.get('w') || '400', 10);
    const height = parseInt(request.nextUrl.searchParams.get('h') || '400', 10);
    const quality = request.nextUrl.searchParams.get('q') || 'auto:good';

    if (!url) {
        return new Response('URL parameter is required', { status: 400 });
    }

    try {
        let imageUrl = url;

        // Process Cloudinary URLs to apply optimizations
        if (url.includes('cloudinary.com')) {
            try {
                const cloudinaryRegex =
                    /^(https?:\/\/res\.cloudinary\.com\/[^\/]+)\/image\/upload(?:\/([^\/]+))?\/(.+)$/;
                const matches = url.match(cloudinaryRegex);

                if (matches) {
                    const [, baseUrl, _, imagePath] = matches;

                    // Limit image dimensions to prevent unnecessarily large images
                    // Cap at 1500px for any dimension as a safety measure
                    const safeWidth = Math.min(width, 1500);
                    const safeHeight = Math.min(height, 1500);

                    // Create optimized Cloudinary URL with appropriate quality and format
                    imageUrl = `${baseUrl}/image/upload/f_auto,q_${quality},w_${safeWidth},h_${safeHeight},c_fill/${imagePath}`;
                }
            } catch (error) {
                console.error(
                    '[Image Proxy] Error parsing Cloudinary URL:',
                    error
                );
            }
        }

        // Log the dimensions for debugging
        console.log(
            `[Image Proxy] Requesting image: ${width}x${height} from ${url.substring(0, 100)}...`
        );

        // Fetch the image from the source
        const imageResponse = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Image Proxy',
                Accept: 'image/webp,image/avif,image/*',
            },
            cache: 'force-cache',
            next: {
                revalidate: 60 * 60 * 24 * 30, // Revalidate monthly
            },
        });

        if (!imageResponse.ok) {
            return new Response(
                `Failed to fetch image: ${imageResponse.statusText}`,
                {
                    status: imageResponse.status,
                }
            );
        }

        // Return the image with appropriate headers
        const imageData = await imageResponse.arrayBuffer();
        const contentType =
            imageResponse.headers.get('Content-Type') || 'image/jpeg';

        return new NextResponse(imageData, {
            status: 200,
            headers: {
                'Content-Type': contentType,
                'Cache-Control': 'public, max-age=31536000, immutable',
                'Content-Length': imageData.byteLength.toString(),
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('[Image Proxy] Unhandled error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
