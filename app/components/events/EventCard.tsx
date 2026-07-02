'use client';

import { Event } from '@/app/utils/markdownUtils';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import { FiCalendar } from 'react-icons/fi';
import Image from 'next/image';
import { formatDateRange } from '@/app/utils/date-utils';

interface EventCardProps {
    event: Event;
    priority?: boolean;
}

export const EventCardSkeleton = () => {
    return (
        <div className="dark:bg-dark overflow-hidden rounded-xl border-[1px] border-neutral-200 bg-white dark:border-neutral-700">
            <div className="relative h-40 w-full animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="p-4">
                <div className="h-[56px] space-y-2">
                    <div className="h-5 w-5/6 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="h-5 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
                <div className="mt-2 flex items-center">
                    <div className="mr-2 size-4 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
            </div>
        </div>
    );
};

const EventCard: React.FC<EventCardProps> = ({ event, priority = false }) => {
    const { push } = useRouter() || {};
    const { i18n, t } = useTranslation();

    // Don't process dates for permanent events
    const isPermanent = event.frontmatter.permanent === true;
    const isRecurrent = event.frontmatter.recurrent === true;

    let dateDisplay;
    if (!isPermanent) {
        if (isRecurrent && event.frontmatter.dayOfMonth) {
            dateDisplay = t('each_month', {
                day: event.frontmatter.dayOfMonth,
            });
        } else {
            dateDisplay = formatDateRange(
                event.frontmatter.date,
                event.frontmatter.endDate,
                i18n.language
            );
        }
    }

    const navigateToEvent = () => {
        push(`/events/${event.slug}`);
    };

    return (
        <div className="dark:bg-dark relative overflow-hidden rounded-xl border-[1px] border-neutral-200 bg-white transition hover:shadow-md dark:border-neutral-700 dark:text-neutral-100">
            <div className="relative h-40 w-full bg-neutral-100 dark:bg-neutral-800">
                <Image
                    src={event.frontmatter.image || '/jorbites-social.jpg'}
                    alt={event.frontmatter.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={priority}
                />
            </div>
            <div className="p-4">
                <h3 className="text-xl font-semibold">
                    <div className="line-clamp-2 h-[56px]">
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                navigateToEvent();
                            }}
                            className="cursor-pointer text-left text-xl font-semibold after:absolute after:inset-0 after:rounded-xl after:content-[''] hover:underline focus:outline-hidden"
                        >
                            {event.frontmatter.title}
                        </button>
                    </div>
                </h3>
                {!isPermanent && dateDisplay && (
                    <div className="mt-2 flex items-center text-sm text-neutral-500 dark:text-neutral-400">
                        <FiCalendar className="mr-2" />
                        <span>{dateDisplay}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EventCard;
