import { Metadata } from 'next';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EventsClient from './events-client';

export const metadata: Metadata = {
    title: 'Events | Jorbites',
    description: 'Discover events where you can earn amazing rewards.',
};

const EventsPage = () => {
    return (
        <ClientOnly>
            <EventsClient />
        </ClientOnly>
    );
};

export default EventsPage;
