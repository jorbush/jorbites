'use client';

import React from 'react';
import { formatText } from '@/app/utils/textFormatting';

export interface CommentBodyProps {
    content: React.ReactNode;
}

const CommentBody: React.FC<CommentBodyProps> = ({ content }) => {
    return (
        <div className="text-justify break-words whitespace-normal text-neutral-800 dark:text-neutral-100">
            <p
                className="text-justify break-words whitespace-normal text-neutral-800 dark:text-neutral-100"
                data-cy="comment-text"
            >
                {typeof content === 'string' ? formatText(content) : content}
            </p>
        </div>
    );
};

export default CommentBody;
