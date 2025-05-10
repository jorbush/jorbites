import { Metadata } from 'next';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EventsClient from './events-client';

export const metadata: Metadata = {
    title: 'Events | Jorbites',
    description:
        'Discover culinary events, workshops, and meetups organized by Jorbites.',
};

const EventsPage = () => {
    return (
        <ClientOnly>
            <EventsClient />
        </ClientOnly>
    );
};

export default EventsPage;
