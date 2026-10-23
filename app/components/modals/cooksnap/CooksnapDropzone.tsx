'use client';

import React, { useRef, useState, useCallback, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import { TbPhotoPlus } from 'react-icons/tb';
import { AiFillDelete } from 'react-icons/ai';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import useIsMounted from '@/app/hooks/useIsMounted';

interface CooksnapDropzoneProps {
    onFileSelected: (file: File | null) => void;
    disabled?: boolean;
}

export const CooksnapDropzone: React.FC<CooksnapDropzoneProps> = ({
    onFileSelected,
    disabled = false,
}) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFile = useCallback(
        (file: File) => {
            if (!file.type.startsWith('image/')) {
                toast.error(
                    mounted
                        ? t('invalid_image_format', {
                              defaultValue: 'Please select a valid image file',
                          })
                        : 'Please select a valid image file'
                );
                return;
            }

            if (previewUrl) {
                try {
                    URL.revokeObjectURL(previewUrl);
                } catch {
                    // Ignore
                }
            }

            const objectUrl = URL.createObjectURL(file);
            setPreviewUrl(objectUrl);
            onFileSelected(file);
        },
        [previewUrl, mounted, t, onFileSelected]
    );

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
        const file = e.dataTransfer.files?.[0];
        if (file) {
            handleFile(file);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setIsDragOver(false);
    };

    const handleRemovePhoto = () => {
        if (previewUrl) {
            try {
                URL.revokeObjectURL(previewUrl);
            } catch {
                // Ignore
            }
        }
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
        onFileSelected(null);
    };

    useEffect(() => {
        return () => {
            if (previewUrl) {
                try {
                    URL.revokeObjectURL(previewUrl);
                } catch {
                    // Ignore
                }
            }
        };
    }, [previewUrl]);

    if (previewUrl) {
        return (
            <div className="relative aspect-4/3 w-full overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                <CustomProxyImage
                    src={previewUrl}
                    alt="Cooksnap preview"
                    fill
                    className="object-cover"
                    quality="auto:good"
                />
                <button
                    type="button"
                    onClick={handleRemovePhoto}
                    disabled={disabled}
                    aria-label="Remove photo"
                    className="absolute top-2 right-2 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-neutral-900/70 text-white transition hover:bg-rose-500 focus:outline-hidden"
                    data-testid="remove-cooksnap-photo"
                >
                    <AiFillDelete size={18} />
                </button>
            </div>
        );
    }

    return (
        <div
            role="button"
            tabIndex={0}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    fileInputRef.current?.click();
                }
            }}
            className={`relative flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-neutral-300 bg-transparent p-6 text-neutral-600 transition hover:opacity-70 focus:outline-hidden dark:border-neutral-700 dark:text-neutral-400 ${
                isDragOver
                    ? 'border-green-450 bg-neutral-50 dark:border-green-450 dark:bg-neutral-800/40'
                    : ''
            }`}
            data-testid="cooksnap-dropzone"
        >
            <TbPhotoPlus
                size={48}
                data-testid="TbPhotoPlus"
            />
            <div className="text-center text-sm font-medium">
                {mounted
                    ? t('cooksnap_upload_prompt', {
                          defaultValue: 'Upload dish photo',
                      })
                    : 'Upload dish photo'}
            </div>
            <span className="text-xs text-neutral-400 dark:text-neutral-500">
                {mounted
                    ? t('cooksnap_upload_hint', {
                          defaultValue: 'Drag and drop or click to browse',
                      })
                    : 'Drag and drop or click to browse'}
            </span>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
                data-testid="cooksnap-file-input"
            />
        </div>
    );
};

export default CooksnapDropzone;
