'use client';

import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlinePaperAirplane, HiOutlineCamera, HiX } from 'react-icons/hi';
import { FiTrash } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import Avatar from '@/app/components/utils/Avatar';
import MentionInput from '@/app/components/inputs/MentionInput';
import StarRating from '@/app/components/utils/StarRating';
import {
    COMMENT_MAX_LENGTH,
    CHAR_COUNT_WARNING_THRESHOLD,
} from '@/app/utils/constants';
import useIsMounted from '@/app/hooks/useIsMounted';
import { compressImage } from '@/app/utils/compressImage';

export interface CommentBoxProps {
    userImage: string | undefined | null;
    onCreateComment: (
        comment: string,
        rating: number | null,
        isCooked?: boolean,
        imageSrc?: string | null
    ) => void;
    isLoading?: boolean;
}

const CommentBox: React.FC<CommentBoxProps> = ({
    userImage,
    onCreateComment,
    isLoading = false,
}) => {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [showRating, setShowRating] = useState(false);
    const [isCooked, setIsCooked] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isButtonDisabled, setButtonDisabled] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const mounted = useIsMounted();
    const { t } = useTranslation();

    const handleInputChange = (value: string) => {
        setComment(value);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            toast.error('Please select a valid image file');
            return;
        }

        setSelectedFile(file);
        const objectUrl = URL.createObjectURL(file);
        setPreviewUrl(objectUrl);
    };

    const handleRemoveFile = () => {
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setButtonDisabled(true);
        try {
            if (comment.trim() === '') {
                toast.error('Comment cannot be empty');
                return;
            }

            let uploadedImageSrc: string | null = null;

            if (selectedFile) {
                setIsUploading(true);
                try {
                    const compressedFile = await compressImage(selectedFile);
                    const response = await axios.post('/api/upload/r2', {
                        filename: compressedFile.name,
                        contentType: compressedFile.type,
                    });

                    const { uploadUrl, publicUrl } = response.data;

                    if (uploadUrl) {
                        await axios.put(uploadUrl, compressedFile, {
                            headers: {
                                'Content-Type': compressedFile.type,
                            },
                        });
                    }
                    uploadedImageSrc = publicUrl;
                } catch (err: unknown) {
                    console.error('Failed to upload image', err);
                    toast.error('Failed to upload photo proof');
                    return;
                } finally {
                    setIsUploading(false);
                }
            }

            onCreateComment(comment, rating, isCooked, uploadedImageSrc);

            setComment('');
            setRating(null);
            setShowRating(false);
            setIsCooked(false);
            handleRemoveFile();
        } finally {
            setButtonDisabled(false);
        }
    };

    const isSubmitting = isLoading || isUploading || isButtonDisabled;

    return (
        <div className="mb-6 flex items-start gap-3">
            <div className="mt-1 shrink-0">
                <Avatar
                    src={userImage}
                    quality="auto:eco"
                />
            </div>

            <form
                onSubmit={handleSubmit}
                className="min-w-0 grow"
            >
                <div className="rounded-xl border border-neutral-200 bg-transparent p-3 transition-colors focus-within:border-neutral-300 dark:border-neutral-700 dark:focus:border-neutral-600">
                    {/* Textarea Area */}
                    <div className="relative">
                        <MentionInput
                            value={comment}
                            onChange={handleInputChange}
                            placeholder={
                                mounted
                                    ? String(
                                          t('write_comment') ||
                                              'Write a comment...'
                                      )
                                    : 'write_comment'
                            }
                            className="min-h-[38px] w-full resize-none overflow-y-auto border-0 bg-transparent p-0 text-sm text-neutral-900 placeholder:text-neutral-400 focus:ring-0 focus:outline-hidden dark:text-neutral-100 dark:placeholder:text-neutral-500"
                            disabled={isSubmitting}
                            maxLength={COMMENT_MAX_LENGTH}
                            dataCy="comment-input"
                        />
                        <div
                            className={`absolute right-2 bottom-2 text-xs transition-opacity duration-200 ${
                                comment.length >=
                                COMMENT_MAX_LENGTH *
                                    CHAR_COUNT_WARNING_THRESHOLD
                                    ? 'text-neutral-500 opacity-100 dark:text-neutral-400'
                                    : 'opacity-0'
                            }`}
                        >
                            {comment.length}/{COMMENT_MAX_LENGTH}
                        </div>
                    </div>

                    {/* Photo Preview Attachment */}
                    {previewUrl && (
                        <div className="mt-2.5 inline-block">
                            <div className="relative overflow-hidden rounded-lg border border-neutral-200 dark:border-neutral-700">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                    src={previewUrl}
                                    alt="Remake preview"
                                    className="h-16 w-16 object-cover"
                                    data-testid="photo-preview"
                                />
                                <button
                                    type="button"
                                    onClick={handleRemoveFile}
                                    aria-label="Remove photo"
                                    data-testid="remove-photo"
                                    className="absolute top-1 right-1 flex size-4 cursor-pointer items-center justify-center rounded-full bg-rose-500 text-white transition hover:bg-rose-600"
                                >
                                    <HiX size={10} />
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Collapsible Star Rating Container */}
                    <div
                        className={`overflow-hidden transition-all duration-200 ${
                            showRating || rating !== null
                                ? 'mt-2 max-h-12 border-t border-neutral-200/60 pt-2 opacity-100 dark:border-neutral-700/60'
                                : 'pointer-events-none max-h-0 opacity-0'
                        }`}
                    >
                        <div className="flex items-center gap-1.5">
                            <StarRating
                                rating={rating || 0}
                                interactive
                                onChange={setRating}
                                size={16}
                            />
                            {rating !== null && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        setRating(null);
                                        setShowRating(false);
                                    }}
                                    className="flex cursor-pointer items-center justify-center rounded-full p-0.5 text-neutral-400 hover:text-rose-500 dark:hover:text-rose-400"
                                    data-testid="clear-rating"
                                    aria-label={
                                        mounted
                                            ? String(
                                                  t('clear_rating') ||
                                                      'Clear rating'
                                              )
                                            : 'Clear rating'
                                    }
                                >
                                    <FiTrash size={12} />
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Bottom Action Bar */}
                    <div className="mt-3 flex items-center justify-between border-t border-neutral-200/70 pt-2.5 dark:border-neutral-700/70">
                        {/* Action Options (Rate, Cooked & Photo) */}
                        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                            {/* Toggle Star Rating Button (Icon-only on < md, Text on >= md) */}
                            <button
                                type="button"
                                onClick={() => setShowRating((prev) => !prev)}
                                className={`flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition select-none ${
                                    rating !== null || showRating
                                        ? 'bg-amber-400/20 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                                }`}
                                data-testid="rate-toggle-btn"
                                title={
                                    mounted
                                        ? String(
                                              t('rate') && t('rate') !== 'rate'
                                                  ? t('rate')
                                                  : 'Rate'
                                          )
                                        : 'Rate'
                                }
                            >
                                <span className="text-amber-500">⭐</span>
                                <span className="hidden md:inline">
                                    {mounted
                                        ? String(
                                              t('rate') && t('rate') !== 'rate'
                                                  ? t('rate')
                                                  : 'Rate'
                                          )
                                        : 'Rate'}
                                </span>
                            </button>

                            {/* "I Cooked This! 🥑" Toggle (Short text on < md, Full text on >= md) */}
                            <label
                                className={`flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition select-none ${
                                    isCooked
                                        ? 'bg-green-450/20 dark:bg-green-450/10 text-green-800 dark:text-green-300'
                                        : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                                }`}
                                data-testid="cooked-toggle-label"
                                title={
                                    mounted
                                        ? String(
                                              t('i_cooked_this') &&
                                                  t('i_cooked_this') !==
                                                      'i_cooked_this'
                                                  ? t('i_cooked_this')
                                                  : 'I Cooked This!'
                                          )
                                        : 'I Cooked This!'
                                }
                            >
                                <input
                                    type="checkbox"
                                    checked={isCooked}
                                    onChange={(e) =>
                                        setIsCooked(e.target.checked)
                                    }
                                    className="sr-only"
                                    data-testid="cooked-toggle"
                                    data-cy="cooked-toggle"
                                />
                                <span>🥑</span>
                                <span className="md:hidden">
                                    {mounted
                                        ? String(
                                              t('cooked_short') &&
                                                  t('cooked_short') !==
                                                      'cooked_short'
                                                  ? t('cooked_short')
                                                  : 'Cooked'
                                          )
                                        : 'Cooked'}
                                </span>
                                <span className="hidden md:inline">
                                    {mounted
                                        ? String(
                                              t('i_cooked_this') &&
                                                  t('i_cooked_this') !==
                                                      'i_cooked_this'
                                                  ? t('i_cooked_this')
                                                  : 'I Cooked This!'
                                          )
                                        : 'I Cooked This!'}
                                </span>
                            </label>

                            {/* Image Upload Button (Icon-only on < md, Text on >= md) */}
                            <div>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="cooked-photo-input"
                                    data-testid="cooked-photo-input"
                                    data-cy="cooked-photo-input"
                                />
                                <label
                                    htmlFor="cooked-photo-input"
                                    className={`flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold transition select-none ${
                                        selectedFile
                                            ? 'bg-green-450/20 dark:bg-green-450/10 text-green-800 dark:text-green-300'
                                            : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:bg-neutral-700'
                                    }`}
                                    title={
                                        mounted
                                            ? String(
                                                  t('add_photo') &&
                                                      t('add_photo') !==
                                                          'add_photo'
                                                      ? t('add_photo')
                                                      : 'Add photo'
                                              )
                                            : 'Add photo'
                                    }
                                >
                                    <HiOutlineCamera size={14} />
                                    <span className="hidden md:inline">
                                        {mounted
                                            ? String(
                                                  t('add_photo') &&
                                                      t('add_photo') !==
                                                          'add_photo'
                                                      ? t('add_photo')
                                                      : 'Add photo'
                                              )
                                            : 'Add photo'}
                                    </span>
                                </label>
                            </div>
                        </div>

                        {/* Submit Action Button */}
                        <button
                            type="submit"
                            data-testid="submit-comment"
                            disabled={isSubmitting || comment.trim() === ''}
                            className={`bg-green-450 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-green-950 transition hover:opacity-90 md:px-4 ${
                                isSubmitting || comment.trim() === ''
                                    ? 'cursor-not-allowed opacity-50'
                                    : 'cursor-pointer'
                            }`}
                            data-cy="submit-comment"
                            aria-label={
                                mounted
                                    ? String(
                                          t('submit_comment') ||
                                              'Submit comment'
                                      )
                                    : 'Submit comment'
                            }
                        >
                            <span className="hidden whitespace-nowrap md:inline">
                                {mounted
                                    ? String(
                                          t('submit_comment') &&
                                              t('submit_comment') !==
                                                  'submit_comment'
                                              ? t('submit_comment')
                                              : 'Submit'
                                      )
                                    : 'Submit'}
                            </span>
                            <HiOutlinePaperAirplane
                                size={13}
                                className="rotate-90"
                            />
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CommentBox;
export { CommentBox as CommentForm };
