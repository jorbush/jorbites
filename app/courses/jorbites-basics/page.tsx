import getCurrentUser from '@/app/actions/getCurrentUser';
import getCertificateByUserAndCourse from '@/app/actions/getCertificateByUserAndCourse';
import JorbitesBasicsClient from './JorbitesBasicsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Jorbites Basics Course | Jorbites',
    description:
        'Master the fundamentals of Jorbites: searching recipes, liking and pinning content, organizing custom lists, and managing all profile preferences.',
};

const JorbitesBasicsPage = async () => {
    const currentUser = await getCurrentUser();
    const initialCertificate = currentUser
        ? await getCertificateByUserAndCourse(currentUser.id, 'jorbites-basics')
        : null;

    return (
        <JorbitesBasicsClient
            currentUser={currentUser}
            initialCertificate={initialCertificate}
        />
    );
};

export default JorbitesBasicsPage;
