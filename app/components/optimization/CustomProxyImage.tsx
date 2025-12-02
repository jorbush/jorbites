'use client';

import { useState } from 'react';

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

function getProxyUrl(
    src: string,
    width: number,
    height: number,
    quality: string
) {
    if (!src || src === '') return '/avocado.webp';
    if (src.startsWith('/')) return src;

    if (
        src.includes('cloudinary.com') ||
        src.includes('googleusercontent.com') ||
        src.includes('githubusercontent.com')
    ) {
        return `/api/image-proxy?url=${encodeURIComponent(src)}&w=${width}&h=${height}&q=${quality}`;
    }

    return src;
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
    quality = 'auto:good',
    style,
    circular = false,
    maxQuality = false,
}: CustomProxyImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);

    const useMaxQuality = maxQuality || quality === 'auto:best';

    // Calculate dimensions
    // If fill is true, we default to width/height props or 400 if not provided
    // The previous logic had a specific check for '250px' in sizes, we can keep it if we want to maintain exact behavior for the fallback src
    const actualWidth = fill ? (sizes.includes('250px') ? 250 : width) : width;
    const actualHeight = fill
        ? sizes.includes('250px')
            ? 250
            : height
        : height;

    // Generate Main Src
    let optimizedSrc = src;
    if (useMaxQuality) {
        // For max quality, we might bypass resizing if supported, but getProxyUrl expects w/h
        // We'll just use a large dimension or the original logic
        if (
            src.includes('cloudinary.com') ||
            src.includes('googleusercontent.com') ||
            src.includes('githubusercontent.com')
        ) {
            optimizedSrc = `/api/image-proxy?url=${encodeURIComponent(src)}&q=auto:best`;
        }
    } else {
        optimizedSrc = getProxyUrl(src, actualWidth, actualHeight, quality);
    }

    // Generate SrcSet
    const generateSrcSet = () => {
        if (
            !src ||
            src.startsWith('/') ||
            (!src.includes('cloudinary.com') &&
                !src.includes('googleusercontent.com') &&
                !src.includes('githubusercontent.com'))
        ) {
            return undefined;
        }

        if (useMaxQuality) return undefined;

        const breakpoints = [250, 384, 640, 750, 828, 1080, 1200, 1920];

        return breakpoints
            .map((w) => {
                // Calculate height to maintain aspect ratio if not filling/square
                // If fill/circular, we assume square or let CSS handle aspect ratio but we need to request enough pixels.
                // If the container is square (aspect-square), we should request square images.
                // If we don't know, we can request w=w and h=w (square) or try to maintain ratio.
                // The previous code used actualWidth/actualHeight.

                let h = w;
                if (!fill && !circular && actualWidth && actualHeight) {
                    h = Math.round(w * (actualHeight / actualWidth));
                }

                return `${getProxyUrl(src, w, h, quality)} ${w}w`;
            })
            .join(', ');
    };

    const srcSet = generateSrcSet();

    // Placeholder
    const placeholderSrc =
        src && !src.startsWith('/')
            ? getProxyUrl(src, 20, 20, 'auto:eco')
            : src;

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

    return (
        <div
            className={`${(fill && !maxQuality) || circular ? 'relative aspect-square' : ''} overflow-hidden bg-neutral-200 dark:bg-neutral-700 ${circular ? 'rounded-full' : ''} ${fill || circular ? className : ''} ${useMaxQuality && !fill ? 'flex items-center justify-center' : ''}`}
            style={
                !fill && !circular
                    ? { width: actualWidth, height: actualHeight, ...style }
                    : style
            }
        >
            {/* Blurry placeholder - only for non-circular images and if not priority */}
            {placeholderSrc && !circular && !priority && (
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
                src={optimizedSrc}
                srcSet={srcSet}
                alt={alt}
                width={actualWidth}
                height={actualHeight}
                onLoad={() => setIsLoaded(true)}
                style={baseStyle}
                sizes={sizes}
                loading={priority ? 'eager' : 'lazy'}
                fetchPriority={priority ? 'high' : undefined}
                decoding={priority ? 'sync' : 'async'}
                className={`${className} ${fill ? 'object-cover' : ''} transition-opacity duration-300 ${priority || isLoaded ? 'opacity-100' : 'opacity-0'}`}
                id={priority ? 'lcp-image' : undefined}
            />
        </div>
    );
}
