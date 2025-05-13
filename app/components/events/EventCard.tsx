'use client';

import { Event } from '@/app/utils/markdownUtils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { FiCalendar } from 'react-icons/fi';
import Image from 'next/image';

interface EventCardProps {
    event: Event;
}

export const EventCardSkeleton = () => {
    return (
        <div className="dark:bg-dark overflow-hidden rounded-xl border-[1px] border-neutral-200 bg-white dark:border-neutral-700">
            <div className="relative h-40 w-full animate-pulse bg-neutral-200 dark:bg-neutral-700"></div>
            <div className="p-4">
                <div className="h-6 w-3/4 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                <div className="mt-2 flex items-center">
                    <div className="mr-2 h-4 w-4 animate-pulse rounded-full bg-neutral-200 dark:bg-neutral-700"></div>
                    <div className="h-4 w-1/2 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                </div>
            </div>
        </div>
    );
};

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const router = useRouter();

    // Don't process dates for permanent events
    const isPermanent = event.frontmatter.permanent === true;

    let dateDisplay;
    if (!isPermanent) {
        const startDate = new Date(event.frontmatter.date);
        const endDate = new Date(event.frontmatter.endDate);
        const isSameDay = startDate.toDateString() === endDate.toDateString();

        if (isSameDay) {
            dateDisplay = format(startDate, 'PPP');
        } else {
            dateDisplay = `${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`;
        }
    }

    const handleClick = () => {
        router.push(`/events/${event.slug}`);
    };

    return (
        <div
            className="dark:bg-dark cursor-pointer overflow-hidden rounded-xl border-[1px] border-neutral-200 bg-white transition hover:shadow-md dark:border-neutral-700 dark:text-neutral-100"
            onClick={handleClick}
        >
            <div className="relative h-40 w-full">
                <Image
                    src={event.frontmatter.image || '/jorbites-social.jpg'}
                    alt={event.frontmatter.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
            </div>
            <div className="p-4">
                <h3 className="text-xl font-bold">{event.frontmatter.title}</h3>
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
