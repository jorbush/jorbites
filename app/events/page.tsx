import { Metadata } from 'next';
import EventsClient from './events-client';

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
};

const EventsPage = () => {
    return <EventsClient />;
};

export default EventsPage;
