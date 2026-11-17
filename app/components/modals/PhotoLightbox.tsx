'use client';

import React, { useEffect, useEffectEvent, useRef } from 'react';
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
    const dialogRef = useRef<HTMLDialogElement>(null);

    const handleClose = useEffectEvent(() => {
        onClose();
    });

    useEffect(() => {
        const dialog = dialogRef.current;
        if (!dialog || !isOpen || !src) return;

        if (typeof dialog.showModal === 'function') {
            if (!dialog.open) {
                dialog.showModal();
            }
        } else {
            dialog.setAttribute('open', '');
        }

        const handleBackdropClick = (e: MouseEvent) => {
            if (e.target === dialog) {
                handleClose();
            }
        };

        const handleCancel = (e: Event) => {
            e.preventDefault();
            handleClose();
        };

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleClose();
            }
        };

        dialog.addEventListener('click', handleBackdropClick);
        dialog.addEventListener('cancel', handleCancel);
        dialog.addEventListener('keydown', handleKeyDown);

        return () => {
            dialog.removeEventListener('click', handleBackdropClick);
            dialog.removeEventListener('cancel', handleCancel);
            dialog.removeEventListener('keydown', handleKeyDown);

            if (dialog.open && typeof dialog.close === 'function') {
                dialog.close();
            } else {
                dialog.removeAttribute('open');
            }
        };
    }, [isOpen, src]);

    if (!isOpen || !src) return null;

    const hasChildren = Boolean(children);

    return (
        <dialog
            ref={dialogRef}
            aria-label={alt || 'Photo lightbox'}
            className="fixed inset-0 z-50 m-0 flex h-dvh max-h-none w-full max-w-none items-center justify-center border-none bg-neutral-950/85 p-3 backdrop-blur-xs backdrop:bg-transparent focus:outline-none sm:p-6"
            data-testid={testId}
        >
            <div className="relative flex max-h-[90vh] w-full max-w-[92vw] flex-col items-center justify-center overflow-hidden rounded-2xl border border-neutral-800 bg-neutral-900/95 p-2 shadow-2xl sm:max-w-[85vw] md:max-w-[750px]">
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
        </dialog>
    );
}
