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

interface ProfileHeaderProps {
    user?: SafeUser | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const isMdOrSmaller = useMediaQuery('(max-width: 415px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 375px)');
    const { share } = useShare();

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
                            <div
                                className="cursor-pointer"
                                onClick={() =>
                                    router.push('/profile/' + user?.id)
                                }
                            >
                                {getUserDisplayName(
                                    user,
                                    isMdOrSmaller,
                                    isSmOrSmaller
                                )}
                            </div>
                            {user?.verified && (
                                <VerificationBadge className="mt-1 ml-1" />
                            )}
                        </div>
                        <div className="text-lg text-gray-400 md:text-xl">{`${t('level')} ${user?.level}`}</div>
                        {user?.createdAt && (
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <FiCalendar className="h-3 w-3" />
                                <span>
                                    {t('since')}{' '}
                                    {formatMemberSince(user.createdAt)}
                                </span>
                            </div>
                        )}
                    </div>
                </div>
                <button
                    className="flex cursor-pointer items-center space-x-2 text-gray-600 focus:outline-hidden dark:text-neutral-100"
                    onClick={share}
                    aria-label="Share"
                >
                    <FiShare2 className="text-xl" />
                </button>
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
                                    src={`/badges/${badge}.webp`}
                                    alt={`${badge} badge`}
                                    onClick={handleBadgeClick}
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
