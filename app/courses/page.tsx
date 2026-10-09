import getCurrentUser from '@/app/actions/getCurrentUser';
import getUserCertificates from '@/app/actions/getUserCertificates';
import CoursesClient from './CoursesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Courses | Jorbites',
    description: 'Enhance your cooking event hosting skills and get certified.',
};

const CoursesPage = async () => {
    const currentUser = await getCurrentUser();
    const certificates = currentUser
        ? await getUserCertificates(currentUser.id)
        : [];

    return (
        <CoursesClient
            currentUser={currentUser}
            certificates={certificates}
        />
    );
};

export default CoursesPage;
