import getCurrentUser from '@/app/actions/getCurrentUser';
import getCertificateByUserAndCourse from '@/app/actions/getCertificateByUserAndCourse';
import WorkshopsClient from './WorkshopsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Workshops & Classes Course | Jorbites',
    description:
        'Learn how to host cooking workshops, manage student whitelists, request approvals, and join live cooking classes.',
};

const WorkshopsPage = async () => {
    const currentUser = await getCurrentUser();
    const initialCertificate = currentUser
        ? await getCertificateByUserAndCourse(currentUser.id, 'workshops')
        : null;

    return (
        <WorkshopsClient
            currentUser={currentUser}
            initialCertificate={initialCertificate}
        />
    );
};

export default WorkshopsPage;
