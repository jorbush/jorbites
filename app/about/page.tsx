import getCurrentUser from '@/app/actions/getCurrentUser';
import ClientOnly from '@/app/components/utils/ClientOnly';
import AboutClient from './AboutClient';
import AboutClientSkeleton from '@/app/components/about/AboutClientSkeleton';

const AboutPage = async () => {
    const currentUser = await getCurrentUser();

    return (
        <ClientOnly fallback={<AboutClientSkeleton />}>
            <AboutClient currentUser={currentUser} />
        </ClientOnly>
    );
};

export default AboutPage;
