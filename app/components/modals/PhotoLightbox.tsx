'use client';

import React, { useEffect, useRef } from 'react';
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
    const onCloseRef = useRef(onClose);

    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    useEffect(() => {
        if (!isOpen || !src) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onCloseRef.current();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, src]);

    if (!isOpen || !src) return null;

    return (
        <dialog
            open
            aria-modal="true"
            aria-label={alt || 'Photo lightbox'}
            className="fixed inset-0 z-50 flex items-center justify-center border-none bg-neutral-950/85 p-3 backdrop-blur-xs focus:outline-none sm:p-6"
            data-testid={testId}
        >
            <button
                type="button"
                tabIndex={-1}
                className="fixed inset-0 size-full cursor-default border-none bg-transparent p-0 outline-none"
                onClick={onClose}
                aria-label="Close photo lightbox backdrop"
                data-testid="lightbox-backdrop"
            />
            <div
                className="relative flex max-h-[90vh] max-w-[92vw] flex-col items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/95 p-2 shadow-2xl sm:max-w-[85vw] md:max-w-[800px]"
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
                    className="max-h-[80vh] w-auto max-w-full rounded-xl object-contain"
                    style={{
                        maxWidth: '100%',
                        maxHeight: '80vh',
                        width: 'auto',
                        height: 'auto',
                    }}
                />
            </div>
        </dialog>
    );
}
