'use client';

import useSWR from 'swr';
import { useTranslation } from 'react-i18next';
import { axiosFetcher } from '@/app/utils/fetcher';
import useRecipeModal from '@/app/hooks/useRecipeModal';
import { SafeUser } from '@/app/types';
import { SHARED_DRAFT_POLL_INTERVAL_MS } from '@/app/utils/constants';

interface SharedDraftBannerProps {
    currentUser?: SafeUser | null;
}

export default function SharedDraftBanner({
    currentUser,
}: SharedDraftBannerProps) {
    const { t } = useTranslation();
    const recipeModal = useRecipeModal();

    const { data: activeDrafts } = useSWR<any[]>(
        currentUser ? '/api/draft/active' : null,
        axiosFetcher,
        { refreshInterval: SHARED_DRAFT_POLL_INTERVAL_MS }
    );

    if (!currentUser || !activeDrafts || activeDrafts.length === 0) {
        return null;
    }

    const draft = activeDrafts[0];
    const title = draft.title || t('untitled_recipe') || 'Untitled Recipe';
    const ownerName = draft.ownerName || t('a_co_cook') || 'a co-cook';

    return (
        <div
            data-testid="shared-draft-banner"
            className="border-green-450/30 bg-green-450/10 dark:border-green-450/20 dark:bg-green-450/10 flex w-full items-center justify-between border-b px-4 py-2 text-xs text-neutral-900 transition sm:text-sm dark:text-neutral-100"
        >
            <div className="flex items-center gap-2 truncate">
                <span className="text-base">🥑</span>
                <span className="truncate">
                    {t('shared_draft_banner_text', {
                        title,
                        ownerName,
                    }) || `You're co-cooking "${title}" with @${ownerName}!`}
                </span>
            </div>
            <button
                type="button"
                onClick={() => recipeModal.onOpenSharedDraft(draft.draftId)}
                className="bg-green-450 dark:bg-green-450 ml-3 shrink-0 rounded-md px-3 py-1 text-xs font-semibold text-green-950 transition hover:opacity-90 dark:text-green-950"
            >
                {t('open_draft') || 'Open Draft'}
            </button>
        </div>
    );
}
