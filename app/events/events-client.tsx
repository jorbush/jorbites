'use client';

import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import {
    Event,
    categorizeEvents,
    sortEventsByDate,
} from '@/app/utils/markdownUtils';
import EventsList from '@/app/components/events/EventsList';
import { EventCardSkeleton } from '@/app/components/events/EventCard';
import useTheme from '@/app/hooks/useTheme';

const EventsClient = () => {
    const { t, i18n } = useTranslation();
    const [events, setEvents] = useState<{
        current: Event[];
        upcoming: Event[];
        past: Event[];
    }>({
        current: [],
        upcoming: [],
        past: [],
    });
    const [loading, setLoading] = useState(true);

    // Initialize theme
    useTheme();

    useEffect(() => {
        const loadEvents = async () => {
            setLoading(true);

            try {
                // In a client component, we need to fetch the events data
                const response = await fetch(
                    `/api/events?lang=${i18n.language || 'en'}`
                );
                if (!response.ok) throw new Error('Failed to fetch events');

                const eventsData = await response.json();

                // Categorize and sort events
                const categorized = categorizeEvents(eventsData);

                setEvents({
                    current: sortEventsByDate(categorized.current),
                    upcoming: sortEventsByDate(categorized.upcoming),
                    past: sortEventsByDate(categorized.past),
                });
            } catch (error) {
                console.error('Error loading events:', error);
            } finally {
                setLoading(false);
            }
        };

        loadEvents();
    }, [i18n.language]);

    return (
        <Container>
            <div className="px-4 py-8">
                <div className="mb-10 text-center">
                    <h1 className="mb-3 text-3xl font-bold sm:text-4xl dark:text-neutral-100">
                        {t('events')}
                    </h1>
                    <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">
                        {t('events_description') ||
                            'Discover culinary events, workshops, and meetups organized by the Jorbites community.'}
                    </p>
                </div>

                {loading ? (
                    <div className="mb-10">
                        <h2 className="mb-5 text-2xl font-bold dark:text-neutral-100">
                            <div className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        </h2>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                            {[1, 2, 3, 4].map((i) => (
                                <EventCardSkeleton key={i} />
                            ))}
                        </div>
                    </div>
                ) : (
                    <>
                        <EventsList
                            events={events.current}
                            title={t('current_events') || 'Current Events'}
                            emptyMessage={
                                t('no_current_events') ||
                                'No current events found'
                            }
                        />

                        <EventsList
                            events={events.upcoming}
                            title={t('upcoming_events') || 'Upcoming Events'}
                            emptyMessage={
                                t('no_upcoming_events') ||
                                'No upcoming events found'
                            }
                        />

                        <EventsList
                            events={events.past}
                            title={t('past_events') || 'Past Events'}
                            emptyMessage={
                                t('no_past_events') || 'No past events found'
                            }
                        />
                    </>
                )}
            </div>
        </Container>
    );
};

export default EventsClient;
