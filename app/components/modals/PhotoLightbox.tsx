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
    children?: React.ReactNode;
}

export default function PhotoLightbox({
    src,
    alt = 'Full size photo',
    isOpen,
    onClose,
    testId = 'lightbox-modal',
    children,
}: PhotoLightboxProps) {
    if (!isOpen || !src) return null;

    const hasChildren = Boolean(children);

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-label={alt || 'Photo lightbox'}
            tabIndex={-1}
            onKeyDown={(e) => e.key === 'Escape' && onClose()}
            className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/85 p-3 backdrop-blur-xs focus:outline-none sm:p-6"
            onClick={onClose}
            data-testid={testId}
        >
            <div
                className="relative flex max-h-[90vh] w-full max-w-[92vw] flex-col items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/95 p-2 shadow-2xl sm:max-w-[85vw] md:max-w-[750px]"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute top-3 right-3 z-10 flex size-8 items-center justify-center rounded-full bg-neutral-950/70 text-white transition hover:bg-neutral-950 focus:outline-none sm:size-9"
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
                    className={`w-auto max-w-full rounded-xl object-contain ${
                        hasChildren ? 'max-h-[58vh]' : 'max-h-[80vh]'
                    }`}
                    style={{
                        maxWidth: '100%',
                        maxHeight: hasChildren ? '58vh' : '80vh',
                        width: 'auto',
                        height: 'auto',
                    }}
                />
                {children && (
                    <div className="w-full border-t border-neutral-800/80 px-2 pt-2.5 pb-1 text-left sm:px-3 sm:pt-3">
                        {children}
                    </div>
                )}
            </div>
        </div>
    );
}
