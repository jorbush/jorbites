'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { DraftTTLInfo } from '@/app/types/draft';
import { formatTTLText } from '@/app/lib/draftMetadata';

interface DraftTTLBadgeProps {
    ttlInfo: DraftTTLInfo;
}

const DraftTTLBadge: React.FC<DraftTTLBadgeProps> = ({ ttlInfo }) => {
    const { t } = useTranslation();
    const text = formatTTLText(ttlInfo, t);

    return (
        <div
            data-testid="draft-ttl-badge"
            className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                ttlInfo.isExpiringSoon
                    ? 'bg-amber-50 text-amber-600 dark:bg-amber-900/20 dark:text-amber-400'
                    : 'bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-400'
            }`}
        >
            {text}
        </div>
    );
};

export default DraftTTLBadge;
