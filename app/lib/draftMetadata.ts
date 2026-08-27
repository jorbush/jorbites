import { DraftSummary, DraftTTLInfo, DraftProgress } from '@/app/types/draft';
import {
    DRAFT_TTL_SECONDS,
    SOLO_DRAFT_TTL_SECONDS,
} from '@/app/utils/constants';

/**
 * Generates a human-readable title for a draft based on its current content.
 *
 * @param draft - The draft summary to generate a title for
 * @returns A string representing the draft title
 */
export function generateDraftTitle(draft: DraftSummary): string {
    if (draft.title && draft.title.trim() !== '') {
        return draft.title;
    }

    if (draft.categories && draft.categories.length > 0) {
        const category = draft.categories[0];
        const capitalizedCategory =
            category.charAt(0).toUpperCase() + category.slice(1);
        return `Untitled — ${capitalizedCategory}`;
    }

    if (draft.ingredients && draft.ingredients.length > 0) {
        return `Untitled — ${draft.ingredients.length} ingredients`;
    }

    if (draft.method && draft.method.trim() !== '') {
        const capitalizedMethod =
            draft.method.charAt(0).toUpperCase() + draft.method.slice(1);
        const truncatedMethod =
            capitalizedMethod.length > 20
                ? capitalizedMethod.substring(0, 20)
                : capitalizedMethod;
        return `Untitled — ${truncatedMethod}`;
    }

    return 'Untitled draft';
}

/**
 * Calculates the TTL (Time To Live) information for a draft.
 *
 * @param updatedAt - ISO string of when the draft was last updated
 * @param type - Whether the draft is 'solo' or 'shared'
 * @returns TTL info object including a human-readable label and expiry status
 */
export function getDraftTTLInfo(
    updatedAt?: string | null,
    type: 'solo' | 'shared' = 'solo'
): DraftTTLInfo {
    const fallbackDateStr = updatedAt || new Date().toISOString();
    const updatedDate = new Date(fallbackDateStr);
    const timestamp = updatedDate.getTime();
    const now = new Date();

    const elapsedSeconds = isNaN(timestamp)
        ? 0
        : Math.max(0, Math.floor((now.getTime() - timestamp) / 1000));

    const ttl = type === 'shared' ? DRAFT_TTL_SECONDS : SOLO_DRAFT_TTL_SECONDS;
    const remainingSeconds = Math.max(0, ttl - elapsedSeconds);

    if (remainingSeconds <= 0) {
        return {
            label: 'Expired',
            isExpiringSoon: true,
            remainingSeconds: 0,
            key: 'draft_expired',
        };
    }

    if (remainingSeconds < 3600) {
        const minutes = Math.max(1, Math.floor(remainingSeconds / 60));
        return {
            label: `Expires in ${minutes} minute${minutes !== 1 ? 's' : ''}`,
            isExpiringSoon: true,
            remainingSeconds,
            key: 'draft_time_minutes',
            count: minutes,
        };
    }

    if (remainingSeconds < 86400) {
        const hours = Math.floor(remainingSeconds / 3600);
        return {
            label: `Expires in ${hours} hour${hours !== 1 ? 's' : ''}`,
            isExpiringSoon: true,
            remainingSeconds,
            key: 'draft_time_hours',
            count: hours,
        };
    }

    if (remainingSeconds < 604800) {
        const days = Math.floor(remainingSeconds / 86400);
        return {
            label: `Expires in ${days} day${days !== 1 ? 's' : ''}`,
            isExpiringSoon: false,
            remainingSeconds,
            key: 'draft_time_days',
            count: days,
        };
    }

    const weeks = Math.floor(remainingSeconds / 604800);
    return {
        label: `Expires in ${weeks} week${weeks !== 1 ? 's' : ''}`,
        isExpiringSoon: false,
        remainingSeconds,
        key: 'draft_time_weeks',
        count: weeks,
    };
}

/**
 * Calculates the step completion progress for a draft wizard.
 *
 * @param draft - The draft summary to evaluate
 * @returns Progress object with completed steps count, percentage, and per-step details
 */
export function getDraftProgress(draft: DraftSummary): DraftProgress {
    const stepDetails = [
        {
            step: 0,
            name: 'Category',
            completed: !!(draft.categories && draft.categories.length > 0),
        },
        {
            step: 1,
            name: 'Description',
            completed: !!(draft.title && draft.title.trim() !== ''),
        },
        {
            step: 2,
            name: 'Ingredients',
            completed: !!(draft.ingredients && draft.ingredients.length > 0),
        },
        {
            step: 3,
            name: 'Method',
            completed: !!(draft.method && draft.method.trim() !== ''),
        },
        {
            step: 4,
            name: 'Steps',
            completed: !!(draft.steps && draft.steps.length > 0),
        },
        { step: 5, name: 'Related', completed: true },
        {
            step: 6,
            name: 'Images',
            completed: !!(draft.imageSrc && draft.imageSrc.trim() !== ''),
        },
    ];

    const completedSteps = stepDetails.filter((s) => s.completed).length;
    const totalSteps = 7;
    const percentage = Math.round((completedSteps / totalSteps) * 100);

    return {
        completedSteps,
        totalSteps,
        percentage,
        stepDetails,
    };
}

/**
 * Formats the human-readable text for a draft's remaining TTL using i18n translation functions.
 *
 * @param ttlInfo - The calculated TTL information
 * @param t - The translation function
 * @returns Localized string describing TTL status
 */
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
