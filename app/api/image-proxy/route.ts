import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    // Get parameters from query string
    const url = request.nextUrl.searchParams.get('url');

    // Fixed reasonable sizes for recipe cards
    const width = 300; // Slightly larger than 245px to account for retina displays
    const height = 300; // For square images

    // Lower quality setting
    const quality = 'auto:low'; // Use Cloudinary's auto:low quality which is good enough for thumbnails

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

                    // Create simple optimized Cloudinary URL
                    imageUrl = `${baseUrl}/image/upload/f_auto,q_${quality},w_${width},h_${height},c_fill/${imagePath}`;
                }
            } catch (error) {
                console.error(
                    '[Image Proxy] Error parsing Cloudinary URL:',
                    error
                );
            }
        }

        // Fetch the image from the source
        const imageResponse = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Jorbites Image Proxy',
                Accept: 'image/webp,image/avif,image/*',
            },
            cache: 'force-cache',
            next: {
                revalidate: 60 * 60 * 24 * 30, // Monthly revalidation
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
                'Access-Control-Allow-Origin': '*',
            },
        });
    } catch (error) {
        console.error('[Image Proxy] Unhandled error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
