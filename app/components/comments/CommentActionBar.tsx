'use client';

import React from 'react';
import CommentRateButton from './CommentRateButton';
import CommentPhotoUpload from './CommentPhotoUpload';
import CommentSubmitButton from './CommentSubmitButton';

export interface CommentActionBarProps {
    rating: number | null;
    showRating: boolean;
    onToggleRating: () => void;
    selectedFile: File | null;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    isSubmitting: boolean;
    commentEmpty: boolean;
}

const CommentActionBar: React.FC<CommentActionBarProps> = ({
    rating,
    showRating,
    onToggleRating,
    selectedFile,
    onFileSelect,
    fileInputRef,
    isSubmitting,
    commentEmpty,
}) => {
    return (
        <div className="mt-3 flex items-center justify-between border-t border-neutral-200/70 pt-2.5 dark:border-neutral-700/70">
            {/* Action Options (Rate & Photo) */}
            <div className="flex flex-wrap items-center gap-2">
                <CommentRateButton
                    rating={rating}
                    showRating={showRating}
                    onToggleRating={onToggleRating}
                />
                <CommentPhotoUpload
                    selectedFile={selectedFile}
                    onFileSelect={onFileSelect}
                    fileInputRef={fileInputRef}
                />
            </div>

            {/* Submit Action Button */}
            <CommentSubmitButton
                isSubmitting={isSubmitting}
                commentEmpty={commentEmpty}
            />
        </div>
    );
};

export default CommentActionBar;
