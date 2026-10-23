'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlinePaperAirplane, HiOutlineCamera } from 'react-icons/hi';
import useIsMounted from '@/app/hooks/useIsMounted';

export interface CommentActionBarProps {
    rating: number | null;
    showRating: boolean;
    onToggleRating: () => void;
    isCooked?: boolean;
    onToggleCooked?: (isCooked: boolean) => void;
    selectedFile: File | null;
    onFileSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
    fileInputRef: React.RefObject<HTMLInputElement | null>;
    isSubmitting: boolean;
    commentEmpty: boolean;
}

const CommentActionBar: React.FC<CommentActionBarProps> = ({
    rating,
    showRating,
    onToggleRating,
    selectedFile,
    onFileSelect,
    fileInputRef,
    isSubmitting,
    commentEmpty,
}) => {
    const mounted = useIsMounted();
    const { t } = useTranslation();

    return (
        <div className="mt-3 flex items-center justify-between border-t border-neutral-200/70 pt-2.5 dark:border-neutral-700/70">
            {/* Action Options (Rate & Photo) */}
            <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                {/* Toggle Star Rating Button (Icon-only on < md, Text on >= md) */}
                <button
                    type="button"
                    onClick={onToggleRating}
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

                {/* Image Upload Button (Icon-only on < md, Text on >= md) */}
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
                        aria-label={
                            mounted
                                ? String(
                                      t('add_photo') &&
                                          t('add_photo') !== 'add_photo'
                                          ? t('add_photo')
                                          : 'Add photo'
                                  )
                                : 'Add photo'
                        }
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
                                          t('add_photo') !== 'add_photo'
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
                                          t('add_photo') !== 'add_photo'
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
                disabled={isSubmitting || commentEmpty}
                className={`bg-green-450 flex items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-green-950 transition hover:opacity-90 md:px-4 ${
                    isSubmitting || commentEmpty
                        ? 'cursor-not-allowed opacity-50'
                        : 'cursor-pointer'
                }`}
                data-cy="submit-comment"
                aria-label={
                    mounted
                        ? String(t('submit_comment') || 'Submit comment')
                        : 'Submit comment'
                }
            >
                <span className="hidden whitespace-nowrap md:inline">
                    {mounted
                        ? String(
                              t('submit_comment') &&
                                  t('submit_comment') !== 'submit_comment'
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
    );
};

export default CommentActionBar;
