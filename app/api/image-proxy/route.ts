import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
    const url = request.nextUrl.searchParams.get('url');
    const width = request.nextUrl.searchParams.get('w') || '400';
    const height = request.nextUrl.searchParams.get('h') || '400';
    const quality = request.nextUrl.searchParams.get('q') || 'auto:good';

    if (!url) {
        console.error('[Image Proxy] Missing URL parameter');
        return new Response('URL parameter is required', { status: 400 });
    }

    try {
        let imageUrl = url;

        if (url.includes('cloudinary.com')) {
            try {
                const cloudinaryRegex =
                    /^(https?:\/\/res\.cloudinary\.com\/[^\/]+)\/image\/upload(?:\/([^\/]+))?\/(.+)$/;
                const matches = url.match(cloudinaryRegex);

                if (matches) {
                    const [, baseUrl, _, imagePath] = matches;
                    imageUrl = `${baseUrl}/image/upload/f_auto,q_${quality},w_${width},h_${height},c_fill/${imagePath}`;
                }
            } catch (error) {
                console.error(
                    '[Image Proxy] Error parsing Cloudinary URL:',
                    error
                );
            }
        }

        const headers = new Headers({
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'CDN-Cache-Control': 'public, max-age=31536000, immutable',
            'Vercel-CDN-Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*',
        });

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
            console.error(
                `[Image Proxy] Fetch error: ${imageResponse.status} ${imageResponse.statusText}`
            );
            return new Response(
                `Failed to fetch image: ${imageResponse.statusText}`,
                {
                    status: imageResponse.status,
                }
            );
        }

        const imageData = await imageResponse.arrayBuffer();
        const contentType = imageResponse.headers.get('Content-Type');
        if (contentType) {
            headers.set('Content-Type', contentType);
        }
        return new NextResponse(imageData, { headers });
    } catch (error) {
        console.error('[Image Proxy] Unhandled error:', error);
        return new Response('Internal Server Error', { status: 500 });
    }
}
