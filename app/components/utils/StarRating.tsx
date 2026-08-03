'use client';

import React, { useState } from 'react';
import { FaStar, FaStarHalfAlt, FaRegStar } from 'react-icons/fa';

const STAR_VALUES = [1, 2, 3, 4, 5] as const;

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
    const renderStar = (starValue: number) => {
        const index = starValue - 1;
        const sizeStyle = { width: size, height: size };

        if (interactive) {
            const isFilled = starValue <= displayRating;
            return (
                <button
                    key={`star-interactive-${starValue}`}
                    type="button"
                    onClick={() => handleClick(starValue)}
                    onMouseEnter={() => handleMouseEnter(starValue)}
                    onMouseLeave={handleMouseLeave}
                    className={`flex transform items-center justify-center p-2 transition-all duration-150 hover:scale-115 focus:outline-hidden ${
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
                    key={`star-display-filled-${starValue}`}
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
                    key={`star-display-half-${starValue}`}
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
                    key={`star-display-empty-${starValue}`}
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
            className={`flex items-center ${interactive ? 'gap-0' : 'gap-1'} ${className}`}
            onMouseLeave={handleMouseLeave}
        >
            {STAR_VALUES.map((starValue) => renderStar(starValue))}
        </div>
    );
};

export default StarRating;
