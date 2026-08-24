'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import MentionInput from '@/app/components/inputs/MentionInput';
import {
    COMMENT_MAX_LENGTH,
    CHAR_COUNT_WARNING_THRESHOLD,
} from '@/app/utils/constants';
import useIsMounted from '@/app/hooks/useIsMounted';

export interface CommentInputProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    maxLength?: number;
}

const CommentInput: React.FC<CommentInputProps> = ({
    value,
    onChange,
    disabled = false,
    placeholder,
    maxLength = COMMENT_MAX_LENGTH,
}) => {
    const mounted = useIsMounted();
    const { t } = useTranslation();

    const defaultPlaceholder = mounted
        ? String(t('write_comment') || 'Write a comment...')
        : 'write_comment';

    return (
        <div className="relative">
            <MentionInput
                value={value}
                onChange={onChange}
                placeholder={placeholder || defaultPlaceholder}
                className="min-h-[38px] w-full resize-none overflow-y-auto border-0 bg-transparent p-0 text-base text-neutral-900 placeholder:text-neutral-400 focus:ring-0 focus:outline-hidden md:text-sm dark:text-neutral-100 dark:placeholder:text-neutral-500"
                disabled={disabled}
                maxLength={maxLength}
                dataCy="comment-input"
            />
            <div
                className={`absolute right-2 bottom-2 text-xs transition-opacity duration-200 ${
                    value.length >= maxLength * CHAR_COUNT_WARNING_THRESHOLD
                        ? 'text-neutral-500 opacity-100 dark:text-neutral-400'
                        : 'opacity-0'
                }`}
            >
                {value.length}/{maxLength}
            </div>
        </div>
    );
};

export default CommentInput;
