'use client';

import Container from '@/app/components/utils/Container';
import { useTranslation } from 'react-i18next';
import { useMemo } from 'react';
import useSWR from 'swr';
import { fetcher } from '@/app/utils/fetcher';
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
    const { push } = useRouter() || {};

    // Initialize theme
    useTheme();

    const {
        data: event,
        error: eventError,
        isLoading: loading,
    } = useSWR<Event>(
        `/api/events/${slug}?lang=${i18n.language || 'en'}`,
        fetcher
    );

    const error = useMemo(() => {
        if (!eventError) return null;
        if ((eventError as any).status === 404) return 'Event not found';
        return 'Failed to load event';
    }, [eventError]);

    return (
        <Container>
            {loading ? (
                <EventDetailSkeleton />
            ) : error ? (
                <div className="py-10 text-center">
                    <h2 className="mb-4 text-2xl font-semibold text-red-500 dark:text-red-400">
                        {error}
                    </h2>
                    <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                        {t('event_not_found_message') ||
                            "The event you're looking for could not be found."}
                    </p>
                    <button
                        type="button"
                        onClick={() => push('/events')}
                        className="bg-green-450 cursor-pointer rounded-lg px-4 py-2 text-black"
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
