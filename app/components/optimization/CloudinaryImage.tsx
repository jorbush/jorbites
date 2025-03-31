'use client';

import { useState, useEffect, useRef } from 'react';

interface CloudinaryImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
    width?: number;
    height?: number;
    sizes?: string;
    preloadViaProxy?: boolean;
}

export default function CloudinaryImage({
    src,
    alt,
    fill = false,
    className = '',
    priority = false,
    width = 400,
    height = 400,
    sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 250px',
    preloadViaProxy = false,
}: CloudinaryImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
    const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null);
    const [imageDimensions, setImageDimensions] = useState({ width, height });

    // Calculate optimal image dimensions based on viewport
    useEffect(() => {
        if (typeof window === 'undefined') return;

        // Calculate optimal image dimensions based on device
        const calculateDimensions = () => {
            const viewportWidth = window.innerWidth;
            const pixelRatio = window.devicePixelRatio || 1;

            // Calculate image width based on responsive layout
            let calculatedWidth;

            if (fill) {
                // For recipe cards in grid
                if (viewportWidth < 640) {
                    calculatedWidth = viewportWidth - 32; // Full width - padding
                } else if (viewportWidth < 768) {
                    calculatedWidth = (viewportWidth - 48) / 2; // 2 columns
                } else if (viewportWidth < 1024) {
                    calculatedWidth = (viewportWidth - 64) / 3; // 3 columns
                } else if (viewportWidth < 1280) {
                    calculatedWidth = (viewportWidth - 80) / 4; // 4 columns
                } else if (viewportWidth < 1536) {
                    calculatedWidth = (viewportWidth - 96) / 5; // 5 columns
                } else {
                    calculatedWidth = (viewportWidth - 112) / 6; // 6 columns
                }

                // Cap at reasonable maximum size
                calculatedWidth = Math.min(calculatedWidth, 500);

                // Apply device pixel ratio for optimal sharpness
                calculatedWidth = Math.round(calculatedWidth * pixelRatio);
                const calculatedHeight = calculatedWidth; // Square aspect ratio for cards

                setImageDimensions({
                    width: calculatedWidth,
                    height: calculatedHeight,
                });
            } else {
                // For non-fill images, use the provided dimensions but with pixel ratio
                setImageDimensions({
                    width: Math.round(width * pixelRatio),
                    height: Math.round(height * pixelRatio),
                });
            }
        };

        // Calculate on component mount
        calculateDimensions();

        // Recalculate when window resizes
        window.addEventListener('resize', calculateDimensions);
        return () => window.removeEventListener('resize', calculateDimensions);
    }, [fill, width, height]);

    // Convert Cloudinary URL to proxy URL
    useEffect(() => {
        const fallbackImage = '/advocado.webp';

        if (!src || src === '') {
            setOptimizedSrc(fallbackImage);
            setPlaceholderSrc(fallbackImage);
            return;
        }

        // For local images, use directly
        if (src.startsWith('/')) {
            setOptimizedSrc(src);
            setPlaceholderSrc(src);
            return;
        }

        // For Cloudinary images, use the proxy
        if (src.includes('cloudinary.com')) {
            try {
                // URL for the full image with optimal dimensions
                const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&w=${imageDimensions.width}&h=${imageDimensions.height}&q=auto:good`;

                // URL for the placeholder (smaller, blurry)
                const placeholderUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&w=20&h=20&q=auto:eco`;

                setOptimizedSrc(proxyUrl);
                setPlaceholderSrc(placeholderUrl);

                // Preload LCP image if needed
                if (priority && typeof window !== 'undefined') {
                    const link = document.createElement('link');
                    link.rel = 'preload';
                    link.href = proxyUrl;
                    link.as = 'image';
                    link.fetchPriority = 'high';
                    document.head.appendChild(link);
                }

                return;
            } catch (e) {
                console.error('Error creating proxy URL:', e);
                setOptimizedSrc(fallbackImage);
                setPlaceholderSrc(fallbackImage);
            }
        }

        // Fallback to original URL
        setOptimizedSrc(src);
        setPlaceholderSrc(src);
    }, [src, imageDimensions.width, imageDimensions.height, priority]);

    // Set high fetch priority for LCP images
    useEffect(() => {
        if (imgRef.current && priority) {
            imgRef.current.setAttribute('fetchpriority', 'high');
            imgRef.current.setAttribute('loading', 'eager');
            imgRef.current.setAttribute('decoding', 'sync');
            imgRef.current.id = 'lcp-image';
        }
    }, [priority]);

    // Styling based on fill mode
    const baseStyle = fill
        ? ({
              position: 'absolute',
              width: '100%',
              height: '100%',
              inset: 0,
              objectFit: 'cover',
          } as React.CSSProperties)
        : {
              width,
              height,
          };

    // Only render if we have a valid source
    if (!optimizedSrc) {
        return (
            <div
                className={`${fill ? 'relative aspect-square' : ''} overflow-hidden bg-gray-200 dark:bg-gray-700 ${fill ? className : ''}`}
                style={!fill ? { width, height } : undefined}
            />
        );
    }

    return (
        <div
            className={`${fill ? 'relative aspect-square' : ''} overflow-hidden bg-gray-200 dark:bg-gray-700 ${fill ? className : ''}`}
        >
            {/* Blurry placeholder */}
            {!isLoaded && placeholderSrc && (
                <div
                    style={{
                        ...baseStyle,
                        backgroundImage: `url(${placeholderSrc})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(8px)',
                        transform: 'scale(1.05)',
                    }}
                    aria-hidden="true"
                />
            )}

            {/* Main image with intrinsic size hint for browser */}
            <img
                ref={imgRef}
                src={optimizedSrc}
                alt={alt}
                width={!fill ? width : undefined}
                height={!fill ? height : undefined}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setIsLoaded(true)}
                style={baseStyle}
                sizes={sizes}
                className={`${className} ${fill ? 'object-cover' : ''} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}
