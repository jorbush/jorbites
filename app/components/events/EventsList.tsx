'use client';

import { Event } from '@/app/utils/markdownUtils';
import EventCard from './EventCard';
import HorizontalScrollSection from '@/app/components/utils/HorizontalScrollSection';

interface EventsListProps {
    events: Event[];
    title: string;
    emptyMessage?: string;
    priority?: boolean;
}

const EventsList: React.FC<EventsListProps> = ({
    events,
    title,
    emptyMessage = 'No events found',
    priority = false,
}) => {
    return (
        <HorizontalScrollSection
            title={title}
            emptyMessage={emptyMessage}
            hasItems={events.length > 0}
        >
            {events.map((event: Event, index: number) => (
                <div
                    key={event.slug}
                    className="min-w-[280px] flex-shrink-0 sm:min-w-[320px] md:min-w-[350px]"
                >
                    <EventCard
                        event={event}
                        priority={priority && index < 2}
                    />
                </div>
            ))}
        </HorizontalScrollSection>
    );
};

export default EventsList;
