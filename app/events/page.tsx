import { Metadata } from 'next';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EventsClient from './events-client';
import { getCurrentChallenge } from '@/app/actions/weekly-challenge';
import EventsSkeleton from '@/app/components/events/EventsSkeleton';

export const metadata: Metadata = {
    title: 'Eventos | Jorbites',
    description:
        'Descubre eventos de cocina y desafíos donde puedes ganar increíbles recompensas en Jorbites.',
    openGraph: {
        title: 'Eventos de Cocina y Desafíos | Jorbites',
        description:
            'Participa en eventos de cocina, desafíos y concursos para ganar insignias y recompensas exclusivas en Jorbites.',
        type: 'website',
        url: 'https://jorbites.com/events',
    },
    alternates: {
        canonical: '/events',
    },
};

const EventsPage = async () => {
    const challenge = await getCurrentChallenge();

    return (
        <ClientOnly fallback={<EventsSkeleton weeklyChallenge={challenge} />}>
            <EventsClient weeklyChallenge={challenge} />
        </ClientOnly>
    );
};

export default EventsPage;
