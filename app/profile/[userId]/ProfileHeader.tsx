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
                        <div className="text-base text-neutral-400 sm:text-lg md:text-xl">{`${t('level')} ${user?.level}`}</div>
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
                <div className="flex shrink-0 items-center gap-2 self-start pt-1 sm:gap-3.5 sm:self-center sm:pt-0">
                    {currentUser && user && currentUser.id === user.id && (
                        <>
                            <button
                                type="button"
                                onClick={() => settingsModal.onOpen('account')}
                                className="hover:text-green-450 dark:hover:text-green-450 flex cursor-pointer items-center justify-center text-neutral-600 transition focus:outline-hidden dark:text-neutral-100"
                                title={t('edit_profile') || 'Edit Profile'}
                                aria-label={t('edit_profile') || 'Edit Profile'}
                                data-testid="edit-profile-button"
                            >
                                <FiEdit3 className="size-5" />
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
                        className="hover:text-green-450 dark:hover:text-green-450 flex cursor-pointer items-center justify-center text-neutral-600 transition focus:outline-hidden dark:text-neutral-100"
                        onClick={() => share()}
                        title={t('share') || 'Share'}
                        aria-label="Share"
                    >
                        <FiShare2 className="size-5" />
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

            <hr className="mt-2" />

            {/* Badges */}
            <ProfileBadges badges={user?.badges} />
        </Container>
    );
};

export default ProfileHeader;
