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
    disablePlaceholder?: boolean;
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
    disablePlaceholder = false,
}: CustomProxyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const [optimizedSrc, setOptimizedSrc] = useState<string | null>(null);
    const [placeholderSrc, setPlaceholderSrc] = useState<string | null>(null);

    const useMaxQuality = maxQuality || quality === 'auto:best';

    const actualWidth = width;
    const actualHeight = height;

    useEffect(() => {
        const fallbackImage = '/avocado.webp';

        if (!src || src === '') {
            setOptimizedSrc(fallbackImage);
            setPlaceholderSrc(fallbackImage);
            return;
        }

        if (src.startsWith('/')) {
            setOptimizedSrc(src);
            setPlaceholderSrc(src);
            return;
        }

        if (
            src.includes('cloudinary.com') ||
            src.includes('googleusercontent.com') ||
            src.includes('githubusercontent.com')
        ) {
            try {
                let proxyUrl;
                if (useMaxQuality) {
                    proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&q=auto:best`;
                } else {
                    proxyUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&w=${actualWidth}&h=${actualHeight}&q=${quality}`;
                }

                const placeholderUrl = `/api/image-proxy?url=${encodeURIComponent(src)}&w=20&h=20&q=auto:eco`;

                setOptimizedSrc(proxyUrl);

                if (!disablePlaceholder) {
                    setPlaceholderSrc(placeholderUrl);
                } else {
                    setPlaceholderSrc(null);
                }

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

        setOptimizedSrc(src);
        setPlaceholderSrc(src);
    }, [
        src,
        actualWidth,
        actualHeight,
        preloadViaProxy,
        sizes,
        quality,
        useMaxQuality,
        disablePlaceholder,
    ]);

    useEffect(() => {
        if (imgRef.current && priority) {
            imgRef.current.setAttribute('fetchpriority', 'high');
            imgRef.current.setAttribute('loading', 'eager');
            imgRef.current.setAttribute('decoding', 'sync');
            imgRef.current.id = 'lcp-image';
        }
    }, [priority]);

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
