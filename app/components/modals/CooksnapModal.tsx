'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { TbPhotoPlus } from 'react-icons/tb';
import { AiFillDelete } from 'react-icons/ai';
import confetti from 'canvas-confetti';

import Modal from '@/app/components/modals/Modal';
import useCooksnapModal from '@/app/hooks/useCooksnapModal';
import StarRating from '@/app/components/utils/StarRating';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import { compressImage } from '@/app/utils/compressImage';
import useIsMounted from '@/app/hooks/useIsMounted';

const CooksnapModal: React.FC = () => {
    const cooksnapModal = useCooksnapModal();
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();
    const mounted = useIsMounted();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [note, setNote] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isDragOver, setIsDragOver] = useState(false);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetState = useCallback(() => {
        if (previewUrl) {
            try {
                URL.revokeObjectURL(previewUrl);
            } catch {
                // Ignore
            }
        }
        setSelectedFile(null);
        setPreviewUrl(null);
        setNote('');
        setRating(null);
        setIsLoading(false);
        setIsDragOver(false);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [previewUrl]);

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

    const handleClose = useCallback(() => {
        resetState();
        cooksnapModal.onClose();
    }, [resetState, cooksnapModal]);

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
            setSelectedFile(file);
            setPreviewUrl(objectUrl);
        },
        [previewUrl, mounted, t]
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
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSubmit = async () => {
        if (!selectedFile || !cooksnapModal.recipeId) {
            toast.error(
                mounted
                    ? t('cooksnap_photo_required', {
                          defaultValue: 'Please attach a photo of your dish',
                      })
                    : 'Please attach a photo of your dish'
            );
            return;
        }

        setIsLoading(true);

        try {
            // 1. Compress image to WebP
            const compressedFile = await compressImage(selectedFile);

            // 2. Request pre-signed R2 upload URL
            const uploadResponse = await axios.post('/api/upload/r2', {
                filename: compressedFile.name,
                contentType: compressedFile.type,
            });

            const { uploadUrl, publicUrl } = uploadResponse.data;

            if (uploadUrl) {
                await axios.put(uploadUrl, compressedFile, {
                    headers: {
                        'Content-Type': compressedFile.type,
                    },
                });
            }

            // 3. Post comment with isCooked: true
            const defaultNote = mounted
                ? t('i_made_this_default_note', {
                      defaultValue: 'I made this recipe! 📸',
                  })
                : 'I made this recipe! 📸';

            const commentText = note.trim() || defaultNote;

            await axios.post('/api/comments', {
                recipeId: cooksnapModal.recipeId,
                comment: commentText,
                rating: rating,
                isCooked: true,
                imageSrc: publicUrl,
            });

            toast.success(
                mounted
                    ? t('cooksnap_created', {
                          defaultValue: 'Cooksnap shared! Author was notified.',
                      })
                    : 'Cooksnap shared! Author was notified.'
            );

            try {
                confetti({
                    particleCount: 60,
                    spread: 70,
                    origin: { y: 0.6 },
                });
            } catch {
                // Ignore if canvas-confetti fails in test environment
            }

            handleClose();
            refresh?.();
        } catch (error) {
            console.error('Failed to submit cooksnap', error);
            toast.error(
                mounted
                    ? t('something_went_wrong', {
                          defaultValue: 'Something went wrong',
                      })
                    : 'Something went wrong'
            );
        } finally {
            setIsLoading(false);
        }
    };

    const bodyContent = (
        <div className="flex flex-col gap-5">
            {/* Subtitle */}
            <p className="text-sm text-neutral-500 dark:text-neutral-400">
                {mounted
                    ? t('cooksnap_modal_subtitle', {
                          defaultValue:
                              'Show the community and the author how your version turned out!',
                      })
                    : 'Show the community and the author how your version turned out!'}
            </p>

            {/* Photo Upload Area */}
            {!previewUrl ? (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onClick={() => fileInputRef.current?.click()}
                    className={`relative flex h-48 w-full cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed border-neutral-300 bg-transparent p-6 text-neutral-600 transition hover:opacity-70 focus:outline-hidden dark:border-neutral-700 dark:text-neutral-400 ${
                        isDragOver
                            ? 'border-green-450 dark:border-green-450 bg-neutral-50 dark:bg-neutral-800/40'
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
                                  defaultValue:
                                      'Drag and drop or click to browse',
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
            ) : (
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
                        aria-label="Remove photo"
                        className="absolute top-2 right-2 z-10 flex size-8 cursor-pointer items-center justify-center rounded-full bg-neutral-900/70 text-white transition hover:bg-rose-500"
                        data-testid="remove-cooksnap-photo"
                    >
                        <AiFillDelete size={18} />
                    </button>
                </div>
            )}

            {/* Star Rating Section */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    {mounted
                        ? t('cooksnap_rate_recipe', {
                              defaultValue: 'Rate this recipe (optional)',
                          })
                        : 'Rate this recipe (optional)'}
                </label>
                <div className="flex items-center gap-2">
                    <StarRating
                        rating={rating || 0}
                        interactive
                        onChange={(r) => setRating(r === rating ? null : r)}
                        size={22}
                    />
                    {rating !== null && rating > 0 && (
                        <button
                            type="button"
                            onClick={() => setRating(null)}
                            className="cursor-pointer text-xs text-neutral-400 hover:text-neutral-600 hover:underline dark:hover:text-neutral-200"
                        >
                            {mounted
                                ? t('clear', { defaultValue: 'Clear' })
                                : 'Clear'}
                        </button>
                    )}
                </div>
            </div>

            {/* Quick Note Input */}
            <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    {mounted
                        ? t('cooksnap_note_label', {
                              defaultValue: 'Cook note (optional)',
                          })
                        : 'Cook note (optional)'}
                </label>
                <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder={
                        mounted
                            ? String(
                                  t('cooksnap_note_placeholder', {
                                      defaultValue:
                                          'How was it? Any ingredient substitutions?',
                                  })
                              )
                            : 'How was it? Any ingredient substitutions?'
                    }
                    rows={3}
                    maxLength={500}
                    className="w-full resize-none rounded-lg border border-neutral-300 bg-transparent p-3 text-sm text-neutral-800 transition focus:border-green-500 focus:outline-none dark:border-neutral-700 dark:text-neutral-100 dark:focus:border-green-400"
                    data-testid="cooksnap-note-input"
                />
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={cooksnapModal.isOpen}
            onClose={handleClose}
            onSubmit={handleSubmit}
            title={
                mounted
                    ? String(
                          t('cooksnap_modal_title', {
                              defaultValue: 'Share your dish',
                          })
                      )
                    : 'Share your dish'
            }
            actionLabel={
                mounted
                    ? String(
                          t('cooksnap_submit', {
                              defaultValue: 'Post Cooksnap',
                          })
                      )
                    : 'Post Cooksnap'
            }
            disabled={isLoading}
            actionDisabled={!selectedFile}
            isLoading={isLoading}
            body={bodyContent}
        />
    );
};

export default CooksnapModal;
