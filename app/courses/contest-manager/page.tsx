import getCurrentUser from '@/app/actions/getCurrentUser';
import getCertificateByUserAndCourse from '@/app/actions/getCertificateByUserAndCourse';
import ContestManagerClient from './ContestManagerClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contest Manager Course | Jorbites',
    description: 'Learn how to organize cooking contests and earn your badge.',
};

const ContestManagerPage = async () => {
    const currentUser = await getCurrentUser();
    const initialCertificate = currentUser
        ? await getCertificateByUserAndCourse(currentUser.id, 'contest-manager')
        : null;

    return (
        <ContestManagerClient
            currentUser={currentUser}
            initialCertificate={initialCertificate}
        />
    );
};

export default ContestManagerPage;
