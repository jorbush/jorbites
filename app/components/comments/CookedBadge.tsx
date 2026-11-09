'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import useIsMounted from '@/app/hooks/useIsMounted';

export interface CookedBadgeProps {
    className?: string;
}

const CookedBadge: React.FC<CookedBadgeProps> = ({ className = '' }) => {
    const mounted = useIsMounted();
    const { t } = useTranslation();

    const cookedText =
        mounted && t('cooked_short') && t('cooked_short') !== 'cooked_short'
            ? String(t('cooked_short'))
            : 'Cooked';

    return (
        <span
            className={`border-green-450/40 bg-green-450/20 dark:text-green-450 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold text-neutral-800 ${className}`.trim()}
            data-testid="cooked-badge"
            data-cy="cooked-badge"
        >
            🥑 {cookedText}
        </span>
    );
};

export default CookedBadge;
