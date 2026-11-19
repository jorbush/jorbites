import { Metadata } from 'next';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getWorkshopById from '@/app/actions/getWorkshopById';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EmptyState from '@/app/components/utils/EmptyState';
import WorkshopClient from '@/app/workshops/[workshopId]/WorkshopClient';
import WorkshopClientSkeleton from '@/app/components/workshops/WorkshopClientSkeleton';

interface IParams {
    workshopId?: string;
}

export async function generateMetadata(props: {
    params: Promise<IParams>;
}): Promise<Metadata> {
    const params = await props.params;
    const workshop = await getWorkshopById(params);

    if (!workshop) {
        return {
            title: 'Workshop not found | Jorbites',
        };
    }

    if (workshop.isPrivate) {
        return {
            title: 'Private Workshop | Jorbites Workshops',
            robots: {
                index: false,
                follow: false,
            },
        };
    }

    return {
        title: `${workshop.title} | Jorbites Workshops`,
        description:
            workshop.description?.substring(0, 160) ||
            'Workshop hosted on Jorbites',
        openGraph: {
            title: `${workshop.title} | Jorbites Workshops`,
            description:
                workshop.description?.substring(0, 160) ||
                'Workshop hosted on Jorbites',
            images: workshop.imageSrc
                ? [
                      {
                          url: workshop.imageSrc,
                          width: 1200,
                          height: 630,
                          alt: workshop.title,
                      },
                  ]
                : [],
            type: 'article',
        },
        alternates: {
            canonical: `/workshops/${params.workshopId}`,
        },
    };
}

const WorkshopPage = async (props: { params: Promise<IParams> }) => {
    const params = await props.params;
    const [workshop, currentUser] = await Promise.all([
        getWorkshopById(params),
        getCurrentUser(),
    ]);

    if (!workshop) {
        return (
            <ClientOnly>
                <EmptyState
                    title="Workshop not found"
                    subtitle="The workshop you're looking for doesn't exist"
                />
            </ClientOnly>
        );
    }

    if (workshop.isPrivate) {
        const isHost = currentUser?.id === workshop.hostId;
        const isWhitelisted =
            Boolean(currentUser?.id) &&
            Array.isArray(workshop.whitelistedUserIds) &&
            workshop.whitelistedUserIds.includes(currentUser!.id);

        if (!isHost && !isWhitelisted) {
            return (
                <ClientOnly>
                    <EmptyState
                        title="Private Workshop"
                        subtitle="This workshop is private and only visible to invited participants."
                    />
                </ClientOnly>
            );
        }
    }

    return (
        <ClientOnly fallback={<WorkshopClientSkeleton />}>
            <WorkshopClient
                workshop={workshop}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
};

export default WorkshopPage;
