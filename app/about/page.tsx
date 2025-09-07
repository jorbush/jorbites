import getCurrentUser from '@/app/actions/getCurrentUser';
import ClientOnly from '@/app/components/utils/ClientOnly';
import AboutClient from './AboutClient';

const AboutPage = async () => {
    const currentUser = await getCurrentUser();

    return (
        <ClientOnly>
            <AboutClient currentUser={currentUser} />
        </ClientOnly>
    );
};

export default AboutPage;
