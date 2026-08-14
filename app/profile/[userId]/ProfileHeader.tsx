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
import { FiCalendar, FiShare2 } from 'react-icons/fi';
import useShare from '@/app/hooks/useShare';
import { RecipeBookButton } from '@/app/components/profile/RecipeBookButton';

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
    const router = useRouter();
    const { t } = useTranslation();
    const isMdOrSmaller = useMediaQuery('(max-width: 415px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 375px)');
    const { share } = useShare();

    const onBadgeClick = (badge: string) => {
        if (isQuestBadge(badge)) {
            router.push('/events/quest_badges');
        } else {
            handleBadgeClick();
        }
    };

    return (
        <Container>
            <div className="col-span-2 flex flex-row items-center justify-between gap-4 p-2 text-xl font-semibold dark:text-neutral-100">
                <div className="flex flex-row items-center gap-4">
                    <Avatar
                        src={user?.image}
                        size={100}
                        onClick={() => router.push('/profile/' + user?.id)}
                    />
                    <div className="flex flex-col gap-2 text-2xl md:text-3xl">
                        <div className="flex flex-row gap-2">
                            <button
                                type="button"
                                className="cursor-pointer text-left focus:outline-hidden"
                                onClick={() =>
                                    router.push('/profile/' + user?.id)
                                }
                            >
                                {getUserDisplayName(
                                    user,
                                    isMdOrSmaller,
                                    isSmOrSmaller
                                )}
                            </button>
                            {user?.verified && (
                                <VerificationBadge className="mt-1 ml-1" />
                            )}
                        </div>
                        <div className="text-lg text-neutral-400 md:text-xl">{`${t('level')} ${user?.level}`}</div>
                        {user?.createdAt && (
                            <div className="flex items-center gap-1 text-xs text-neutral-500">
                                <FiCalendar className="size-3" />
                                <span>
                                    {t('since')}{' '}
                                    {formatMemberSince(user.createdAt)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <div className="flex flex-row items-center gap-4">
                    {currentUser && user && currentUser.id === user.id && (
                        <RecipeBookButton
                            userId={user.id}
                            userName={user.name || 'User'}
                            userImage={user.image}
                        />
                    )}
                    <button
                        type="button"
                        className="flex cursor-pointer items-center gap-2 text-neutral-600 focus:outline-hidden dark:text-neutral-100"
                        onClick={() => share()}
                        aria-label="Share"
                    >
                        <FiShare2 className="text-xl" />
                    </button>
                </div>
            </div>
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
