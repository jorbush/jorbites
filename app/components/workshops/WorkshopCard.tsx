'use client';

import { SafeWorkshop, SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
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
    currentUser,
    isFirstCard = false,
}: WorkshopCardProps) {
    const router = useRouter();
    const { t } = useTranslation();

    const workshopDate = new Date(data.date);
    const isPast = workshopDate < new Date();
    const participantCount = data.participants?.length || 0;

    const formatDate = (date: Date) => {
        return new Intl.DateTimeFormat('default', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div
            onClick={() => router.push(`/workshops/${data.id}`)}
            className="group col-span-1 cursor-pointer"
            id={isFirstCard ? 'lcp-container' : undefined}
        >
            <div className="flex w-full flex-col gap-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                    <CustomProxyImage
                        src={data.imageSrc || '/avocado.webp'}
                        alt="workshop"
                        fill
                        priority={isFirstCard}
                        className="h-full w-full object-cover transition group-hover:scale-110"
                        width={250}
                        height={250}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 250px"
                    />
                    {data.isPrivate && (
                        <div className="absolute top-3 left-3 rounded-lg bg-gray-900/70 px-2 py-1 text-white">
                            <MdLock
                                className="inline-block"
                                size={16}
                            />
                        </div>
                    )}
                    {isPast && (
                        <div className="absolute inset-0 flex items-center justify-center bg-gray-900/50">
                            <div className="rounded-lg bg-gray-900/80 px-4 py-2 font-semibold text-white">
                                {t('workshop_date_passed')}
                            </div>
                        </div>
                    )}
                </div>
                <div
                    className="text-lg font-semibold dark:text-neutral-100"
                    data-cy="workshop-card-title"
                >
                    {data.title}
                </div>
                {data.host && (
                    <div className="flex flex-row items-center gap-2">
                        <Avatar
                            src={data.host.image}
                            size={20}
                        />
                        <div className="text-sm font-medium">
                            {data.host.name}
                        </div>
                    </div>
                )}
                <div className="flex flex-col gap-1 text-sm text-neutral-500">
                    <div className="flex items-center gap-1">
                        <MdCalendarToday size={14} />
                        <span>{formatDate(workshopDate)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MdLocationOn size={14} />
                        <span className="truncate">{data.location}</span>
                    </div>
                    <div className="flex items-center gap-1">
                        <MdPeople size={14} />
                        <span>
                            {participantCount} {t('participants')}
                        </span>
                    </div>
                </div>
                {data.price > 0 && (
                    <div className="text-sm font-semibold text-green-600 dark:text-green-400">
                        €{data.price.toFixed(2)} / {t('person', 'person')}
                    </div>
                )}
            </div>
        </div>
    );
});

export default WorkshopCard;
