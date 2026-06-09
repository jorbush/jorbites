'use client';

import { useState, useEffect, useRef } from 'react';

interface CustomProxyImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
    width?: number;
    height?: number;
    sizes?: string;
    preloadViaProxy?: boolean;
    quality?: 'auto:eco' | 'auto:good' | 'auto:best';
    style?: React.CSSProperties;
    circular?: boolean;
    maxQuality?: boolean;
}

export default function CustomProxyImage({
    src,
    alt,
    fill = false,
    className = '',
    priority = false,
    width = 400,
    height = 400,
    sizes = '(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 250px',
    preloadViaProxy = false,
    quality = 'auto:good',
    style,
    circular = false,
    maxQuality = false,
}: CustomProxyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const useMaxQuality = maxQuality || quality === 'auto:best';

    const actualWidth = width;
    const actualHeight = height;

    const fallbackImage = '/avocado.webp';
    let optimizedSrc = fallbackImage;
    let placeholderSrc = fallbackImage;

    if (!src || src === '') {
        optimizedSrc = fallbackImage;
        placeholderSrc = fallbackImage;
    } else if (src.startsWith('/')) {
        optimizedSrc = src;
        placeholderSrc = src;
    } else if (
        src.includes('cloudinary.com') ||
        src.includes('googleusercontent.com') ||
        src.includes('githubusercontent.com')
    ) {
        try {
            if (useMaxQuality) {
                optimizedSrc = `/api/image-proxy?url=${encodeURIComponent(src)}&q=auto:best`;
            } else {
                optimizedSrc = `/api/image-proxy?url=${encodeURIComponent(src)}&w=${actualWidth}&h=${actualHeight}&q=${quality}`;
            }
            placeholderSrc = `/api/image-proxy?url=${encodeURIComponent(src)}&w=20&h=20&q=auto:eco`;
        } catch (e) {
            console.error('Error creating proxy URL:', e);
            optimizedSrc = fallbackImage;
            placeholderSrc = fallbackImage;
        }
    } else {
        optimizedSrc = src;
        placeholderSrc = src;
    }

    // Reset isLoaded when source changes during render
    const prevOptimizedSrcRef = useRef(optimizedSrc);
    if (optimizedSrc !== prevOptimizedSrcRef.current) {
        prevOptimizedSrcRef.current = optimizedSrc;
        setIsLoaded(false);
    }

    // Handle preload link injection as a side effect
    const isPreloadingRef = useRef(preloadViaProxy);
    isPreloadingRef.current = preloadViaProxy;

    useEffect(() => {
        if (
            isPreloadingRef.current &&
            optimizedSrc &&
            optimizedSrc !== fallbackImage &&
            typeof window !== 'undefined'
        ) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.href = optimizedSrc;
            link.as = 'image';
            link.fetchPriority = 'high';
            document.head.appendChild(link);
        }
    }, [optimizedSrc]);

    useEffect(() => {
        if (imgRef.current && priority) {
            imgRef.current.setAttribute('fetchpriority', 'high');
            imgRef.current.setAttribute('loading', 'eager');
            imgRef.current.setAttribute('decoding', 'sync');
            imgRef.current.id = 'lcp-image';
        }
    }, [priority]);

    // Check if the image is already complete (e.g. cached or loaded before hydration)
    useEffect(() => {
        if (imgRef.current?.complete) {
            setIsLoaded(true);
        }
    }, [optimizedSrc]);

    const baseStyle = fill
        ? ({
              position: 'absolute',
              width: '100%',
              height: '100%',
              inset: 0,
              objectFit: 'cover',
              ...style,
          } as React.CSSProperties)
        : {
              width: actualWidth,
              height: actualHeight,
              ...style,
          };

    if (!optimizedSrc) {
        return (
            <div
                className={`${fill || circular ? 'relative aspect-square' : ''} overflow-hidden bg-neutral-200 dark:bg-neutral-700 ${circular ? 'rounded-full' : ''} ${fill || circular ? className : ''}`}
                style={
                    !fill && !circular
                        ? { width: actualWidth, height: actualHeight, ...style }
                        : style
                }
            />
        );
    }

    return (
        <div
            className={`${(fill && !maxQuality) || circular ? 'relative aspect-square' : ''} overflow-hidden bg-neutral-200 dark:bg-neutral-700 ${circular ? 'rounded-full' : ''} ${fill || circular ? className : ''} ${useMaxQuality && !fill ? 'flex items-center justify-center' : ''}`}
            style={
                !fill && !circular
                    ? { width: actualWidth, height: actualHeight, ...style }
                    : style
            }
        >
            {/* Blurry placeholder - only for non-circular images */}
            {placeholderSrc && !circular && (
                <div
                    style={{
                        ...baseStyle,
                        backgroundImage: `url(${placeholderSrc})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(8px)',
                    }}
                    className={`transition-opacity duration-300 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
                    aria-hidden="true"
                />
            )}

            {/* Main image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={imgRef}
                src={optimizedSrc}
                alt={alt}
                width={actualWidth}
                height={actualHeight}
                onLoad={() => setIsLoaded(true)}
                style={baseStyle}
                sizes={sizes}
                className={`${className} ${fill ? 'object-cover' : ''} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}
