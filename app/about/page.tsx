import getCurrentUser from '@/app/actions/getCurrentUser';
import AboutClient from './AboutClient';
import { Suspense } from 'react';
import AboutClientSkeleton from '@/app/components/about/AboutClientSkeleton';

const AboutPage = async () => {
    const currentUser = await getCurrentUser();

    return (
        <Suspense fallback={<AboutClientSkeleton />}>
            <AboutClient currentUser={currentUser} />
        </Suspense>
    );
};

export default AboutPage;
