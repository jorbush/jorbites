import { Metadata } from 'next';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EventDetailClient from './event-detail-client';
import { getEventBySlug } from '@/app/utils/event-utils';

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
    const event = await getEventBySlug(params.slug);

    if (!event) {
        return {
            title: `Evento No Encontrado | Jorbites`,
            description: 'El evento solicitado no pudo ser encontrado',
        };
    }

    return {
        title: `${event.frontmatter.title} | Eventos | Jorbites`,
        description: event.frontmatter.description || 'Detalles del evento',
        openGraph: {
            title: `${event.frontmatter.title} | Jorbites`,
            description: event.frontmatter.description,
            images: [
                {
                    url: event.frontmatter.image,
                    width: 1200,
                    height: 630,
                    alt: event.frontmatter.title,
                },
            ],
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${event.frontmatter.title} | Jorbites`,
            description: event.frontmatter.description,
            images: [event.frontmatter.image],
        },
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
