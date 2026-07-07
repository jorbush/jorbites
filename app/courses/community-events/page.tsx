import getCurrentUser from '@/app/actions/getCurrentUser';
import CommunityEventsClient from './CommunityEventsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Community Events Course | Jorbites',
    description:
        'Learn how to find, join, and participate in community events and challenges, and earn your badge.',
};

const CommunityEventsPage = async () => {
    const currentUser = await getCurrentUser();

    return <CommunityEventsClient currentUser={currentUser} />;
};

export default CommunityEventsPage;
