'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlinePaperAirplane, HiOutlineCamera } from 'react-icons/hi';
import { AiFillStar, AiOutlineStar } from 'react-icons/ai';
import useIsMounted from '@/app/hooks/useIsMounted';

export interface CommentActionBarProps {
    rating: number | null;
    showRating: boolean;
    onToggleRating: () => void;
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
            <div className="flex flex-wrap items-center gap-2">
                {/* Toggle Star Rating Button (Icon-only on < md, Text on >= md) */}
                <button
                    type="button"
                    onClick={onToggleRating}
                    className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors duration-200 select-none ${
                        rating !== null || showRating
                            ? 'border-amber-300/80 bg-amber-50 text-amber-700 dark:border-amber-500/30 dark:bg-amber-950/30 dark:text-amber-300'
                            : 'border-neutral-200/80 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/60'
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
                    {rating !== null || showRating ? (
                        <AiFillStar
                            size={15}
                            className="text-amber-500"
                        />
                    ) : (
                        <AiOutlineStar
                            size={15}
                            className="text-neutral-500 dark:text-neutral-400"
                        />
                    )}
                    <span className="hidden text-xs font-semibold md:inline">
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
                        className={`flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-xs font-semibold shadow-2xs transition-colors duration-200 select-none ${
                            selectedFile
                                ? 'border-green-450/40 bg-green-450/15 dark:text-green-450 text-neutral-900'
                                : 'border-neutral-200/80 bg-white text-neutral-700 hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:bg-neutral-700/60'
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
                        <HiOutlineCamera
                            size={15}
                            className={
                                selectedFile
                                    ? 'dark:text-green-450 text-neutral-900'
                                    : 'text-neutral-500 dark:text-neutral-400'
                            }
                        />
                        <span className="hidden text-xs font-semibold md:inline">
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
                className={`border-green-450 bg-green-450 flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold text-neutral-950 shadow-2xs transition-colors duration-200 hover:brightness-95 md:px-4 ${
                    isSubmitting || commentEmpty
                        ? 'cursor-not-allowed opacity-50 shadow-none'
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
                    className="rotate-90 text-neutral-950"
                />
            </button>
        </div>
    );
};

export default CommentActionBar;
