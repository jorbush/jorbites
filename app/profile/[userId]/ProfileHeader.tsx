'use client';

import Avatar from '@/app/components/utils/Avatar';
import { SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import Container from '@/app/components/utils/Container';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import Badge from '@/app/components/utils/Badge';
import confetti from 'canvas-confetti';
import getUserDisplayName from '@/app/utils/responsive';
import VerificationBadge from '@/app/components/VerificationBadge';
import ScrollableContainer from '@/app/components/utils/ScrollableContainer';
import { formatDateLanguage } from '@/app/utils/date-utils';
import {
    FiCalendar,
    FiShare2,
    FiGlobe,
    FiExternalLink,
    FiEdit3,
} from 'react-icons/fi';
import { FaInstagram, FaTwitter, FaYoutube, FaTiktok } from 'react-icons/fa';
import useShare from '@/app/hooks/useShare';
import useSettingsModal from '@/app/hooks/useSettingsModal';
import { RecipeBookButton } from '@/app/components/profile/RecipeBookButton';
import {
    formatExternalUrl,
    formatDomainDisplay,
    getSocialLink,
} from '@/app/utils/profile-utils';

interface ProfileHeaderProps {
    user?: SafeUser | null;
    currentUser?: SafeUser | null;
}

const handleBadgeClick = () => {
    confetti({
        particleCount: 100,
        spread: 160,
        origin: { y: 0.6 },
    });
};

const formatMemberSince = (createdAt: string) => {
    return formatDateLanguage(new Date(createdAt), 'yyyy');
};

const getBadgeSrc = (badge: string) => {
    if (badge.startsWith('/') || badge.startsWith('http')) return badge;
    if (
        badge.endsWith('.webp') ||
        badge.endsWith('.jpg') ||
        badge.endsWith('.png')
    ) {
        return `/badges/${badge}`;
    }
    return `/badges/${badge}.webp`;
};

const isQuestBadge = (badge: string) => {
    return badge.startsWith('quest_solver_') || badge.includes('quest_solver');
};

const getBadgeTooltip = (badge: string) => {
    if (badge.includes('quest_solver_10')) {
        return 'Quest Veteran (Silver) - 10 Quests Fulfilled';
    }
    if (badge.includes('quest_solver_25')) {
        return 'Quest Master (Gold) - 25 Quests Fulfilled';
    }
    if (badge.includes('quest_solver_1')) {
        return 'Quest Solver (Bronze) - 1 Quest Fulfilled';
    }
    return `${badge.replace(/\.(webp|png|jpg)$/, '').replace(/_/g, ' ')} badge`;
};

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, currentUser }) => {
    const { push } = useRouter();
    const { t } = useTranslation();
    const settingsModal = useSettingsModal();
    const isMdOrSmaller = useMediaQuery('(max-width: 415px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 375px)');
    const { share } = useShare();

    const onBadgeClick = (badge: string) => {
        if (isQuestBadge(badge)) {
            push('/events/quest_badges');
        } else {
            handleBadgeClick();
        }
    };

    const hasBio = Boolean(user?.bio);
    const hasWebsite = Boolean(user?.websiteUrl);
    const hasSocials = Boolean(
        user?.instagram || user?.twitter || user?.youtube || user?.tiktok
    );

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
            {(hasBio || hasWebsite || hasSocials) && (
                <div className="mt-1 px-2 pb-2">
                    {hasBio && (
                        <p
                            className="max-w-2xl text-sm leading-relaxed text-neutral-600 dark:text-neutral-300"
                            data-testid="profile-bio"
                        >
                            {user?.bio}
                        </p>
                    )}
                    {(hasWebsite || hasSocials) && (
                        <div className="mt-3 flex flex-wrap items-center gap-3">
                            {user?.websiteUrl && (
                                <a
                                    href={formatExternalUrl(user.websiteUrl)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-xs font-medium text-neutral-700 transition hover:bg-neutral-200 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-200 dark:hover:bg-neutral-700"
                                    data-testid="profile-website-link"
                                    aria-label={
                                        t('visit_website') || 'Visit website'
                                    }
                                >
                                    <FiGlobe className="text-green-450 size-3.5" />
                                    <span className="max-w-[200px] truncate">
                                        {formatDomainDisplay(user.websiteUrl)}
                                    </span>
                                    <FiExternalLink className="size-3 opacity-60" />
                                </a>
                            )}
                            {user?.instagram && (
                                <a
                                    href={getSocialLink(
                                        'instagram',
                                        user.instagram
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-neutral-500 transition hover:text-pink-600 dark:text-neutral-400 dark:hover:text-pink-400"
                                    aria-label="Instagram"
                                    data-testid="profile-instagram-link"
                                >
                                    <FaInstagram className="size-5" />
                                </a>
                            )}
                            {user?.twitter && (
                                <a
                                    href={getSocialLink(
                                        'twitter',
                                        user.twitter
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                                    aria-label="X / Twitter"
                                    data-testid="profile-twitter-link"
                                >
                                    <FaTwitter className="size-5" />
                                </a>
                            )}
                            {user?.youtube && (
                                <a
                                    href={getSocialLink(
                                        'youtube',
                                        user.youtube
                                    )}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-neutral-500 transition hover:text-red-600 dark:text-neutral-400 dark:hover:text-red-400"
                                    aria-label="YouTube"
                                    data-testid="profile-youtube-link"
                                >
                                    <FaYoutube className="size-5" />
                                </a>
                            )}
                            {user?.tiktok && (
                                <a
                                    href={getSocialLink('tiktok', user.tiktok)}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1 text-neutral-500 transition hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
                                    aria-label="TikTok"
                                    data-testid="profile-tiktok-link"
                                >
                                    <FaTiktok className="size-5" />
                                </a>
                            )}
                        </div>
                    )}
                </div>
            )}
            <hr className="mt-2" />
            {user?.badges &&
                Array.isArray(user?.badges) &&
                user.badges.length > 0 && (
                    <>
                        <ScrollableContainer className="mt-2">
                            {user.badges.map((badge) => (
                                <Badge
                                    key={badge}
                                    src={getBadgeSrc(badge)}
                                    alt={`${badge} badge`}
                                    tooltipText={getBadgeTooltip(badge)}
                                    onClick={() => onBadgeClick(badge)}
                                    size={50}
                                />
                            ))}
                        </ScrollableContainer>
                        <hr className="mt-2" />
                    </>
                )}
        </Container>
    );
};

export default ProfileHeader;
