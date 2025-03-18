'use client';

import React, { useState } from 'react';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import Avatar from '@/app/components/Avatar';
import { toast } from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface CommentBoxProps {
    userImage: string | undefined | null;
    onCreateComment: (comment: string) => void;
    isSubmitting?: boolean;
}

const CommentBox: React.FC<CommentBoxProps> = ({
    userImage,
    onCreateComment,
    isSubmitting = false,
}) => {
    const [comment, setComment] = useState('');
    const { t } = useTranslation();

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setComment(e.target.value);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isSubmitting) return;
        if (comment.trim() === '') {
            toast.error(t('comment_empty') || 'Comment cannot be empty');
            return;
        }
        onCreateComment(comment);
        setComment('');
    };

    return (
        <div className="mb-4 flex items-center">
            <div className="mb-4 mr-4 mt-4">
                <Avatar src={userImage} />
            </div>

            <form
                onSubmit={handleSubmit}
                className="mt-2 flex-grow"
            >
                <textarea
                    className="h-11 w-full resize-none rounded-md border border-gray-100 bg-gray-100 p-2 focus:outline-none focus:ring-0"
                    placeholder={t('write_comment') ?? 'Write a comment...'}
                    value={comment}
                    onChange={handleInputChange}
                    data-cy="comment-input"
                    disabled={isSubmitting}
                />
            </form>

            <button
                type="submit"
                data-testid="submit-comment"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`mb-4 ml-4 mt-4 text-green-450 ${
                    isSubmitting ? 'cursor-not-allowed opacity-50' : ''
                }`}
                data-cy="submit-comment"
            >
                <HiOutlinePaperAirplane size={20} />
            </button>
        </div>
    );
};

export default CommentBox;
