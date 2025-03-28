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

    console.log('[Image Proxy] Processing URL:', url);

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

                    imageUrl = `${baseUrl}/image/upload/f_auto,${qualityParam},w_${width},h_${height},c_fill/${imagePath}`;
                    console.log('[Image Proxy] Transformed URL:', imageUrl);
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
        }

        console.log('[Image Proxy] Fetching from:', imageUrl);
        const imageResponse = await fetch(imageUrl, {
            headers: {
                'User-Agent': 'Jorbites Image Proxy',
                Accept: 'image/webp,image/avif,image/*',
            },
            cache: 'force-cache',
            next: {
                revalidate: 60 * 60 * 24 * 7, // Revalidate every 7 days
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
        return new Response('Internal Server Error in image proxy', {
            status: 500,
        });
    }
}
