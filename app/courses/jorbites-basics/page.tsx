import getCurrentUser from '@/app/actions/getCurrentUser';
import JorbitesBasicsClient from './JorbitesBasicsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Jorbites Basics Course | Jorbites',
    description:
        'Master the fundamentals of Jorbites: searching recipes, liking and pinning content, organizing custom lists, and managing all profile preferences.',
};

const JorbitesBasicsPage = async () => {
    const currentUser = await getCurrentUser();

    return <JorbitesBasicsClient currentUser={currentUser} />;
};

export default JorbitesBasicsPage;
