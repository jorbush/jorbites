'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import VerificationBadge from '@/app/components/VerificationBadge';
import useIsMounted from '@/app/hooks/useIsMounted';
import CookedBadge from './CookedBadge';

export interface CommentHeaderProps {
    userName: string;
    verified?: boolean;
    userLevel?: number;
    isCooked?: boolean;
    onNavigateToProfile: () => void;
}

const CommentHeader: React.FC<CommentHeaderProps> = ({
    userName,
    verified,
    userLevel,
    isCooked,
    onNavigateToProfile,
}) => {
    const mounted = useIsMounted();
    const { t } = useTranslation();

    const levelText = mounted
        ? `${t('level')} ${userLevel}`
        : `level ${userLevel}`;

    return (
        <div className="mb-1 flex flex-wrap items-center gap-2">
            <button
                type="button"
                className="hover:text-green-450 dark:hover:text-green-450 cursor-pointer truncate border-0 bg-transparent p-0 text-left font-bold text-neutral-800 transition-colors duration-200 dark:text-neutral-100"
                onClick={onNavigateToProfile}
            >
                {userName}
            </button>
            {verified && <VerificationBadge className="text-green-450" />}
            <span className="border-green-450/30 bg-green-450/15 dark:text-green-450 rounded-full border px-2 py-0.5 text-xs font-semibold text-neutral-800">
                {levelText}
            </span>
            {Boolean(isCooked) && <CookedBadge />}
        </div>
    );
};

export default CommentHeader;
