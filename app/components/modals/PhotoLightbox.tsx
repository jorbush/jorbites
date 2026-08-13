'use client';

import React from 'react';
import { HiX } from 'react-icons/hi';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';

interface PhotoLightboxProps {
    src: string | null;
    alt?: string;
    isOpen: boolean;
    onClose: () => void;
    testId?: string;
}

export default function PhotoLightbox({
    src,
    alt = 'Full size photo',
    isOpen,
    onClose,
    testId = 'lightbox-modal',
}: PhotoLightboxProps) {
    if (!isOpen || !src) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            tabIndex={-1}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs focus:outline-none"
            onClick={onClose}
            data-testid={testId}
        >
            <div
                className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-xl bg-neutral-900 p-2 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-black/60 text-white hover:bg-black"
                    aria-label="Close photo lightbox"
                >
                    <HiX size={20} />
                </button>
                <CustomProxyImage
                    src={src}
                    alt={alt}
                    width={800}
                    height={600}
                    maxQuality
                    className="max-h-[85vh] w-auto max-w-full rounded-lg object-contain"
                />
            </div>
        </div>
    );
}
