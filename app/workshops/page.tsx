import getCurrentUser from '@/app/actions/getCurrentUser';
import getWorkshops from '@/app/actions/getWorkshops';
import ClientOnly from '@/app/components/utils/ClientOnly';
import { Metadata } from 'next';
import WorkshopsClient from './WorkshopsClient';
import WorkshopsListSkeleton from '@/app/components/workshops/WorkshopsListSkeleton';

export const metadata: Metadata = {
    title: 'Workshops | Jorbites',
    description: 'Discover and join cooking workshops in your area',
};

const WorkshopsPage = async () => {
    const currentUser = await getCurrentUser();

    const allWorkshopsResponse = await getWorkshops();

    const allWorkshops = allWorkshopsResponse.data?.workshops || [];
    const now = new Date();

    const upcomingWorkshops = allWorkshops.filter(
        (workshop) => new Date(workshop.date) >= now
    );

    const pastWorkshops = allWorkshops.filter(
        (workshop) => new Date(workshop.date) < now
    );

    return (
        <ClientOnly fallback={<WorkshopsListSkeleton />}>
            <WorkshopsClient
                currentUser={currentUser}
                upcomingWorkshops={upcomingWorkshops}
                pastWorkshops={pastWorkshops}
            />
        </ClientOnly>
    );
};

export default WorkshopsPage;
