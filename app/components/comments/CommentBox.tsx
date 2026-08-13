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
        if (comment.trim() === '') {
            toast.error('Comment cannot be empty');
            setButtonDisabled(false);
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
                setIsUploading(false);
                setButtonDisabled(false);
                return;
            }
            setIsUploading(false);
        }

        onCreateComment(comment, rating, isCooked, uploadedImageSrc);

        setComment('');
        setRating(null);
        setIsCooked(false);
        handleRemoveFile();
        setButtonDisabled(false);
    };

    const isSubmitting = isLoading || isUploading || isButtonDisabled;

    return (
        <div className="mb-4 flex items-start">
            <div className="mt-4 mr-4 mb-4 shrink-0">
                <Avatar
                    src={userImage}
                    quality="auto:eco"
                />
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-2 grow"
            >
                <div className="relative">
                    <MentionInput
                        value={comment}
                        onChange={handleInputChange}
                        placeholder={
                            mounted
                                ? (t('write_comment') ?? 'Write a comment...')
                                : 'write_comment'
                        }
                        className="h-12 w-full resize-none rounded-md border border-neutral-100 bg-neutral-100 p-2 font-light text-neutral-900 focus:ring-0 focus:outline-hidden dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                        disabled={isSubmitting}
                        maxLength={COMMENT_MAX_LENGTH}
                        dataCy="comment-input"
                    />
                    <div
                        className={`absolute right-2 bottom-2 text-xs transition-opacity duration-200 ${
                            comment.length >=
                            COMMENT_MAX_LENGTH * CHAR_COUNT_WARNING_THRESHOLD
                                ? 'text-neutral-500 opacity-100 dark:text-neutral-400'
                                : 'opacity-0'
                        }`}
                    >
                        {comment.length}/{COMMENT_MAX_LENGTH}
                    </div>
                </div>

                {previewUrl && (
                    <div className="relative mt-2 inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={previewUrl}
                            alt="Remake preview"
                            className="h-20 w-20 rounded-md border border-neutral-300 object-cover dark:border-neutral-700"
                            data-testid="photo-preview"
                        />
                        <button
                            type="button"
                            onClick={handleRemoveFile}
                            aria-label="Remove photo"
                            data-testid="remove-photo"
                            className="absolute -top-2 -right-2 flex size-6 cursor-pointer items-center justify-center rounded-full bg-rose-500 text-white shadow-xs transition hover:bg-rose-600"
                        >
                            <HiX size={14} />
                        </button>
                    </div>
                )}

                <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-4">
                        <StarRating
                            rating={rating || 0}
                            interactive
                            onChange={setRating}
                            size={18}
                        />
                        <div className="flex size-6 shrink-0 items-center justify-center">
                            {rating !== null && (
                                <button
                                    type="button"
                                    onClick={() => setRating(null)}
                                    className="flex cursor-pointer items-center justify-center rounded-full p-1 text-neutral-500 transition hover:bg-neutral-200 hover:text-rose-500 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-rose-400"
                                    data-testid="clear-rating"
                                    aria-label={
                                        mounted
                                            ? `${t('clear_rating')}`
                                            : 'Clear rating'
                                    }
                                >
                                    <FiTrash size={16} />
                                </button>
                            )}
                        </div>

                        {/* "I Cooked This! 🥑" Toggle */}
                        <label
                            className="flex cursor-pointer items-center gap-2 text-sm font-medium text-neutral-700 dark:text-neutral-200"
                            data-testid="cooked-toggle-label"
                        >
                            <input
                                type="checkbox"
                                checked={isCooked}
                                onChange={(e) => setIsCooked(e.target.checked)}
                                className="size-4 cursor-pointer rounded border-neutral-300 text-emerald-600 focus:ring-emerald-500 dark:border-neutral-600"
                                data-testid="cooked-toggle"
                                data-cy="cooked-toggle"
                            />
                            <span>
                                {mounted
                                    ? t('i_cooked_this') || 'I Cooked This! 🥑'
                                    : 'I Cooked This! 🥑'}
                            </span>
                        </label>

                        {/* Image Upload Button */}
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
                                className="flex cursor-pointer items-center gap-1 text-xs font-semibold text-neutral-600 hover:text-emerald-600 dark:text-neutral-400 dark:hover:text-emerald-400"
                                title="Attach photo proof"
                            >
                                <HiOutlineCamera size={18} />
                                <span>
                                    {mounted
                                        ? t('add_photo') || 'Add photo'
                                        : 'Add photo'}
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                <button
                    type="submit"
                    data-testid="submit-comment"
                    disabled={isSubmitting || comment.trim() === ''}
                    className={`text-green-450 mt-4 mb-4 ml-4 ${isSubmitting || comment.trim() === '' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                    data-cy="submit-comment"
                    aria-label={
                        mounted ? `${t('submit_comment')}` : 'Submit comment'
                    }
                >
                    <HiOutlinePaperAirplane size={20} />
                </button>
            </form>
        </div>
    );
};

export default CommentBox;
export { CommentBox as CommentForm };
