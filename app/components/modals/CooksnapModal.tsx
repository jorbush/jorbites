'use client';

import React, { useState, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import confetti from 'canvas-confetti';

import Modal from '@/app/components/modals/Modal';
import useCooksnapModal from '@/app/hooks/useCooksnapModal';
import StarRating from '@/app/components/utils/StarRating';
import { compressImage } from '@/app/utils/compressImage';
import useIsMounted from '@/app/hooks/useIsMounted';
import CooksnapDropzone from './cooksnap/CooksnapDropzone';

const CooksnapModal: React.FC = () => {
    const cooksnapModal = useCooksnapModal();
    const { refresh } = useRouter() || {};
    const { t } = useTranslation();
    const mounted = useIsMounted();

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [note, setNote] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleClose = useCallback(() => {
        setSelectedFile(null);
        setNote('');
        setRating(null);
        setIsLoading(false);
        cooksnapModal.onClose();
    }, [cooksnapModal]);

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

            // 3. Post cooksnap to dedicated endpoint
            const defaultNote = mounted
                ? t('i_made_this_default_note', {
                      defaultValue: 'I made this recipe!',
                  })
                : 'I made this recipe!';

            const commentText = note.trim() || defaultNote;

            await axios.post('/api/cooksnaps', {
                recipeId: cooksnapModal.recipeId,
                imageSrc: publicUrl,
                comment: commentText,
                rating: rating,
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
            <CooksnapDropzone
                onFileSelected={setSelectedFile}
                disabled={isLoading}
            />

            {/* Star Rating Section */}
            <div className="flex flex-col gap-1.5">
                <span className="text-xs font-semibold text-neutral-600 dark:text-neutral-300">
                    {mounted
                        ? t('cooksnap_rate_recipe', {
                              defaultValue: 'Rate this recipe (optional)',
                          })
                        : 'Rate this recipe (optional)'}
                </span>
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
                <label
                    htmlFor="cooksnap-note-input"
                    className="text-xs font-semibold text-neutral-600 dark:text-neutral-300"
                >
                    {mounted
                        ? t('cooksnap_note_label', {
                              defaultValue: 'Cook note (optional)',
                          })
                        : 'Cook note (optional)'}
                </label>
                <textarea
                    id="cooksnap-note-input"
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
