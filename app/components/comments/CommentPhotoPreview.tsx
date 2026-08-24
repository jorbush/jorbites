'use client';

import React from 'react';
import { HiX } from 'react-icons/hi';

export interface CommentPhotoPreviewProps {
    previewUrl: string | null;
    onRemove: () => void;
}

const CommentPhotoPreview: React.FC<CommentPhotoPreviewProps> = ({
    previewUrl,
    onRemove,
}) => {
    if (!previewUrl) return null;

    return (
        <div className="mt-2.5 inline-block">
            <div className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                    src={previewUrl}
                    alt="Remake preview"
                    className="size-16 object-cover"
                    data-testid="photo-preview"
                />
                <button
                    type="button"
                    onClick={onRemove}
                    aria-label="Remove photo"
                    data-testid="remove-photo"
                    className="absolute top-1 right-1 flex size-4 cursor-pointer items-center justify-center rounded-full bg-rose-500 text-white transition hover:bg-rose-600"
                >
                    <HiX size={10} />
                </button>
            </div>
        </div>
    );
};

export default CommentPhotoPreview;
