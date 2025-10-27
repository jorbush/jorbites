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
import WeeklyChallenge from '@/app/components/events/WeeklyChallenge';
import { FcCalendar } from 'react-icons/fc';
import SectionHeader from '@/app/components/utils/SectionHeader';

const EventsClient = () => {
    const { t, i18n } = useTranslation();
    const [events, setEvents] = useState<{
        current: Event[];
        upcoming: Event[];
        past: Event[];
        permanent: Event[];
    }>({
        current: [],
        upcoming: [],
        past: [],
        permanent: [],
    });
    const [loading, setLoading] = useState(true);

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
                    permanent: categorized.permanent,
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
                <SectionHeader
                    icon={FcCalendar}
                    title={`${t('events')} 🏆`}
                    description={t('events_description')}
                />

                <WeeklyChallenge />

                {loading ? (
                    <div className="mb-10">
                        <h2 className="mb-5 text-2xl font-bold dark:text-neutral-100">
                            <div className="h-8 w-40 animate-pulse rounded bg-neutral-200 dark:bg-neutral-700"></div>
                        </h2>
                        <div className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-2">
                            {[1, 2, 3, 4].map((i) => (
                                <div
                                    key={i}
                                    className="min-w-[280px] flex-shrink-0 sm:min-w-[320px] md:min-w-[350px]"
                                >
                                    <EventCardSkeleton />
                                </div>
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
                            events={events.permanent}
                            title={t('permanent_events') || 'Permanent Events'}
                            emptyMessage={
                                t('no_permanent_events') ||
                                'No permanent events found'
                            }
                        />

                        <EventsList
                            events={events.upcoming.filter((event: Event) => {
                                // Show only upcoming events within the next month
                                const eventDate = new Date(
                                    event.frontmatter.date
                                );
                                const oneMonthFromNow = new Date();
                                oneMonthFromNow.setMonth(
                                    oneMonthFromNow.getMonth() + 1
                                );
                                return eventDate <= oneMonthFromNow;
                            })}
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
