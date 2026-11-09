'use client';

import React from 'react';
import StarRating from '@/app/components/utils/StarRating';

export interface CommentRatingProps {
    rating?: number | null;
}

const CommentRating: React.FC<CommentRatingProps> = ({ rating }) => {
    if (rating === undefined || rating === null || rating <= 0) {
        return null;
    }

    return (
        <div
            className="mt-1 mb-2 flex items-center"
            data-testid="comment-rating"
        >
            <StarRating
                rating={rating}
                size={14}
            />
        </div>
    );
};

export default CommentRating;
