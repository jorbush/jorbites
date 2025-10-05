'use client';

import { Event } from '@/app/utils/markdownUtils';
import EventCard from './EventCard';

interface EventsListProps {
    events: Event[];
    title: string;
    emptyMessage?: string;
}

const EventsList: React.FC<EventsListProps> = ({
    events,
    title,
    emptyMessage = 'No events found',
}) => {
    return (
        <div className="mb-10">
            <h2 className="mb-5 text-2xl font-bold dark:text-neutral-100">
                {title}
            </h2>

            {events.length === 0 ? (
                <p className="text-neutral-500 dark:text-neutral-400">
                    {emptyMessage}
                </p>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {events.map((event: Event) => (
                        <EventCard
                            key={event.slug}
                            event={event}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default EventsList;
