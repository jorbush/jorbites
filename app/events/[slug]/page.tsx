import { Metadata } from 'next';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EventDetailClient from './event-detail-client';

interface IParams {
    slug: string;
}

interface PageProps {
    params: Promise<IParams>;
}

export async function generateMetadata(props: {
    params: Promise<IParams>;
}): Promise<Metadata> {
    const params = await props.params;
    return {
        title: `${params.slug} | Events | Jorbites`,
        description: 'Event details',
    };
}

const EventPage = async (props: PageProps) => {
    const params = await props.params;
    return (
        <ClientOnly>
            <EventDetailClient slug={params.slug} />
        </ClientOnly>
    );
};

export default EventPage;
