'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import { FiTrash } from 'react-icons/fi';
import { toast } from 'react-hot-toast';
import Avatar from '@/app/components/utils/Avatar';
import MentionInput from '@/app/components/inputs/MentionInput';
import StarRating from '@/app/components/utils/StarRating';
import {
    COMMENT_MAX_LENGTH,
    CHAR_COUNT_WARNING_THRESHOLD,
} from '@/app/utils/constants';

interface CommentBoxProps {
    userImage: string | undefined | null;
    onCreateComment: (comment: string, rating: number | null) => void;
    isLoading?: boolean;
}

const CommentBox: React.FC<CommentBoxProps> = ({
    userImage,
    onCreateComment,
    isLoading = false,
}) => {
    const [comment, setComment] = useState('');
    const [rating, setRating] = useState<number | null>(null);
    const [isButtonDisabled, setButtonDisabled] = useState(false);
    const [mounted, setMounted] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleInputChange = (value: string) => {
        setComment(value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setButtonDisabled(true);
        if (comment.trim() === '') {
            toast.error('Comment cannot be empty');
            setButtonDisabled(false);
            return;
        }

        onCreateComment(comment, rating);

        setComment('');
        setRating(null);
        setButtonDisabled(false);
    };

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
                                ? (t('write_comment') ?? 'Write a comment…')
                                : 'write_comment'
                        }
                        className="h-12 w-full resize-none rounded-md border border-neutral-100 bg-neutral-100 p-2 font-light text-neutral-900 focus:ring-0 focus:outline-hidden dark:border-neutral-600 dark:bg-neutral-800 dark:text-neutral-100"
                        disabled={isLoading || isButtonDisabled}
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

                <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center gap-3">
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
                    </div>
                </div>
            </form>

            <button
                type="submit"
                data-testid="submit-comment"
                onClick={handleSubmit}
                disabled={
                    isLoading || isButtonDisabled || comment.trim() === ''
                }
                className={`text-green-450 mt-4 mb-4 ml-4 ${isLoading || isButtonDisabled || comment.trim() === '' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                data-cy="submit-comment"
            >
                <HiOutlinePaperAirplane size={20} />
            </button>
        </div>
    );
};

export default CommentBox;
