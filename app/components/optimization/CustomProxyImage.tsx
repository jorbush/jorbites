'use client';

import { useState, useEffect, useRef } from 'react';
import { getProxyImageSrcAndSrcSet } from '@/app/utils/imageOptimizer';
import useIsMounted from '@/app/hooks/useIsMounted';

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
    const isMounted = useIsMounted();
    const [isLoadedState, setIsLoadedState] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);
    const useMaxQuality = maxQuality || quality === 'auto:best';

    const isLoaded = isLoadedState || (isMounted && !!imgRef.current?.complete);

    const actualWidth = width;
    const actualHeight = height;

    const { src: optimizedSrc, srcSet } = getProxyImageSrcAndSrcSet({
        src,
        width: actualWidth,
        height: actualHeight,
        quality,
        fill,
        maxQuality,
    });

    const fallbackImage = '/avocado.webp';
    let placeholderSrc = fallbackImage;

    if (src && src.startsWith('/')) {
        placeholderSrc = src;
    } else if (
        src &&
        (src.includes('cloudinary.com') ||
            src.includes('googleusercontent.com') ||
            src.includes('githubusercontent.com'))
    ) {
        const ratio =
            actualWidth && actualHeight ? actualHeight / actualWidth : null;
        const placeholderParams = new URLSearchParams();
        placeholderParams.set('url', src);
        placeholderParams.set('w', '20');
        if (ratio) {
            placeholderParams.set('h', Math.round(20 * ratio).toString());
        }
        placeholderParams.set('q', 'auto:eco');
        placeholderSrc = `/api/image-proxy?${placeholderParams.toString()}`;
    }

    // Reset isLoaded when source changes during render
    const [prevOptimizedSrc, setPrevOptimizedSrc] = useState(optimizedSrc);
    if (optimizedSrc !== prevOptimizedSrc) {
        setPrevOptimizedSrc(optimizedSrc);
        setIsLoadedState(false);
    }

    useEffect(() => {
        if (
            preloadViaProxy &&
            optimizedSrc &&
            optimizedSrc !== fallbackImage &&
            typeof window !== 'undefined'
        ) {
            const link = document.createElement('link');
            link.rel = 'preload';
            link.as = 'image';
            link.fetchPriority = 'high';
            if (srcSet) {
                link.setAttribute('imagesrcset', srcSet);
                link.setAttribute('imagesizes', sizes);
            } else {
                link.href = optimizedSrc;
            }
            document.head.appendChild(link);
        }
    }, [optimizedSrc, srcSet, sizes]);

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
                srcSet={srcSet || undefined}
                alt={alt}
                width={!fill ? actualWidth : undefined}
                height={!fill ? actualHeight : undefined}
                onLoad={() => setIsLoadedState(true)}
                style={baseStyle}
                sizes={sizes}
                className={`${className} ${fill ? 'object-cover' : ''} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}
