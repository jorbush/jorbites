import { Metadata } from 'next';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EventsClient from './events-client';

export const metadata: Metadata = {
    title: 'Events | Jorbites',
    description: 'Discover cooking events and challenges where you can earn amazing rewards on Jorbites.',
    openGraph: {
        title: 'Cooking Events and Challenges | Jorbites',
        description: 'Participate in cooking events, challenges and contests to earn exclusive badges and rewards on Jorbites.',
        type: 'website',
        url: 'https://jorbites.com/events',
    },
};

const EventsPage = () => {
    return (
        <ClientOnly>
            <EventsClient />
        </ClientOnly>
    );
};

export default EventsPage;
