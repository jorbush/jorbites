'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiPlus,
    FiTrash2,
    FiCopy,
    FiCheck,
    FiRefreshCw,
    FiClock,
    FiUsers,
    FiFileText,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

interface DraftItem {
    id: string;
    title: string;
    stepsCompleted: number;
    isShared: boolean;
    isExpiringSoon: boolean;
}

interface DraftQuotaSimulatorProps {
    onInteracted?: () => void;
}

const INITIAL_DRAFTS: DraftItem[] = [
    {
        id: 'd1',
        title: "Grandma's Fresh Lasagna",
        stepsCompleted: 6,
        isShared: false,
        isExpiringSoon: false,
    },
    {
        id: 'd2',
        title: 'Creamy Lemon Risotto',
        stepsCompleted: 4,
        isShared: true,
        isExpiringSoon: false,
    },
    {
        id: 'd3',
        title: 'Matcha Soufflé Pancakes',
        stepsCompleted: 2,
        isShared: false,
        isExpiringSoon: true,
    },
];

const SAMPLE_TITLES = [
    'Artisan Sourdough Loaf',
    'Crispy Fish Tacos with Lime Slaw',
    'Rich Chocolate Lava Cake',
    'Spicy Thai Basil Noodles',
    'Roasted Vegetable Quiche',
];

export const DraftQuotaSimulator: React.FC<DraftQuotaSimulatorProps> = ({
    onInteracted,
}) => {
    const { t } = useTranslation();
    const [drafts, setDrafts] = useState<DraftItem[]>(INITIAL_DRAFTS);
    const [inviteLink, setInviteLink] = useState(
        'https://jorbites.com/recipes/draft/share?token=a8f9c2d1e03'
    );
    const [copied, setCopied] = useState(false);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (copyTimeoutRef.current) {
                clearTimeout(copyTimeoutRef.current);
            }
        };
    }, []);

    const handleAddDraft = () => {
        if (drafts.length >= 5) {
            setErrorMsg(
                t('drafts_course_details.max_slots_reached') ||
                    'Maximum 5 solo drafts reached! Delete a draft to create room.'
            );
            return;
        }

        setErrorMsg(null);
        const nextTitle = SAMPLE_TITLES[drafts.length % SAMPLE_TITLES.length];
        const newDraft: DraftItem = {
            id: `d-${Date.now()}`,
            title: nextTitle,
            stepsCompleted: Math.floor(Math.random() * 5) + 1,
            isShared: false,
            isExpiringSoon: false,
        };

        setDrafts([...drafts, newDraft]);
        toast.success(
            t('drafts_course_details.toast_draft_created', {
                title: nextTitle,
            }) || `Created new draft: ${nextTitle}`
        );
        onInteracted?.();
    };

    const handleDeleteDraft = (id: string) => {
        setDrafts(drafts.filter((d) => d.id !== id));
        setErrorMsg(null);
        toast.success(
            t('drafts_course_details.toast_draft_removed') ||
                'Draft removed! Slot freed.'
        );
        onInteracted?.();
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(inviteLink);
        setCopied(true);
        toast.success(
            t('drafts_course_details.link_copied') ||
                'Invite link copied to clipboard!'
        );
        if (copyTimeoutRef.current) {
            clearTimeout(copyTimeoutRef.current);
        }
        copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
        onInteracted?.();
    };

    const handleRegenerateLink = () => {
        const randomHex = Math.random().toString(16).substring(2, 10);
        setInviteLink(
            `https://jorbites.com/recipes/draft/share?token=${randomHex}`
        );
        toast.success(
            t('drafts_course_details.link_regenerated') ||
                'New invite link generated! The old link is now expired.'
        );
        onInteracted?.();
    };

    return (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
                        {t('drafts_course_details.simulator_title') ||
                            'Interactive Playground: Draft Box & Invites'}
                    </h4>
                    <p className="text-xs text-neutral-600 dark:text-neutral-400">
                        {t('drafts_course_details.simulator_desc') ||
                            'Try out managing your draft slots, generating invite links, and see what happens when your draft box is full!'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            drafts.length >= 5
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                                : 'bg-green-100 text-green-800 dark:bg-green-950/60 dark:text-green-300'
                        }`}
                    >
                        {t('drafts_course_details.slots_used') ||
                            'Draft Slots Used'}
                        : {drafts.length} / 5
                    </span>
                    <button
                        type="button"
                        onClick={handleAddDraft}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white shadow-xs transition hover:bg-green-700"
                    >
                        <FiPlus className="size-3.5" />
                        <span>
                            {t('drafts_course_details.add_draft_btn') ||
                                '+ Add New Draft'}
                        </span>
                    </button>
                </div>
            </div>

            {errorMsg && (
                <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3 text-xs font-medium text-amber-800 dark:border-amber-900/40 dark:bg-amber-950/30 dark:text-amber-300">
                    ⚠️ {errorMsg}
                </div>
            )}

            {/* Simulated Drafts Grid */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
                {drafts.map((draft) => (
                    <div
                        key={draft.id}
                        className="flex flex-col justify-between rounded-xl border border-neutral-200 bg-white p-4 shadow-2xs dark:border-neutral-800 dark:bg-neutral-900"
                    >
                        <div>
                            <div className="flex items-start justify-between gap-2">
                                <span className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800 dark:text-neutral-200">
                                    <FiFileText className="size-3.5 text-neutral-500" />
                                    <span className="line-clamp-1">
                                        {draft.title}
                                    </span>
                                </span>
                                <button
                                    type="button"
                                    onClick={() => handleDeleteDraft(draft.id)}
                                    title={
                                        t(
                                            'drafts_course_details.delete_draft_btn'
                                        ) || 'Delete Draft'
                                    }
                                    aria-label={
                                        t(
                                            'drafts_course_details.delete_draft_btn'
                                        ) || 'Delete Draft'
                                    }
                                    className="cursor-pointer text-neutral-400 transition hover:text-red-600"
                                >
                                    <FiTrash2 className="size-3.5" />
                                </button>
                            </div>

                            {/* 7 Progress Dots */}
                            <div className="my-3 flex items-center gap-1">
                                <span className="sr-only">
                                    {t(
                                        'drafts_course_details.steps_progress_sr',
                                        {
                                            completed: draft.stepsCompleted,
                                            total: 7,
                                        }
                                    ) ||
                                        `${draft.stepsCompleted} of 7 steps completed`}
                                </span>
                                {Array.from({ length: 7 }).map((_, idx) => (
                                    <div
                                        key={idx}
                                        className={`h-1.5 flex-1 rounded-full ${
                                            idx < draft.stepsCompleted
                                                ? 'bg-green-500'
                                                : 'bg-neutral-200 dark:bg-neutral-800'
                                        }`}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px]">
                            {draft.isShared ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-950/40 dark:text-blue-300">
                                    <FiUsers className="size-3" />{' '}
                                    {t(
                                        'drafts_course_details.team_draft_badge'
                                    ) || 'Team Draft (7d)'}
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 font-medium text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                                    {t(
                                        'drafts_course_details.solo_draft_badge'
                                    ) || 'Solo Draft (365d)'}
                                </span>
                            )}

                            {draft.isExpiringSoon && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 font-medium text-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                                    <FiClock className="size-3" />
                                    {t(
                                        'drafts_course_details.expires_in_hours'
                                    ) || 'Expires in 2 hours'}
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Invite Link Generator Simulator */}
            <div className="mt-5 rounded-xl border border-neutral-200 bg-white p-4 dark:border-neutral-800 dark:bg-neutral-900">
                <label
                    htmlFor="draft-invite-link-input"
                    className="mb-1.5 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                    {t('drafts_course_details.invite_link_label') ||
                        'Shareable Co-Cook Invite Link'}
                </label>
                <div className="flex flex-wrap items-center gap-2">
                    <input
                        id="draft-invite-link-input"
                        type="text"
                        readOnly
                        value={inviteLink}
                        aria-label={
                            t('drafts_course_details.invite_link_label') ||
                            'Shareable Co-Cook Invite Link'
                        }
                        className="min-w-64 flex-1 rounded-lg border border-neutral-200 bg-neutral-100 px-3 py-2 text-xs text-neutral-600 focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300"
                    />
                    <button
                        type="button"
                        onClick={handleCopyLink}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-green-700"
                    >
                        {copied ? (
                            <FiCheck className="size-3.5" />
                        ) : (
                            <FiCopy className="size-3.5" />
                        )}
                        <span>
                            {copied
                                ? t('drafts_course_details.copied') || 'Copied!'
                                : t('drafts_course_details.copy_link_btn') ||
                                  'Copy Invite Link'}
                        </span>
                    </button>
                    <button
                        type="button"
                        onClick={handleRegenerateLink}
                        title={
                            t(
                                'drafts_course_details.regenerate_link_tooltip'
                            ) || 'Regenerate link and invalidate previous'
                        }
                        aria-label={
                            t(
                                'drafts_course_details.regenerate_link_tooltip'
                            ) || 'Regenerate link and invalidate previous'
                        }
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-xs font-semibold text-neutral-700 transition hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                    >
                        <FiRefreshCw className="size-3.5" />
                        <span>
                            {t('drafts_course_details.regenerate_link_btn') ||
                                'Regenerate Link'}
                        </span>
                    </button>
                </div>
            </div>
        </div>
    );
};

export default DraftQuotaSimulator;
