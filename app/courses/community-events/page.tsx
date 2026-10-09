import getCurrentUser from '@/app/actions/getCurrentUser';
import getCertificateByUserAndCourse from '@/app/actions/getCertificateByUserAndCourse';
import CommunityEventsClient from './CommunityEventsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community Events Course | Jorbites',
    description:
        'Learn how to find, join, and participate in community events and challenges, and earn your badge.',
};

const CommunityEventsPage = async () => {
    const currentUser = await getCurrentUser();
    const initialCertificate = currentUser
        ? await getCertificateByUserAndCourse(
              currentUser.id,
              'community-events'
          )
        : null;

    return (
        <CommunityEventsClient
            currentUser={currentUser}
            initialCertificate={initialCertificate}
        />
    );
};

export default CommunityEventsPage;
