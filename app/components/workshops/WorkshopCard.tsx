'use client';

import { SafeWorkshop, SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { formatDateLanguage } from '@/app/utils/date-utils';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import useIsMounted from '@/app/hooks/useIsMounted';
import { memo } from 'react';
import Avatar from '../utils/Avatar';
import {
    MdLocationOn,
    MdCalendarToday,
    MdPeople,
    MdLock,
} from 'react-icons/md';

interface WorkshopCardProps {
    data: SafeWorkshop;
    currentUser?: SafeUser | null;
    isFirstCard?: boolean;
}

const WorkshopCard = memo(function WorkshopCard({
    data,
    currentUser: _currentUser,
    isFirstCard = false,
}: WorkshopCardProps) {
    const { push } = useRouter() || {};
    const { t, i18n } = useTranslation();
    const mounted = useIsMounted();

    const workshopDate = new Date(data.date);
    const isPast = workshopDate < new Date();
    const participantCount = data.participants?.length || 0;

    const formatDate = (date: Date) => {
        return formatDateLanguage(date, 'MMM d, yyyy, HH:mm', i18n.language);
    };

    return (
        <div
            className="group relative col-span-1 flex flex-col justify-between overflow-hidden rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs transition-colors duration-200 hover:border-neutral-300 dark:border-neutral-800 dark:bg-neutral-900/90 dark:hover:border-neutral-700"
            id={isFirstCard ? 'lcp-container' : undefined}
            data-testid="workshop-card"
        >
            <div className="flex w-full flex-col gap-3">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-neutral-100 dark:bg-neutral-800">
                    <CustomProxyImage
                        src={data.imageSrc || '/jorbites-social.jpg'}
                        alt="workshop"
                        fill
                        priority={isFirstCard}
                        className="size-full object-cover transition-transform duration-300 group-hover:scale-102"
                        width={250}
                        height={250}
                        sizes="(max-width: 640px) 150px, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 250px"
                    />
                    {data.isPrivate && (
                        <div className="absolute top-2.5 left-2.5 flex items-center gap-1 rounded-full border border-neutral-800/80 bg-neutral-900/80 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-xs">
                            <MdLock size={12} />
                            <span>{t('private', 'Private')}</span>
                        </div>
                    )}
                    {isPast && (
                        <div className="backdrop-blur-2xs absolute inset-0 flex items-center justify-center bg-neutral-900/50">
                            <div className="rounded-xl border border-white/20 bg-neutral-900/85 px-3 py-1.5 text-xs font-semibold text-white shadow-xs">
                                {t('workshop_date_passed')}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <h3 className="line-clamp-1 text-lg font-bold text-neutral-900 transition-colors duration-200 dark:text-white">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                push(`/workshops/${data.id}`);
                            }}
                            className="decoration-green-450 cursor-pointer text-left decoration-2 underline-offset-4 transition-colors duration-200 group-hover:underline after:absolute after:inset-0 after:rounded-2xl after:content-[''] hover:underline focus:outline-hidden"
                            data-cy="workshop-card-title"
                        >
                            {data.title}
                        </button>
                    </h3>

                    {data.host && (
                        <div className="mt-1.5 flex items-center gap-2">
                            <Avatar
                                src={data.host.image}
                                size={20}
                            />
                            <span className="text-xs font-medium text-neutral-600 dark:text-neutral-400">
                                {data.host.name}
                            </span>
                        </div>
                    )}
                </div>

                <div className="flex flex-col gap-1.5 pt-1 text-xs text-neutral-500 dark:text-neutral-400">
                    <div className="flex items-center gap-1.5">
                        <MdCalendarToday
                            size={13}
                            className="shrink-0 text-neutral-400 dark:text-neutral-500"
                        />
                        <span suppressHydrationWarning>
                            {mounted ? formatDate(workshopDate) : ''}
                        </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MdLocationOn
                            size={13}
                            className="shrink-0 text-neutral-400 dark:text-neutral-500"
                        />
                        <span className="truncate">{data.location}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <MdPeople
                            size={13}
                            className="shrink-0 text-neutral-400 dark:text-neutral-500"
                        />
                        <span>
                            {participantCount} {t('participants')}
                        </span>
                    </div>
                </div>
            </div>

            <div className="mt-4 border-t border-neutral-100 pt-3 dark:border-neutral-800/80">
                {data.price > 0 ? (
                    <div className="text-green-450 text-sm font-semibold">
                        {data.price.toFixed(2)}{' '}
                        {data.currency === 'USD' ? '$' : '€'} /{' '}
                        {t('person', 'person')}
                    </div>
                ) : (
                    <div className="text-green-450 text-sm font-semibold">
                        {t('free')}
                    </div>
                )}
            </div>
        </div>
    );
});

export const WorkshopCardSkeleton = () => {
    return (
        <div className="group col-span-1 flex flex-col justify-between rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900/90">
            <div className="flex w-full flex-col gap-2">
                <div className="aspect-square w-full overflow-hidden rounded-xl bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-6 w-3/4 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-4 w-1/2 rounded bg-neutral-200 dark:bg-neutral-700" />
                <div className="h-4 w-1/4 rounded bg-neutral-200 dark:bg-neutral-700" />
            </div>
        </div>
    );
};

export default WorkshopCard;
