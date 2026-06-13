'use client';

import { SafeUser, SafeWorkshopParticipant } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import { useTranslation } from 'react-i18next';
import { formatDateLanguage } from '@/app/utils/date-utils';
import { useRouter } from 'next/navigation';
import useIsMounted from '@/app/hooks/useIsMounted';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import getUserDisplayName from '@/app/utils/responsive';
import VerificationBadge from '@/app/components/VerificationBadge';
import {
    MdLocationOn,
    MdCalendarToday,
    MdPeople,
    MdLock,
} from 'react-icons/md';
import { FaMoneyBillWave } from 'react-icons/fa';
import useSWR from 'swr';
import { axiosFetcher } from '@/app/utils/fetcher';

interface WorkshopInfoProps {
    host: SafeUser;
    description: string;
    date: string;
    location: string;
    isRecurrent: boolean;
    recurrencePattern?: string | null;
    isPrivate: boolean;
    price: number;
    ingredients: string[];
    previousSteps: string[];
    currentUser?: SafeUser | null;
    id: string;
    participants?: SafeWorkshopParticipant[];
    whitelistedUserIds: string[];
}

const EMPTY_ARRAY: any[] = [];

const WorkshopInfo: React.FC<WorkshopInfoProps> = ({
    host,
    description,
    date,
    location,
    isRecurrent,
    recurrencePattern,
    isPrivate,
    price,
    ingredients,
    previousSteps,
    currentUser,
    id: _id,
    participants = EMPTY_ARRAY,
    whitelistedUserIds,
}) => {
    const { t, i18n } = useTranslation();
    const { push } = useRouter() || {};
    const mounted = useIsMounted();
    const isMdOrSmaller = useMediaQuery('(max-width: 425px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 375px)');

    const { data: whitelistedUsersData } = useSWR<any[]>(
        whitelistedUserIds.length > 0
            ? `/api/users/multiple?ids=${whitelistedUserIds.join(',')}`
            : null,
        axiosFetcher
    );

    const whitelistedUsers = whitelistedUsersData || [];

    const workshopDate = new Date(date);
    const formatDate = (date: Date) => {
        if (!mounted) return '';
        return formatDateLanguage(
            date,
            'eeee, d MMMM yyyy, HH:mm',
            i18n.language
        );
    };

    return (
        <div className="col-span-4 flex flex-col gap-8 pr-2 pl-2">
            <div className="flex flex-col gap-2">
                <div className="flex flex-row items-center gap-2 text-xl font-semibold dark:text-neutral-100">
                    <Avatar
                        src={host?.image}
                        size={40}
                        onClick={() => push('/profile/' + host.id)}
                        quality="auto:eco"
                    />
                    <div className="flex flex-col">
                        <div className="flex flex-row items-center">
                            <button
                                type="button"
                                className="cursor-pointer text-left focus:outline-hidden"
                                onClick={() => push('/profile/' + host.id)}
                            >
                                {getUserDisplayName(
                                    host,
                                    isMdOrSmaller,
                                    isSmOrSmaller
                                )}
                            </button>
                            {host.verified && (
                                <VerificationBadge className="mt-1 ml-1" />
                            )}
                        </div>
                        <div className="text-sm text-neutral-400">{`${t('host')}`}</div>
                    </div>
                </div>
            </div>

            <hr />

            <div className="flex flex-col gap-4 dark:text-neutral-100">
                <div className="flex items-center gap-2 text-lg">
                    <MdCalendarToday size={24} />
                    <span data-cy="workshop-date-display">
                        {formatDate(workshopDate)}
                    </span>
                </div>
                {isRecurrent && recurrencePattern && (
                    <div className="text-sm text-neutral-500">
                        {t('recurrence')}: {t(recurrencePattern)}
                    </div>
                )}
                <div className="flex items-center gap-2 text-lg">
                    <MdLocationOn size={24} />
                    <span data-cy="workshop-location-display">{location}</span>
                </div>
                <div className="flex items-center gap-2 text-lg">
                    <MdPeople size={24} />
                    <span>
                        {participants.length} {t('participants')}
                    </span>
                </div>
                {isPrivate && (
                    <div className="flex items-center gap-2 text-lg">
                        <MdLock size={24} />
                        <span>{t('private_workshop')}</span>
                    </div>
                )}
                {price > 0 && (
                    <div className="flex items-center gap-2 text-lg">
                        <FaMoneyBillWave size={24} />
                        <span>
                            {price.toFixed(2)}€ {t('price_per_person')}
                        </span>
                    </div>
                )}
            </div>

            <hr />

            <div className="flex flex-col gap-4 text-lg dark:text-neutral-100">
                <div className="font-semibold">{t('description')}</div>
                <div
                    className="whitespace-pre-line text-neutral-500"
                    data-cy="workshop-description-display"
                >
                    {description}
                </div>
            </div>

            {ingredients.length > 0 && (
                <>
                    <hr />
                    <div className="flex flex-col gap-4 dark:text-neutral-100">
                        <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                            {t('ingredients')}
                        </div>
                        <div
                            className="flex flex-col gap-2"
                            data-cy="workshop-ingredients-section"
                        >
                            {ingredients.map((ingredient, i) => (
                                <div
                                    key={`ing-${i}-${ingredient}`}
                                    className="text-neutral-500"
                                >
                                    • {ingredient}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {previousSteps.length > 0 && (
                <>
                    <hr />
                    <div className="flex flex-col gap-4 dark:text-neutral-100">
                        <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                            {t('previous_steps')}
                        </div>
                        <div className="mb-2 text-sm text-neutral-500">
                            {t('previous_steps_description')}
                        </div>
                        <div
                            className="flex flex-col gap-2"
                            data-cy="workshop-previous-steps-section"
                        >
                            {previousSteps.map((step, index) => (
                                <div
                                    key={`step-${index}-${step}`}
                                    className="text-neutral-500"
                                    data-cy={`workshop-previous-step-display-${index}`}
                                >
                                    {index + 1}. {step}
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {isPrivate &&
                whitelistedUsers.length > 0 &&
                currentUser?.id === host.id && (
                    <>
                        <hr />
                        <div className="flex flex-col gap-4 dark:text-neutral-100">
                            <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                                {t('workshop_whitelist')}
                            </div>
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                                {whitelistedUsers.map((user) => (
                                    <button
                                        key={user.id}
                                        type="button"
                                        className="flex cursor-pointer items-center gap-2 text-left hover:opacity-75 focus:outline-hidden"
                                        onClick={() =>
                                            push('/profile/' + user.id)
                                        }
                                    >
                                        <Avatar
                                            src={user.image}
                                            size={32}
                                        />
                                        <span>{user.name}</span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}

            {participants.length > 0 && (
                <>
                    <hr />
                    <div className="flex flex-col gap-4 dark:text-neutral-100">
                        <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                            {t('participants')} ({participants.length})
                        </div>
                        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:grid-cols-3">
                            {participants.map((participant) => (
                                <div
                                    key={participant.id}
                                    className="flex items-center gap-2 text-sm"
                                >
                                    <div className="size-2 rounded-full bg-green-500" />
                                    <span>
                                        {t('joined_at')}:{' '}
                                        {mounted
                                            ? new Date(
                                                  participant.joinedAt
                                              ).toLocaleDateString()
                                            : ''}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default WorkshopInfo;
