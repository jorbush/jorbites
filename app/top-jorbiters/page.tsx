import getCurrentUser from '@/app/actions/getCurrentUser';
import EmptyState from '@/app/components/utils/EmptyState';
import getTopJorbiters from '../actions/getTopJorbiters';
import TopJorbitersClient from './TopJorbitersClient';
import TopJorbitersClientSkeleton from '@/app/components/top-jorbiters/TopJorbitersClientSkeleton';
import { Suspense } from 'react';

const TopJorbitersPage = async () => {
    const currentUser = await getCurrentUser();
    const topJorbiters = await getTopJorbiters();

    if (!topJorbiters) {
        return <EmptyState />;
    }

    return (
        <Suspense fallback={<TopJorbitersClientSkeleton />}>
            <TopJorbitersClient
                currentUser={currentUser}
                topJorbiters={topJorbiters}
            />
        </Suspense>
    );
};

export default TopJorbitersPage;
