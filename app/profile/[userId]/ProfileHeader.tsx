'use client';

import Avatar from '@/app/components/Avatar';
import { SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';
import { MdVerified } from 'react-icons/md';
import { useTranslation } from 'react-i18next';
import Container from '@/app/components/Container';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import Image from 'next/image';

interface ProfileHeaderProps {
    user?: SafeUser | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user }) => {
    const router = useRouter();
    const { t } = useTranslation();
    const isMdOrSmaller = useMediaQuery('(max-width: 415px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 375px)');

    const getDisplayName = () => {
        if (!user?.name) return '';
        const parts = user.name.split(' ');
        const firstName = parts[0];
        const lastName = parts[1] || '';
        if (lastName.length === 0) return firstName;
        const fullNameLength = user.name.length;
        if (isMdOrSmaller) {
            if (
                isSmOrSmaller ||
                fullNameLength > 20 ||
                (lastName && /^[a-z]/.test(lastName))
            ) {
                return firstName;
            } else {
                return `${firstName} ${lastName}`;
            }
        }
        return user.name;
    };
    console.log(user?.badges);
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
                            {getDisplayName()}
                        </div>
                        {user?.verified && (
                            <MdVerified className="ml-1 mt-1 text-green-450" />
                        )}
                    </div>
                    <div className="text-lg text-gray-400 md:text-xl">{`${t('level')} ${user?.level}`}</div>
                </div>
            </div>
            <hr className="mt-2" />
            {Array.isArray(user?.badges) && user?.badges && (
                <>
                    <div className="mt-2 flex flex-wrap gap-2">
                        {user.badges.map((badge, index) => (
                            <Image
                                key={index}
                                src={`/badges/${badge}.webp`}
                                alt={`${badge} badge`}
                                width={50}
                                height={50}
                            />
                        ))}
                    </div>
                    <hr className="mt-2" />
                </>
            )}
        </Container>
    );
};

export default ProfileHeader;
