'use client';

import { useState, useEffect, useRef } from 'react';

interface CloudinaryImageProps {
    src: string;
    alt: string;
    fill?: boolean;
    className?: string;
    priority?: boolean;
}

export default function CloudinaryImage({
    src,
    alt,
    fill = false,
    className = '',
    priority = false,
}: CloudinaryImageProps) {
    const [isLoaded, setIsLoaded] = useState(false);
    const imgRef = useRef<HTMLImageElement>(null);

    // Set high fetch priority for LCP images
    useEffect(() => {
        if (imgRef.current && priority) {
            imgRef.current.setAttribute('fetchpriority', 'high');
            imgRef.current.setAttribute('loading', 'eager');
        }
    }, [priority]);

    // Default fallback
    const fallbackImage = '/advocado.webp';

    // Simple proxy URL - all recipe card images are same size
    let imageSrc = src;
    if (src && src.includes('cloudinary.com')) {
        imageSrc = `/api/image-proxy?url=${encodeURIComponent(src)}`;
    } else if (!src) {
        imageSrc = fallbackImage;
    }

    // Styling based on fill mode
    const imageStyle = fill
        ? ({
              position: 'absolute',
              width: '100%',
              height: '100%',
              inset: 0,
              objectFit: 'cover',
          } as React.CSSProperties)
        : {};

    return (
        <div
            className={`${fill ? 'relative aspect-square' : ''} overflow-hidden bg-gray-200 dark:bg-gray-700 ${fill ? className : ''}`}
        >
            <img
                ref={imgRef}
                src={imageSrc}
                alt={alt}
                loading={priority ? 'eager' : 'lazy'}
                onLoad={() => setIsLoaded(true)}
                style={imageStyle}
                className={`${className} ${fill ? 'object-cover' : ''} transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            />
        </div>
    );
}
