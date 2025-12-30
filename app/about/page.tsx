import getCurrentUser from '@/app/actions/getCurrentUser';
import AboutClient from './AboutClient';

const AboutPage = async () => {
    const currentUser = await getCurrentUser();

    return <AboutClient currentUser={currentUser} />;
};

export default AboutPage;
