'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import { FiLink, FiRefreshCw, FiCopy, FiCheck } from 'react-icons/fi';

export interface DraftInviteLinkSectionProps {
    isOwner: boolean;
    inviteUrl: string;
    hasInviteToken: boolean;
    isRegenerating: boolean;
    copied: boolean;
    showRegenerateConfirm: boolean;
    onCopy: () => void;
    onRequestRegenerate: () => void;
    onCancelRegenerate: () => void;
    onConfirmRegenerate: () => void;
}

const DraftInviteLinkSection: React.FC<DraftInviteLinkSectionProps> = ({
    isOwner,
    inviteUrl,
    hasInviteToken,
    isRegenerating,
    copied,
    showRegenerateConfirm,
    onCopy,
    onRequestRegenerate,
    onCancelRegenerate,
    onConfirmRegenerate,
}) => {
    const { t } = useTranslation();

    if (!isOwner) {
        return (
            <div className="flex flex-col gap-2">
                {inviteUrl ? (
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
                            onClick={onCopy}
                            className="bg-green-450 flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90"
                        >
                            {copied ? (
                                <FiCheck size={14} />
                            ) : (
                                <FiCopy size={14} />
                            )}
                            <span>
                                {copied
                                    ? t('copied', { defaultValue: 'Copied!' })
                                    : t('copy_link', {
                                          defaultValue: 'Copy Link',
                                      })}
                            </span>
                        </button>
                    </div>
                ) : (
                    <p className="text-xs text-neutral-500 italic">
                        {t('only_owner_can_generate_link', {
                            defaultValue:
                                'Only the draft owner can generate invite links.',
                        })}
                    </p>
                )}
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
                <label
                    htmlFor="invite-link-input"
                    className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-600 uppercase dark:text-neutral-400"
                >
                    <FiLink size={14} />
                    <span>
                        {t('invite_link', {
                            defaultValue: 'Invite Link',
                        })}
                    </span>
                </label>
                {hasInviteToken && !showRegenerateConfirm && (
                    <button
                        type="button"
                        data-testid="regenerate-invite-link-btn"
                        onClick={onRequestRegenerate}
                        disabled={isRegenerating}
                        className="flex items-center gap-1 text-xs font-medium text-amber-600 hover:text-amber-700 disabled:opacity-50 dark:text-amber-400 dark:hover:text-amber-300"
                    >
                        <FiRefreshCw
                            size={12}
                            className={isRegenerating ? 'animate-spin' : ''}
                        />
                        <span>
                            {t('regenerate_link', {
                                defaultValue: 'Regenerate link',
                            })}
                        </span>
                    </button>
                )}
            </div>

            {showRegenerateConfirm && (
                <div
                    data-testid="regenerate-confirm-box"
                    className="flex flex-col gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-900 dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-200"
                >
                    <p>
                        {t('regenerate_confirm', {
                            defaultValue:
                                'Are you sure? Previous invite links will stop working.',
                        })}
                    </p>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            data-testid="regenerate-cancel-btn"
                            onClick={onCancelRegenerate}
                            className="rounded border border-neutral-300 bg-white px-2.5 py-1 text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300"
                        >
                            {t('cancel', { defaultValue: 'Cancel' })}
                        </button>
                        <button
                            type="button"
                            data-testid="regenerate-confirm-btn"
                            onClick={onConfirmRegenerate}
                            disabled={isRegenerating}
                            className="rounded bg-amber-600 px-2.5 py-1 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
                        >
                            {isRegenerating
                                ? t('loading', { defaultValue: 'Loading...' })
                                : t('confirm', {
                                      defaultValue: 'Regenerate',
                                  })}
                        </button>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-2">
                <input
                    id="invite-link-input"
                    type="text"
                    readOnly
                    value={inviteUrl}
                    placeholder={
                        isRegenerating || !hasInviteToken
                            ? (t('generating_link', {
                                  defaultValue: 'Generating invite link...',
                              }) as string)
                            : ''
                    }
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
                    onClick={onCopy}
                    disabled={!inviteUrl}
                    className="bg-green-450 flex shrink-0 items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-semibold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
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

export default DraftInviteLinkSection;
