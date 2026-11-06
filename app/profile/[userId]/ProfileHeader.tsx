'use client';

import React from 'react';
import Avatar from '@/app/components/utils/Avatar';
import { SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Container from '@/app/components/utils/Container';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import getUserDisplayName from '@/app/utils/responsive';
import VerificationBadge from '@/app/components/VerificationBadge';
import { formatDateLanguage } from '@/app/utils/date-utils';
import { FiCalendar, FiShare2, FiEdit3 } from 'react-icons/fi';
import useShare from '@/app/hooks/useShare';
import useSettingsModal from '@/app/hooks/useSettingsModal';
import { RecipeBookButton } from '@/app/components/profile/RecipeBookButton';
import ProfileBacklinks from '@/app/components/profile/ProfileBacklinks';
import ProfileBadges from '@/app/components/profile/ProfileBadges';

interface ProfileHeaderProps {
    user?: SafeUser | null;
    currentUser?: SafeUser | null;
}

const formatMemberSince = (createdAt: string) => {
    return formatDateLanguage(new Date(createdAt), 'yyyy');
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, currentUser }) => {
    const { push } = useRouter();
    const { t } = useTranslation();
    const settingsModal = useSettingsModal();
    const isMdOrSmaller = useMediaQuery('(max-width: 415px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 375px)');
    const { share } = useShare();

    return (
        <Container>
            <div className="col-span-2 flex flex-row items-center justify-between gap-3 p-2 text-xl font-semibold sm:gap-4 dark:text-neutral-100">
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
                    <Avatar
                        src={user?.image}
                        size={100}
                        extraClasses="size-18 sm:size-22 md:size-[100px] shrink-0"
                        onClick={() => push('/profile/' + user?.id)}
                    />
                    <div className="flex min-w-0 flex-1 flex-col gap-1 text-2xl sm:gap-2 md:text-3xl">
                        <div className="flex items-center gap-1.5 sm:gap-2">
                            <button
                                type="button"
                                className="cursor-pointer truncate text-left focus:outline-hidden"
                                onClick={() => push('/profile/' + user?.id)}
                            >
                                {getUserDisplayName(
                                    user,
                                    isMdOrSmaller,
                                    isSmOrSmaller
                                )}
                            </button>
                            {user?.verified && (
                                <VerificationBadge className="mt-0.5 shrink-0" />
                            )}
                        </div>
                        <div className="flex items-center">
                            <span className="border-green-450/30 bg-green-450/15 dark:text-green-450 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold text-neutral-800">
                                {`${t('level')} ${user?.level ?? 0}`}
                            </span>
                        </div>
                        {user?.createdAt && (
                            <div className="flex items-center gap-1 text-xs text-neutral-500">
                                <FiCalendar className="size-3 shrink-0" />
                                <span className="truncate">
                                    {t('since')}{' '}
                                    {formatMemberSince(user.createdAt)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex shrink-0 items-center gap-2 self-start pt-1 sm:gap-2.5 sm:self-center sm:pt-0">
                    {currentUser && user && currentUser.id === user.id && (
                        <>
                            <button
                                type="button"
                                onClick={() => settingsModal.onOpen('account')}
                                className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 text-neutral-600 shadow-2xs transition-colors duration-200 hover:border-neutral-300 hover:text-neutral-900 focus:outline-hidden sm:size-10 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white"
                                title={t('edit_profile') || 'Edit Profile'}
                                aria-label={t('edit_profile') || 'Edit Profile'}
                                data-testid="edit-profile-button"
                            >
                                <FiEdit3 className="size-4 sm:size-4.5" />
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
                        className="flex size-9 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-neutral-100 text-neutral-600 shadow-2xs transition-colors duration-200 hover:border-neutral-300 hover:text-neutral-900 focus:outline-hidden sm:size-10 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600 dark:hover:text-white"
                        onClick={() => share()}
                        title={t('share') || 'Share'}
                        aria-label="Share"
                    >
                        <FiShare2 className="size-4 sm:size-4.5" />
                    </button>
                </div>
            </div>

            {/* Creator Bio & Backlinks */}
            <ProfileBacklinks
                bio={user?.bio}
                websiteUrl={user?.websiteUrl}
                instagram={user?.instagram}
                twitter={user?.twitter}
                youtube={user?.youtube}
                tiktok={user?.tiktok}
            />

            {/* Badges */}
            <ProfileBadges badges={user?.badges} />
        </Container>
    );
};

export default ProfileHeader;
