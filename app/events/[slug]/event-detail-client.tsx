'use client';

import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from 'react';
import { Event } from '@/app/utils/markdownUtils';
import EventDetail, {
    EventDetailSkeleton,
} from '@/app/components/events/EventDetail';
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
    const containerRef = useRef<HTMLDivElement>(null);

    // Initialize theme
    useTheme();

    // Focus management for PWA
    useEffect(() => {
        // Set focus to the container when component mounts
        if (containerRef.current) {
            containerRef.current.focus();
        }

        // Register visibility change handler for PWA
        const handleVisibilityChange = () => {
            if (
                document.visibilityState === 'visible' &&
                containerRef.current
            ) {
                containerRef.current.focus();
                // Force a repaint to fix blank screen issues
                document.body.style.display = 'none';
                // Reading this property forces a repaint
                void document.body.offsetHeight;
                document.body.style.display = '';
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);

        return () => {
            document.removeEventListener(
                'visibilitychange',
                handleVisibilityChange
            );
        };
    }, []);

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
            {loading ? (
                <EventDetailSkeleton />
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
        </Container>
    );
};

export default EventDetailClient;
