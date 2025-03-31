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

    // Calculate actual display dimensions based on container
    const actualWidth = fill ? (sizes.includes('250px') ? 250 : width) : width;
    const actualHeight = fill
        ? sizes.includes('250px')
            ? 250
            : height
        : height;

    // Convert Cloudinary URL to proxy URL with correct dimensions
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

        // For Cloudinary images, use the proxy with ACTUAL display dimensions
        if (src.includes('cloudinary.com')) {
            try {
                // URL for the full image with actual dimensions
                const proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&w=${actualWidth}&h=${actualHeight}&q=auto:good`;

                // URL for the placeholder (smaller, blurry)
                const placeholderUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&w=20&h=20&q=auto:eco`;

                setOptimizedSrc(proxyUrl);
                setPlaceholderSrc(placeholderUrl);

                // Preload LCP image if needed
                if (preloadViaProxy && typeof window !== 'undefined') {
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
    }, [src, actualWidth, actualHeight, preloadViaProxy, sizes]);

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
              width: actualWidth,
              height: actualHeight,
          };

    // Only render if we have a valid source
    if (!optimizedSrc) {
        return (
            <div
                className={`${fill ? 'relative aspect-square' : ''} overflow-hidden bg-gray-200 dark:bg-gray-700 ${fill ? className : ''}`}
                style={
                    !fill
                        ? { width: actualWidth, height: actualHeight }
                        : undefined
                }
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

            {/* Main image */}
            <img
                ref={imgRef}
                src={optimizedSrc}
                alt={alt}
                width={actualWidth}
                height={actualHeight}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setIsLoaded(true)}
                style={baseStyle}
                sizes={sizes}
                className={`${className} ${fill ? 'object-cover' : ''} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}
