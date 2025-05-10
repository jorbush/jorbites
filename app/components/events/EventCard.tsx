'use client';

import { Event } from '@/app/utils/markdownUtils';
import { format } from 'date-fns';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';

interface EventCardProps {
    event: Event;
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
    const router = useRouter();
    const { t } = useTranslation();

    const startDate = new Date(event.frontmatter.date);
    const endDate = new Date(event.frontmatter.endDate);

    const isSameDay = startDate.toDateString() === endDate.toDateString();

    let dateDisplay;
    if (isSameDay) {
        dateDisplay = format(startDate, 'PPP');
    } else {
        dateDisplay = `${format(startDate, 'PPP')} - ${format(endDate, 'PPP')}`;
    }

    const handleClick = () => {
        router.push(`/events/${event.slug}`);
    };

    return (
        <div
            className="dark:bg-dark cursor-pointer rounded-xl border-[1px] border-neutral-200 bg-white p-5 transition hover:shadow-md dark:border-neutral-700 dark:text-neutral-100"
            onClick={handleClick}
        >
            <div className="flex flex-col gap-2">
                <h3 className="text-xl font-bold">{event.frontmatter.title}</h3>
                <p className="text-neutral-500 dark:text-neutral-400">
                    {event.frontmatter.description}
                </p>

                <div className="mt-2 flex flex-col">
                    <span className="flex items-center gap-1 text-sm">
                        <span className="font-semibold">{t('date')}:</span>{' '}
                        {dateDisplay}
                    </span>
                    <span className="flex items-center gap-1 text-sm">
                        <span className="font-semibold">{t('location')}:</span>{' '}
                        {event.frontmatter.location}
                    </span>
                </div>
            </div>
        </div>
    );
};

export default EventCard;
