'use client';

import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Event } from '@/app/utils/markdownUtils';
import EventDetail from '@/app/components/events/EventDetail';
import { useRouter } from 'next/navigation';
import useTheme from '@/app/hooks/useTheme';

interface EventDetailClientProps {
    slug: string;
}

const EventDetailClient: React.FC<EventDetailClientProps> = ({ slug }) => {
    const { t, i18n } = useTranslation();
    const router = useRouter();
    const [event, setEvent] = useState<Event | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Initialize theme
    useTheme();

    useEffect(() => {
        const loadEvent = async () => {
            setLoading(true);
            setError(null);

            try {
                // In a client component, we need to fetch the event data
                const response = await fetch(
                    `/api/events/${slug}?lang=${i18n.language || 'en'}`
                );

                if (!response.ok) {
                    if (response.status === 404) {
                        setError('Event not found');
                    } else {
                        throw new Error('Failed to fetch event');
                    }
                } else {
                    const eventData = await response.json();
                    setEvent(eventData);
                }
            } catch (error) {
                console.error('Error loading event:', error);
                setError('Failed to load event');
            } finally {
                setLoading(false);
            }
        };

        loadEvent();
    }, [slug, i18n.language]);

    return (
        <Container>
            <div className="px-4 py-8">
                {loading ? (
                    <div className="animate-pulse">
                        <div className="mb-4 h-10 w-3/4 rounded bg-neutral-200 dark:bg-neutral-800" />
                        <div className="mb-2 h-6 w-1/2 rounded bg-neutral-200 dark:bg-neutral-800" />
                        <div className="mb-6 h-6 w-1/3 rounded bg-neutral-200 dark:bg-neutral-800" />
                        <div className="h-64 w-full rounded bg-neutral-200 dark:bg-neutral-800" />
                    </div>
                ) : error ? (
                    <div className="py-10 text-center">
                        <h2 className="mb-4 text-2xl font-bold text-red-500 dark:text-red-400">
                            {error}
                        </h2>
                        <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                            {t('event_not_found_message') ||
                                "The event you're looking for could not be found."}
                        </p>
                        <button
                            onClick={() => router.push('/events')}
                            className="bg-green-450 rounded-lg px-4 py-2 text-black"
                        >
                            {t('back_to_events') || 'Back to Events'}
                        </button>
                    </div>
                ) : event ? (
                    <EventDetail event={event} />
                ) : null}
            </div>
        </Container>
    );
};

export default EventDetailClient;
