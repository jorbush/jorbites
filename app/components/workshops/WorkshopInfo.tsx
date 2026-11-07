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
        <div className="col-span-4 flex flex-col gap-6 pr-2 pl-2">
            {/* Host Card */}
            <div className="flex items-center gap-3.5 rounded-2xl border border-neutral-200/80 bg-white p-4 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
                <Avatar
                    src={host?.image}
                    size={44}
                    onClick={() => push('/profile/' + host.id)}
                    quality="auto:eco"
                />
                <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 font-bold text-neutral-900 dark:text-white">
                        <button
                            type="button"
                            className="cursor-pointer text-left hover:underline focus:outline-hidden"
                            onClick={() => push('/profile/' + host.id)}
                        >
                            {getUserDisplayName(
                                host,
                                isMdOrSmaller,
                                isSmOrSmaller
                            )}
                        </button>
                        {host.verified && (
                            <VerificationBadge className="mt-0.5 ml-1" />
                        )}
                    </div>
                    <span className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                        {t('host')}
                    </span>
                </div>
            </div>

            {/* Key Details Section */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
                <div className="flex flex-col gap-3.5 dark:text-neutral-100">
                    <div className="flex items-center gap-2.5 text-base text-neutral-700 dark:text-neutral-200">
                        <MdCalendarToday
                            size={20}
                            className="shrink-0 text-neutral-500 dark:text-neutral-400"
                        />
                        <span
                            data-cy="workshop-date-display"
                            suppressHydrationWarning
                        >
                            {formatDate(workshopDate)}
                        </span>
                    </div>
                    {isRecurrent && recurrencePattern && (
                        <div className="pl-7 text-xs font-medium text-neutral-500 dark:text-neutral-400">
                            {t('recurrence')}: {t(recurrencePattern)}
                        </div>
                    )}
                    <div className="flex items-center gap-2.5 text-base text-neutral-700 dark:text-neutral-200">
                        <MdLocationOn
                            size={20}
                            className="shrink-0 text-neutral-500 dark:text-neutral-400"
                        />
                        <span data-cy="workshop-location-display">
                            {location}
                        </span>
                    </div>
                    <div className="flex items-center gap-2.5 text-base text-neutral-700 dark:text-neutral-200">
                        <MdPeople
                            size={20}
                            className="shrink-0 text-neutral-500 dark:text-neutral-400"
                        />
                        <span>
                            {participants.length} {t('participants')}
                        </span>
                    </div>
                    {isPrivate && (
                        <div className="flex items-center gap-2.5 text-base text-neutral-700 dark:text-neutral-200">
                            <MdLock
                                size={20}
                                className="shrink-0 text-neutral-500 dark:text-neutral-400"
                            />
                            <span>{t('private_workshop')}</span>
                        </div>
                    )}
                    {price > 0 && (
                        <div className="text-green-450 flex items-center gap-2.5 text-base font-semibold">
                            <FaMoneyBillWave
                                size={20}
                                className="text-green-450 shrink-0"
                            />
                            <span>
                                {price.toFixed(2)}€ {t('price_per_person')}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {/* Description Section */}
            <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
                <h3 className="mb-2 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                    {t('description')}
                </h3>
                <div
                    className="text-sm leading-relaxed whitespace-pre-line text-neutral-600 dark:text-neutral-300"
                    data-cy="workshop-description-display"
                >
                    {description}
                </div>
            </div>

            {/* Ingredients Section */}
            {ingredients.length > 0 && (
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
                    <h3 className="mb-3 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                        {t('ingredients')}
                    </h3>
                    <div
                        className="flex flex-col gap-2"
                        data-cy="workshop-ingredients-section"
                    >
                        {ingredients.map((ingredient, i) => (
                            <div
                                key={`ing-${i}-${ingredient}`}
                                className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-300"
                            >
                                <span className="size-1.5 shrink-0 rounded-full bg-neutral-400 dark:bg-neutral-500" />
                                <span>{ingredient}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Previous Steps Section */}
            {previousSteps.length > 0 && (
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
                    <h3 className="text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                        {t('previous_steps')}
                    </h3>
                    <p className="mt-1 mb-3 text-xs text-neutral-500 dark:text-neutral-400">
                        {t('previous_steps_description')}
                    </p>
                    <div
                        className="flex flex-col gap-2.5"
                        data-cy="workshop-previous-steps-section"
                    >
                        {previousSteps.map((step, index) => (
                            <div
                                key={`step-${index}-${step}`}
                                className="flex items-start gap-2.5 text-sm text-neutral-600 dark:text-neutral-300"
                                data-cy={`workshop-previous-step-display-${index}`}
                            >
                                <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-neutral-100 text-xs font-semibold text-neutral-700 dark:bg-neutral-800 dark:text-neutral-300">
                                    {index + 1}
                                </span>
                                <span className="pt-0.5">{step}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Whitelisted Users Section (Private workshop & Host only) */}
            {isPrivate &&
                whitelistedUsers.length > 0 &&
                currentUser?.id === host.id && (
                    <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
                        <h3 className="mb-3 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                            {t('workshop_whitelist')}
                        </h3>
                        <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
                            {whitelistedUsers.map((user) => (
                                <button
                                    key={user.id}
                                    type="button"
                                    className="flex cursor-pointer items-center gap-2.5 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-2 text-left text-sm font-medium text-neutral-800 transition-colors duration-200 hover:border-neutral-300 hover:bg-neutral-100 focus:outline-hidden dark:border-neutral-700/60 dark:bg-neutral-800/60 dark:text-neutral-200 dark:hover:border-neutral-600 dark:hover:bg-neutral-800"
                                    onClick={() => push('/profile/' + user.id)}
                                >
                                    <Avatar
                                        src={user.image}
                                        size={32}
                                    />
                                    <span className="truncate">
                                        {user.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                )}

            {/* Participants Section */}
            {participants.length > 0 && (
                <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
                    <h3 className="mb-3 text-lg font-bold tracking-tight text-neutral-900 dark:text-white">
                        {t('participants')} ({participants.length})
                    </h3>
                    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 md:grid-cols-3">
                        {participants.map((participant) => (
                            <div
                                key={participant.id}
                                className="flex items-center gap-2 rounded-xl border border-neutral-200/80 bg-neutral-50/60 p-2 text-xs text-neutral-600 dark:border-neutral-800 dark:bg-neutral-800/60 dark:text-neutral-300"
                            >
                                <div className="size-2 rounded-full bg-green-500" />
                                <span suppressHydrationWarning>
                                    {t('joined_at')}:{' '}
                                    {mounted
                                        ? formatDateLanguage(
                                              participant.joinedAt,
                                              'MMM d, yyyy',
                                              i18n.language
                                          )
                                        : ''}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkshopInfo;
