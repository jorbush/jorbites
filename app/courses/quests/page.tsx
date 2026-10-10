import getCurrentUser from '@/app/actions/getCurrentUser';
import getCertificateByUserAndCourse from '@/app/actions/getCertificateByUserAndCourse';
import QuestsClient from './QuestsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recipe Quests Course | Jorbites',
    description:
        'Learn how to request recipes, fulfill community quests, link recipes to open requests, and earn badges.',
};

const QuestsPage = async () => {
    const currentUser = await getCurrentUser();
    const initialCertificate = currentUser
        ? await getCertificateByUserAndCourse(currentUser.id, 'quests')
        : null;

    return (
        <QuestsClient
            currentUser={currentUser}
            initialCertificate={initialCertificate}
        />
    );
};

export default QuestsPage;
