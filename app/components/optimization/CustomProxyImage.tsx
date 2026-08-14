'use client';

import { useState, useRef } from 'react';
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
    const [loadedSrc, setLoadedSrc] = useState<string | null>(null);
    const imgRef = useRef<HTMLImageElement>(null);
    const useMaxQuality = maxQuality || quality === 'auto:best';

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

    const isLoaded =
        loadedSrc === optimizedSrc || (isMounted && !!imgRef.current?.complete);

    const fallbackImage = '/avocado.webp';
    let placeholderSrc = fallbackImage;

    if (src && src.startsWith('/')) {
        placeholderSrc = src;
    } else if (
        src &&
        (src.includes('cloudinary.com') ||
            src.includes('googleusercontent.com') ||
            src.includes('githubusercontent.com') ||
            src.includes('r2.cloudflarestorage.com') ||
            src.includes('.r2.dev') ||
            src.includes(
                process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN ||
                    process.env.R2_PUBLIC_DOMAIN ||
                    'images.jorbites.com'
            ))
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
                className={`relative ${fill ? 'size-full' : ''} ${fill && !maxQuality ? 'aspect-square' : ''} ${circular ? 'aspect-square rounded-full' : ''} overflow-hidden bg-neutral-200 dark:bg-neutral-700 ${fill || circular ? className : ''}`}
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
            className={`relative ${fill ? 'size-full' : ''} ${fill && !maxQuality ? 'aspect-square' : ''} ${circular ? 'aspect-square rounded-full' : ''} overflow-hidden ${fill || circular ? className : ''} ${useMaxQuality && !fill ? 'flex items-center justify-center' : ''}`}
            style={
                !fill && !circular
                    ? { width: actualWidth, height: actualHeight, ...style }
                    : style
            }
        >
            {preloadViaProxy &&
                optimizedSrc &&
                optimizedSrc !== fallbackImage && (
                    <link
                        rel="preload"
                        as="image"
                        href={srcSet ? undefined : optimizedSrc}
                        imageSrcSet={srcSet || undefined}
                        imageSizes={srcSet ? sizes : undefined}
                        fetchPriority="high"
                    />
                )}

            {/* Blurry placeholder - only for non-circular images */}
            {placeholderSrc && !circular && (
                <div
                    style={{
                        backgroundImage: `url(${placeholderSrc})`,
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        filter: 'blur(8px)',
                    }}
                    className={`pointer-events-none absolute inset-0 h-full w-full bg-neutral-200 transition-opacity duration-300 dark:bg-neutral-700 ${isLoaded ? 'opacity-0' : 'opacity-100'}`}
                    aria-hidden="true"
                />
            )}

            {/* Main image */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
                ref={imgRef}
                id={priority ? 'lcp-image' : undefined}
                src={optimizedSrc}
                srcSet={srcSet || undefined}
                alt={alt}
                width={!fill ? actualWidth : undefined}
                height={!fill ? actualHeight : undefined}
                loading={priority ? 'eager' : undefined}
                decoding={priority ? 'sync' : undefined}
                fetchPriority={priority ? 'high' : undefined}
                onLoad={() => setLoadedSrc(optimizedSrc)}
                style={baseStyle}
                sizes={sizes}
                className={`${className} ${fill ? 'object-cover' : ''} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}
