'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import Avatar from '@/app/components/Avatar';
import { MdDelete } from 'react-icons/md';
import ConfirmModal from '@/app/components/modals/ConfirmModal';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import VerificationBadge from '@/app/components/VerificationBadge';

interface CommentProps {
    userId: string;
    userImage: string | undefined | null;
    comment: string;
    createdAt: string;
    userName: string;
    canDelete?: boolean;
    verified?: boolean;
    commentId: string;
    userLevel: number;
}

const Comment: React.FC<CommentProps> = ({
    userId,
    userImage,
    comment,
    createdAt,
    userName,
    canDelete,
    verified,
    commentId,
    userLevel,
}) => {
    const formattedDate = format(new Date(createdAt), 'dd/MM/yyyy HH:mm');
    const words = comment.split(' ');
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const router = useRouter();
    const { t } = useTranslation();

    const isLongWord = words.some((word) => word.length > 20);

    const deleteComment = () => {
        axios
            .delete(`/api/comments/${commentId}`)
            .then(() => {
                toast.success(t('comment_deleted'));
                router.refresh();
            })
            .catch(() => {
                toast.error(t('something_went_wrong'));
            })
            .finally(() => {});
    };

    const renderFormattedComment = (text: string) => {
        // Split text into elements: normal text, bold, italic, and links
        const segments: React.ReactNode[] = [];
        let remainingText = text;

        // Regex patterns to detect formatting
        const patterns = [
            // Links - convert URLs to clickable anchors
            {
                regex: /(https?:\/\/[^\s]+)/g,
                render: (match: string) => (
                    <a
                        href={match}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-green-450 hover:underline"
                    >
                        {match}
                    </a>
                ),
            },
            // Bold text with ** markers
            {
                regex: /\*\*(.*?)\*\*/g,
                render: (match: string, content: string) => (
                    <strong>{content}</strong>
                ),
            },
            // Bold text with __ markers
            {
                regex: /__(.*?)__/g,
                render: (match: string, content: string) => (
                    <strong>{content}</strong>
                ),
            },
            // Italic text with * markers
            {
                regex: /\*(.*?)\*/g,
                render: (match: string, content: string) => <em>{content}</em>,
            },
            // Italic text with _ markers
            {
                regex: /_(.*?)_/g,
                render: (match: string, content: string) => <em>{content}</em>,
            },
        ];
        type PatternType = (typeof patterns)[number];

        // Find the earliest pattern match in the remaining text
        const findNextPattern = () => {
            let earliest: {
                index: number;
                pattern: PatternType | null;
                match: RegExpExecArray | null;
            } = {
                index: remainingText.length,
                pattern: null,
                match: null,
            };

            for (const pattern of patterns) {
                pattern.regex.lastIndex = 0; // Reset regex index
                const match = pattern.regex.exec(remainingText);
                if (match && match.index < earliest.index) {
                    earliest = {
                        index: match.index,
                        pattern,
                        match,
                    };
                }
            }

            return earliest;
        };

        // Process text by finding and replacing patterns sequentially
        while (remainingText.length > 0) {
            const { index, pattern, match } = findNextPattern();
            if (pattern && match) {
                // Add any plain text before the pattern
                if (index > 0) {
                    segments.push(remainingText.substring(0, index));
                }
                // Render the matched pattern differently based on type
                if (pattern.regex.source.includes('https?')) {
                    segments.push(pattern.render(match[0], ''));
                } else {
                    segments.push(pattern.render(match[0], match[1]));
                }
                // Continue with remaining text after this match
                remainingText = remainingText.substring(
                    index + match[0].length
                );
            } else {
                // No more patterns found, add remaining text as is
                segments.push(remainingText);
                break;
            }
        }

        return (
            <React.Fragment>
                {segments.map((segment, index) => (
                    <React.Fragment key={index}>{segment}</React.Fragment>
                ))}
            </React.Fragment>
        );
    };

    return (
        <div className="relative mb-2 ml-1 mr-1 mt-2 flex items-start">
            <div className="mt-2 flex-shrink-0">
                <Avatar
                    src={userImage}
                    onClick={() => router.push('/profile/' + userId)}
                />
            </div>
            <div className="ml-4 mt-2 flex-grow">
                <div className="flex flex-row">
                    <p
                        className={`cursor-pointer truncate whitespace-normal text-justify font-bold text-gray-800 dark:text-neutral-100 ${
                            isLongWord ? 'break-all' : ''
                        }`}
                        onClick={() => router.push('/profile/' + userId)}
                    >
                        {userName}
                    </p>
                    {verified && <VerificationBadge className="ml-1 mt-1" />}
                    <div className="ml-1.5 mt-0.5 text-sm text-gray-400">{`${t('level')} ${userLevel}`}</div>
                </div>
                <p
                    className={`truncate whitespace-normal text-justify text-gray-800 dark:text-neutral-100 ${
                        isLongWord ? 'break-all' : ''
                    }`}
                    data-cy="comment-text"
                >
                    {renderFormattedComment(comment)}
                </p>
                <div className="flex flex-col items-end text-sm text-gray-400">
                    {formattedDate}
                </div>
                {canDelete && (
                    <MdDelete
                        size={20}
                        className="absolute right-1 top-2 text-rose-500"
                        onClick={() => setConfirmModalOpen(true)}
                        data-testid="MdDelete"
                    />
                )}
                <ConfirmModal
                    open={confirmModalOpen}
                    setIsOpen={setConfirmModalOpen}
                    onConfirm={deleteComment}
                />
            </div>
        </div>
    );
};

export default Comment;
