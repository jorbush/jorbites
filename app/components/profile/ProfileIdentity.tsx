'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiCalendar } from 'react-icons/fi';
import Avatar from '@/app/components/utils/Avatar';
import VerificationBadge from '@/app/components/VerificationBadge';
import { SafeUser } from '@/app/types';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import getUserDisplayName from '@/app/utils/responsive';
import { formatDateLanguage } from '@/app/utils/date-utils';

interface ProfileIdentityProps {
    user?: SafeUser | null;
}

const formatMemberSince = (createdAt: string) => {
    return formatDateLanguage(new Date(createdAt), 'yyyy');
};

const ProfileIdentity: React.FC<ProfileIdentityProps> = ({ user }) => {
    const { push } = useRouter() || {};
    const { t } = useTranslation();
    const isMdOrSmaller = useMediaQuery('(max-width: 415px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 375px)');

    return (
        <div className="flex items-center gap-3.5 p-2 text-xl font-semibold sm:gap-4 dark:text-neutral-100">
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
                        {getUserDisplayName(user, isMdOrSmaller, isSmOrSmaller)}
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
                            {t('since')} {formatMemberSince(user.createdAt)}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProfileIdentity;
