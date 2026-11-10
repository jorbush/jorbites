'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlineCamera } from 'react-icons/hi';
import useIsMounted from '@/app/hooks/useIsMounted';

export interface CommentPhotoUploadProps {
    selectedFile: File | null;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
}

const CommentPhotoUpload: React.FC<CommentPhotoUploadProps> = ({
    selectedFile,
    onFileSelect,
    fileInputRef,
}) => {
    const mounted = useIsMounted();
    const { t } = useTranslation();

    const translatedPhoto = t('add_photo');
    const label =
        mounted && translatedPhoto && translatedPhoto !== 'add_photo'
            ? String(translatedPhoto)
            : 'Add photo';

    const hasFile = Boolean(selectedFile);
    const labelClass = hasFile
        ? 'border-green-450/40 bg-green-450/15 dark:text-green-450 text-neutral-900'
        : 'border-neutral-200/80 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/60';

    const iconClass = hasFile
        ? 'dark:text-green-450 text-neutral-900'
        : 'text-neutral-500 dark:text-neutral-400';

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={onFileSelect}
                className="hidden"
                id="cooked-photo-input"
                data-testid="cooked-photo-input"
                data-cy="cooked-photo-input"
                aria-label={label}
            />
            <label
                htmlFor="cooked-photo-input"
                className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors duration-200 select-none ${labelClass}`}
                title={label}
            >
                <HiOutlineCamera
                    size={15}
                    className={iconClass}
                />
                <span className="hidden text-xs font-semibold md:inline">
                    {label}
                </span>
            </label>
        </div>
    );
};

export default CommentPhotoUpload;
