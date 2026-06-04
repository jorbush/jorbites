'use client';

import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

interface StarRatingProps {
    rating: number; // 0 to 5
    interactive?: boolean;
    onChange?: (rating: number) => void;
    size?: number;
    className?: string;
}

export const StarRating: React.FC<StarRatingProps> = ({
    rating,
    interactive = false,
    onChange,
    size = 20,
    className = '',
}) => {
    const [hoverRating, setHoverRating] = useState<number | null>(null);

    const handleClick = (value: number) => {
        if (interactive && onChange) {
            onChange(value);
        }
    };

    const handleMouseEnter = (value: number) => {
        if (interactive) {
            setHoverRating(value);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setHoverRating(null);
        }
    };

    const displayRating = hoverRating !== null ? hoverRating : rating;

    // Render stars
    const renderStar = (index: number) => {
        const starValue = index + 1;
        const sizeStyle = { width: size, height: size };

        if (interactive) {
            const isFilled = starValue <= displayRating;
            return (
                <button
                    key={starValue}
                    type="button"
                    onClick={() => handleClick(starValue)}
                    onMouseEnter={() => handleMouseEnter(starValue)}
                    onMouseLeave={handleMouseLeave}
                    className={`transform transition-all duration-150 hover:scale-115 focus:outline-hidden ${
                        isFilled
                            ? 'scale-105 text-amber-500'
                            : 'text-neutral-300 dark:text-neutral-600'
                    }`}
                    style={{ cursor: 'pointer' }}
                    data-testid={`star-${starValue}`}
                    aria-label={`Rate ${starValue} stars`}
                >
                    <FaStar style={sizeStyle} />
                </button>
            );
        }

        // Read-only display mode with support for halves
        if (rating >= starValue) {
            // Full star
            return (
                <span
                    key={starValue}
                    className="text-amber-500"
                    data-testid={`star-filled-${index}`}
                >
                    <FaStar style={sizeStyle} />
                </span>
            );
        } else if (rating >= starValue - 0.5) {
            // Half star
            return (
                <span
                    key={starValue}
                    className="text-amber-500"
                    data-testid={`star-half-${index}`}
                >
                    <FaStarHalfAlt style={sizeStyle} />
                </span>
            );
        } else {
            // Empty star
            return (
                <span
                    key={starValue}
                    className="text-neutral-300 dark:text-neutral-600"
                    data-testid={`star-empty-${index}`}
                >
                    <FaRegStar style={sizeStyle} />
                </span>
            );
        }
    };

    return (
        <div
            className={`flex items-center gap-1 ${className}`}
            onMouseLeave={handleMouseLeave}
        >
            {Array.from({ length: 5 }).map((_, index) => renderStar(index))}
        </div>
    );
};

export default StarRating;
