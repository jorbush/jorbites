'use client';

import React, { useState } from 'react';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import Avatar from '@/app/components/utils/Avatar';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

/* eslint-disable unused-imports/no-unused-vars */
interface CommentBoxProps {
    userImage: string | undefined | null;
    onCreateComment: (comment: string) => void;
    isLoading?: boolean;
}

const CommentBox: React.FC<CommentBoxProps> = ({
    userImage,
    onCreateComment,
    isLoading = false,
}) => {
    const [comment, setComment] = useState('');
    const [isButtonDisabled, setButtonDisabled] = useState(false);
    const { t } = useTranslation();

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setButtonDisabled(true);
        if (comment.trim() === '') {
            toast.error('Comment cannot be empty');
            setButtonDisabled(false);
            return;
        }

        onCreateComment(comment);

        // Only reset comment if not using external loading state
        if (!isLoading) {
            await new Promise((resolve) => setTimeout(resolve, 2000));
            setComment('');
            setButtonDisabled(false);
        } else {
            // When using external loading state, we'll reset when isLoading becomes false
            if (!isLoading) {
                setComment('');
                setButtonDisabled(false);
            }
        }
    };

    // Reset button state when loading finishes
    React.useEffect(() => {
        if (!isLoading && isButtonDisabled) {
            setComment('');
            setButtonDisabled(false);
        }
    }, [isLoading, isButtonDisabled]);

    return (
        <div className="mb-4 flex items-center">
            <div className="mt-4 mr-4 mb-4">
                <Avatar src={userImage} />
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-2 grow"
            >
                <textarea
                    className="h-11 w-full resize-none rounded-md border border-gray-100 bg-gray-100 p-2 font-light text-zinc-900 focus:ring-0 focus:outline-hidden dark:border-neutral-600 dark:bg-zinc-800 dark:text-zinc-100"
                    placeholder={t('write_comment') ?? 'Write a comment...'}
                    value={comment}
                    onChange={handleInputChange}
                    data-cy="comment-input"
                    disabled={isLoading || isButtonDisabled}
                />
            </form>

            <button
                type="submit"
                data-testid="submit-comment"
                onClick={handleSubmit}
                disabled={isLoading || isButtonDisabled}
                className={`text-green-450 mt-4 mb-4 ml-4 ${
                    isLoading || isButtonDisabled
                        ? 'cursor-not-allowed opacity-50'
                        : ''
                }`}
                data-cy="submit-comment"
            >
                <HiOutlinePaperAirplane size={20} />
            </button>
        </div>
    );
};

export default CommentBox;
