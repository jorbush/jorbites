'use client';

import Avatar from '@/app/components/Avatar';
import { SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';
import { MdVerified } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import Container from '@/app/components/Container';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import Image from 'next/image';
import confetti from 'canvas-confetti';
import getUserDisplayName from '@/app/utils/responsive';
import StatItem from '@/app/components/utils/StatItem';

interface ProfileHeaderProps {
    user?: SafeUser | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const isMdOrSmaller = useMediaQuery('(max-width: 415px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 375px)');

    const handleBadgeClick = () => {
        confetti({
            particleCount: 100,
            spread: 160,
            origin: { y: 0.6 },
        });
    };

    return (
        <Container>
            <div className="col-span-2 flex flex-row items-center gap-4 p-2 text-xl font-semibold dark:text-neutral-100">
                <Avatar
                    src={user?.image}
                    size={100}
                    onClick={() => router.push('/profile/' + user?.id)}
                />
                <div className="flex flex-col gap-3 text-2xl md:text-3xl">
                    <div className="flex flex-row gap-2">
                        <div
                            className="cursor-pointer"
                            onClick={() => router.push('/profile/' + user?.id)}
                        >
                            {getUserDisplayName(
                                user,
                                isMdOrSmaller,
                                isSmOrSmaller
                            )}
                        </div>
                        {user?.verified && (
                            <MdVerified className="ml-1 mt-1 text-green-450" />
                        )}
                    </div>
                    <div className="text-lg text-gray-400 md:text-xl">{`${t('level')} ${user?.level}`}</div>
                </div>
            </div>
            <hr className="mt-2" />
            {user?.badges &&
                Array.isArray(user?.badges) &&
                user.badges.length > 0 && (
                    <>
                        <div className="mt-2 flex flex-wrap gap-2">
                            {user.badges.map((badge, index) => (
                                <Image
                                    key={index}
                                    src={`/badges/${badge}.webp`}
                                    alt={`${badge} badge`}
                                    width={50}
                                    height={50}
                                    className="cursor-pointer"
                                    onClick={handleBadgeClick}
                                />
                            ))}
                        </div>
                        <hr className="mt-2" />
                    </>
                )}
            <div className="flex flex-row gap-4 p-2">
                <StatItem
                    value={user?.recipeCount || 0}
                    label={t('recipes')}
                    flexDirection="row"
                />
                <StatItem
                    value={user?.likesReceived || 0}
                    label={t('favorites')}
                    flexDirection="row"
                />
            </div>
        </Container>
    );
};

export default ProfileHeader;
