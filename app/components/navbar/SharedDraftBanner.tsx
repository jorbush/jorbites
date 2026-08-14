'use client';

import useSWR from 'swr';
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
    const title = draft.title || 'Untitled Recipe';
    const ownerName = draft.ownerName || 'a co-cook';

    return (
        <div
            data-testid="shared-draft-banner"
            className="flex w-full items-center justify-between border-b border-emerald-200 bg-emerald-50 px-4 py-2 text-xs text-emerald-800 transition sm:text-sm dark:border-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-200"
        >
            <div className="flex items-center gap-2 truncate">
                <span className="text-base">🥑</span>
                <span className="truncate">
                    You're co-cooking <strong>"{title}"</strong> with @
                    {ownerName}!
                </span>
            </div>
            <button
                type="button"
                onClick={() => recipeModal.onOpenSharedDraft(draft.draftId)}
                className="ml-3 shrink-0 rounded-md bg-emerald-600 px-3 py-1 text-xs font-semibold text-white transition hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600"
            >
                Open Draft
            </button>
        </div>
    );
}
