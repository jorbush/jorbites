import getCurrentUser from '@/app/actions/getCurrentUser';
import CoursesClient from './CoursesClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Courses | Jorbites',
    description: 'Enhance your cooking event hosting skills and get certified.',
};

const CoursesPage = async () => {
    const currentUser = await getCurrentUser();

    return <CoursesClient currentUser={currentUser} />;
};

export default CoursesPage;
