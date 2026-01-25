import { Metadata } from 'next';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getWorkshopById from '@/app/actions/getWorkshopById';
import EmptyState from '@/app/components/utils/EmptyState';
import WorkshopClient from '@/app/workshops/[workshopId]/WorkshopClient';
import WorkshopClientSkeleton from '@/app/components/workshops/WorkshopClientSkeleton';
import { Suspense } from 'react';

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
    };
}

const WorkshopPage = async (props: { params: Promise<IParams> }) => {
    const params = await props.params;
    const workshop = await getWorkshopById(params);
    const currentUser = await getCurrentUser();

    if (!workshop) {
        return (
            <EmptyState
                title="Workshop not found"
                subtitle="The workshop you're looking for doesn't exist"
            />
        );
    }

    return (
        <Suspense fallback={<WorkshopClientSkeleton />}>
            <WorkshopClient
                workshop={workshop}
                currentUser={currentUser}
            />
        </Suspense>
    );
};

export default WorkshopPage;
