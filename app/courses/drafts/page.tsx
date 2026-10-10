import getCurrentUser from '@/app/actions/getCurrentUser';
import getCertificateByUserAndCourse from '@/app/actions/getCertificateByUserAndCourse';
import DraftsCourseClient from './DraftsCourseClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recipe Drafts & Collaboration Course | Jorbites',
    description:
        'Master multi-draft management, collaborative recipe creation, step locking, and real-time co-cooking.',
};

const DraftsCoursePage = async () => {
    const currentUser = await getCurrentUser();
    const initialCertificate = currentUser
        ? await getCertificateByUserAndCourse(currentUser.id, 'drafts')
        : null;

    return (
        <DraftsCourseClient
            currentUser={currentUser}
            initialCertificate={initialCertificate}
        />
    );
};

export default DraftsCoursePage;
