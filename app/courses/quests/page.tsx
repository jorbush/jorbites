import getCurrentUser from '@/app/actions/getCurrentUser';
import QuestsClient from './QuestsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recipe Quests Course | Jorbites',
    description:
        'Learn how to request recipes, fulfill community quests, link recipes to open requests, and earn badges.',
};

const QuestsPage = async () => {
    const currentUser = await getCurrentUser();

    return <QuestsClient currentUser={currentUser} />;
};

export default QuestsPage;
