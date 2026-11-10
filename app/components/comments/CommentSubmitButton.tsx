'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { HiOutlinePaperAirplane } from 'react-icons/hi';
import useIsMounted from '@/app/hooks/useIsMounted';

export interface CommentSubmitButtonProps {
    isSubmitting: boolean;
    commentEmpty: boolean;
}

const CommentSubmitButton: React.FC<CommentSubmitButtonProps> = ({
    isSubmitting,
    commentEmpty,
}) => {
    const mounted = useIsMounted();
    const { t } = useTranslation();

    const isDisabled = isSubmitting || commentEmpty;
    const translatedSubmitComment = t('submit_comment');
    const ariaLabel =
        mounted && translatedSubmitComment
            ? String(translatedSubmitComment)
            : 'Submit comment';

    const label =
        mounted &&
        translatedSubmitComment &&
        translatedSubmitComment !== 'submit_comment'
            ? String(translatedSubmitComment)
            : 'Submit';

    const buttonClass = isDisabled
        ? 'cursor-not-allowed opacity-50 shadow-none'
        : 'cursor-pointer';

    return (
        <button
            type="submit"
            data-testid="submit-comment"
            data-cy="submit-comment"
            disabled={isDisabled}
            className={`border-green-450 bg-green-450 flex items-center justify-center gap-1.5 rounded-xl border px-3.5 py-1.5 text-xs font-bold text-neutral-950 shadow-2xs transition-colors duration-200 hover:brightness-95 md:px-4 ${buttonClass}`}
            aria-label={ariaLabel}
        >
            <span className="hidden whitespace-nowrap md:inline">{label}</span>
            <HiOutlinePaperAirplane
                size={13}
                className="rotate-90 text-neutral-950"
            />
        </button>
    );
};

export default CommentSubmitButton;
