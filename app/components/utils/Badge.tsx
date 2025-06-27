'use client';

import { useState } from 'react';
import Image from 'next/image';

interface BadgeProps {
    src: string;
    alt: string;
    onClick?: () => void;
    className?: string;
    size?: number;
}

const Badge: React.FC<BadgeProps> = ({
    src,
    alt,
    onClick,
    className = '',
    size = 50,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    const handleLoad = () => {
        setIsLoading(false);
    };

    const handleError = () => {
        setIsLoading(false);
        setHasError(true);
    };

    return (
        <div
            className={`relative flex-shrink-0 cursor-pointer ${className}`}
            onClick={onClick}
            style={{ width: size, height: size }}
        >
            {/* Skeleton placeholder */}
            {isLoading && (
                <div
                    className="absolute inset-0 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"
                    style={{ width: size, height: size }}
                />
            )}

            {/* Badge image */}
            {!hasError && (
                <Image
                    src={src}
                    alt={alt}
                    width={size}
                    height={size}
                    className={`rounded-full transition-opacity duration-300 ${
                        isLoading ? 'opacity-0' : 'opacity-100'
                    }`}
                    onLoad={handleLoad}
                    onError={handleError}
                />
            )}

            {/* Error fallback */}
            {hasError && (
                <div
                    className="flex items-center justify-center rounded-full bg-neutral-200 text-neutral-500 dark:bg-neutral-700 dark:text-neutral-400"
                    style={{ width: size, height: size }}
                >
                    <span className="text-xs">?</span>
                </div>
            )}
        </div>
    );
};

export default Badge;
