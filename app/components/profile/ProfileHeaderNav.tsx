'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiShare2, FiEdit3, FiChevronLeft } from 'react-icons/fi';
import { SafeUser } from '@/app/types';
import useShare from '@/app/hooks/useShare';
import useSettingsModal from '@/app/hooks/useSettingsModal';
import { RecipeBookButton } from '@/app/components/profile/RecipeBookButton';

interface ProfileHeaderNavProps {
    user?: SafeUser | null;
    currentUser?: SafeUser | null;
}

const ProfileHeaderNav: React.FC<ProfileHeaderNavProps> = ({
    user,
    currentUser,
}) => {
    const { push, back } = useRouter() || {};
    const { t } = useTranslation();
    const settingsModal = useSettingsModal();
    const { share } = useShare();

    const isOwner = Boolean(currentUser && user && currentUser.id === user.id);

    return (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-3 pt-1 sm:mb-3 sm:pt-2">
            {/* Back Button */}
            <button
                type="button"
                onClick={() => (back ? back() : push('/'))}
                className="group inline-flex cursor-pointer items-center gap-2.5 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                aria-label={t('back') || 'Back'}
                data-cy="back-button"
            >
                <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 group-hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:border-neutral-600">
                    <FiChevronLeft size={18} />
                </div>
                <span>{t('back') || 'Back'}</span>
            </button>

            {/* Action Controls */}
            <div className="flex flex-wrap items-center gap-2">
                {isOwner && user && (
                    <>
                        <button
                            type="button"
                            onClick={() => settingsModal.onOpen('account')}
                            className="flex size-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 hover:text-neutral-900 focus:outline-hidden md:h-9 md:w-auto md:px-3 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white"
                            title={t('edit_profile') || 'Edit Profile'}
                            aria-label={t('edit_profile') || 'Edit Profile'}
                            data-testid="edit-profile-button"
                        >
                            <FiEdit3 className="size-4 shrink-0" />
                            <span className="hidden text-xs font-semibold md:inline">
                                {t('edit_profile') || 'Edit Profile'}
                            </span>
                        </button>
                        <RecipeBookButton
                            userId={user.id}
                            userName={user.name || 'User'}
                            userImage={user.image}
                        />
                    </>
                )}
                <button
                    type="button"
                    className="flex size-9 cursor-pointer items-center justify-center gap-1.5 rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 hover:text-neutral-900 focus:outline-hidden md:h-9 md:w-auto md:px-3 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white"
                    onClick={() => share()}
                    title={t('share') || 'Share'}
                    aria-label="Share"
                >
                    <FiShare2 className="size-4 shrink-0" />
                    <span className="hidden text-xs font-semibold md:inline">
                        {t('share') || 'Share'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export default ProfileHeaderNav;
