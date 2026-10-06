import getCurrentUser from '@/app/actions/getCurrentUser';
import DraftsCourseClient from './DraftsCourseClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recipe Drafts & Collaboration Course | Jorbites',
    description:
        'Master multi-draft management, collaborative recipe creation, step locking, and real-time co-cooking.',
};

const DraftsCoursePage = async () => {
    const currentUser = await getCurrentUser();

    return <DraftsCourseClient currentUser={currentUser} />;
};

export default DraftsCoursePage;
