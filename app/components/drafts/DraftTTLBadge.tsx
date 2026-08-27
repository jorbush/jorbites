'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { DraftTTLInfo } from '@/app/types/draft';

interface DraftTTLBadgeProps {
    ttlInfo: DraftTTLInfo;
}

export function formatTTLText(
    ttlInfo: DraftTTLInfo,
    t: (key: string, options?: any) => string
): string {
    if (ttlInfo.remainingSeconds === 0 || ttlInfo.key === 'draft_expired') {
        return t('draft_expired', { defaultValue: 'Expired' });
    }
    if (ttlInfo.remainingSeconds === null) {
        return t('draft_no_expiry', { defaultValue: 'No expiry' });
    }
    if (ttlInfo.key && ttlInfo.count !== undefined) {
        const timeText = t(ttlInfo.key, {
            count: ttlInfo.count,
            defaultValue: `${ttlInfo.count} ${ttlInfo.key.replace('draft_time_', '')}`,
        });
        return t('draft_expires_in', {
            time: timeText,
            defaultValue: `Expires in ${timeText}`,
        });
    }
    return ttlInfo.label;
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
