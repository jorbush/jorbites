'use client';

import React, { useState } from 'react';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import PhotoLightbox from '@/app/components/modals/PhotoLightbox';

export interface CommentImageProps {
    imageSrc?: string | null;
}

const CommentImage: React.FC<CommentImageProps> = ({ imageSrc }) => {
    const [lightboxOpen, setLightboxOpen] = useState(false);

    if (!imageSrc) {
        return null;
    }

    return (
        <>
            <div className="mt-2.5">
                <button
                    type="button"
                    onClick={() => setLightboxOpen(true)}
                    className="group relative inline-block overflow-hidden rounded-xl border border-neutral-200/80 shadow-2xs transition-colors duration-200 hover:border-neutral-300 focus:outline-hidden dark:border-neutral-700/80 dark:hover:border-neutral-600"
                    data-testid="remake-photo-button"
                    data-cy="remake-photo-button"
                >
                    <CustomProxyImage
                        src={imageSrc}
                        alt="User remake proof"
                        width={180}
                        height={140}
                        className="object-cover transition-transform duration-200 group-hover:scale-105"
                    />
                </button>
            </div>

            <PhotoLightbox
                src={imageSrc}
                alt="User remake proof full size"
                isOpen={lightboxOpen}
                onClose={() => setLightboxOpen(false)}
                testId="lightbox-modal"
            />
        </>
    );
};

export default CommentImage;
