import getCurrentUser from '@/app/actions/getCurrentUser';
import WorkshopsClient from './WorkshopsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Workshops & Classes Course | Jorbites',
    description:
        'Learn how to host cooking workshops, manage student whitelists, request approvals, and join live cooking classes.',
};

const WorkshopsPage = async () => {
    const currentUser = await getCurrentUser();

    return <WorkshopsClient currentUser={currentUser} />;
};

export default WorkshopsPage;
