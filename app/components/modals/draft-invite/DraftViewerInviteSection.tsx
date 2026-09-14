'use client';

import React, { useState, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { FiCopy, FiCheck } from 'react-icons/fi';
import { toast } from 'react-hot-toast';

export interface DraftViewerInviteSectionProps {
    inviteUrl: string;
}

const DraftViewerInviteSection: React.FC<DraftViewerInviteSectionProps> = ({
    inviteUrl,
}) => {
    const { t } = useTranslation();
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
        if (!inviteUrl) return;
        try {
            await navigator.clipboard.writeText(inviteUrl);
            setCopied(true);
            toast.success(
                t('co_cook_link_copied', {
                    defaultValue: 'Co-cook invite link copied to clipboard!',
                })
            );
            setTimeout(() => setCopied(false), 2000);
        } catch {
            toast.error(
                t('could_not_copy_link', {
                    defaultValue: 'Could not copy link to clipboard',
                })
            );
        }
    }, [inviteUrl, t]);

    if (!inviteUrl) {
        return (
            <div className="flex flex-col gap-2">
                <p className="text-xs text-neutral-500 italic">
                    {t('only_owner_can_generate_link', {
                        defaultValue:
                            'Only the draft owner can generate invite links.',
                    })}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <input
                    id="invite-link-input"
                    type="text"
                    readOnly
                    value={inviteUrl}
                    data-testid="invite-link-input"
                    aria-label={
                        t('invite_link', {
                            defaultValue: 'Invite Link',
                        }) as string
                    }
                    className="w-full truncate rounded-lg border border-neutral-300 bg-neutral-50 px-3 py-2 font-mono text-xs text-neutral-700 select-all focus:outline-hidden dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                />
                <button
                    type="button"
                    data-testid="copy-invite-link-btn"
                    onClick={handleCopy}
                    className="bg-green-450 flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                >
                    {copied ? <FiCheck size={14} /> : <FiCopy size={14} />}
                    <span>
                        {copied
                            ? t('copied', { defaultValue: 'Copied!' })
                            : t('copy_link', {
                                  defaultValue: 'Copy Link',
                              })}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default DraftViewerInviteSection;
