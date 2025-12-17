import getCurrentUser from '@/app/actions/getCurrentUser';
import getWorkshops from '@/app/actions/getWorkshops';
import { Metadata } from 'next';
import WorkshopsClient from './WorkshopsClient';

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
        <WorkshopsClient
            currentUser={currentUser}
            upcomingWorkshops={upcomingWorkshops}
            pastWorkshops={pastWorkshops}
        />
    );
};

export default WorkshopsPage;
