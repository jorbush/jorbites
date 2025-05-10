import { Metadata } from 'next';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EventDetailClient from './event-detail-client';

interface IParams {
    slug: string;
}

export async function generateMetadata({
    params,
}: {
    params: IParams;
}): Promise<Metadata> {
    const { slug } = await params;
    return {
        title: `${slug} | Events | Jorbites`,
        description: 'Event details',
    };
}

const EventPage = async ({ params }: { params: IParams }) => {
    const { slug } = await params;
    return (
        <ClientOnly>
            <EventDetailClient slug={slug} />
        </ClientOnly>
    );
};

export default EventPage;
