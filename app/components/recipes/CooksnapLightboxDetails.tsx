'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { SafeCooksnap } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import VerificationBadge from '@/app/components/VerificationBadge';
import StarRating from '@/app/components/utils/StarRating';
import { formatText } from '@/app/utils/textFormatting';
import { useTranslateableContent } from '@/app/hooks/useTranslateableContent';
import useIsMounted from '@/app/hooks/useIsMounted';

interface CooksnapLightboxDetailsProps {
    cooksnap: SafeCooksnap;
    onNavigateProfile?: (userId: string) => void;
}

interface AuthorProps {
    cooksnap: SafeCooksnap;
    onNavigateProfile?: (userId: string) => void;
    mounted: boolean;
    levelLabel: string;
}

const CooksnapAuthor: React.FC<AuthorProps> = ({
    cooksnap,
    onNavigateProfile,
    mounted,
    levelLabel,
}) => {
    const user = cooksnap.user;
    const authorName = user?.name || 'Jorbiter';

    if (user?.id && onNavigateProfile) {
        return (
            <button
                type="button"
                onClick={() => user.id && onNavigateProfile(user.id)}
                className="flex cursor-pointer items-center gap-2 border-0 bg-transparent p-0 text-left focus:outline-hidden"
                data-testid="cooksnap-author-link"
            >
                <Avatar
                    src={user.image}
                    size={28}
                />
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5">
                        <span className="text-sm font-semibold text-neutral-100 hover:underline">
                            {authorName}
                        </span>
                        {user.verified && <VerificationBadge size={14} />}
                    </div>
                    {user.level !== undefined && (
                        <span className="text-xs text-neutral-400">
                            {mounted
                                ? `${levelLabel} ${user.level}`
                                : `Level ${user.level}`}
                        </span>
                    )}
                </div>
            </button>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Avatar
                src={user?.image}
                size={28}
            />
            <span className="text-sm font-semibold text-neutral-100">
                {authorName}
            </span>
        </div>
    );
};

const CooksnapCommentContent: React.FC<{ comment: string }> = ({ comment }) => {
    const { displayContent, translateButtonElement } = useTranslateableContent({
        content: comment,
    });

    return (
        <div className="mt-1 flex flex-col gap-1.5 border-t border-neutral-800/60 pt-2">
            <div
                className="max-h-36 overflow-y-auto pr-1 text-sm leading-relaxed text-neutral-200"
                data-testid="cooksnap-lightbox-comment"
            >
                <p className="break-words whitespace-pre-line">
                    {typeof displayContent === 'string'
                        ? formatText(displayContent)
                        : displayContent}
                </p>
            </div>
            {translateButtonElement && (
                <div className="mt-0.5">{translateButtonElement}</div>
            )}
        </div>
    );
};

export const CooksnapLightboxDetails: React.FC<
    CooksnapLightboxDetailsProps
> = ({ cooksnap, onNavigateProfile }) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();

    const formattedDate =
        mounted && cooksnap.createdAt
            ? format(new Date(cooksnap.createdAt), 'dd/MM/yyyy')
            : '';

    return (
        <div
            className="flex flex-col gap-2"
            data-testid="cooksnap-lightbox-details"
        >
            {/* Header: Author + Rating + Date */}
            <div className="flex flex-wrap items-center justify-between gap-2">
                <CooksnapAuthor
                    cooksnap={cooksnap}
                    onNavigateProfile={onNavigateProfile}
                    mounted={mounted}
                    levelLabel={t('level', { defaultValue: 'Level' })}
                />

                <div className="flex items-center gap-2 sm:gap-3">
                    {cooksnap.rating && cooksnap.rating > 0 ? (
                        <div data-testid="cooksnap-lightbox-rating">
                            <StarRating
                                rating={cooksnap.rating}
                                size={14}
                            />
                        </div>
                    ) : null}
                    {formattedDate && (
                        <span className="text-xs text-neutral-400">
                            {formattedDate}
                        </span>
                    )}
                </div>
            </div>

            {/* Full Comment / Note */}
            {cooksnap.comment && (
                <CooksnapCommentContent comment={cooksnap.comment} />
            )}
        </div>
    );
};

export default CooksnapLightboxDetails;
