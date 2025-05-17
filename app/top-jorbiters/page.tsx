import getCurrentUser from '@/app/actions/getCurrentUser';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EmptyState from '@/app/components/utils/EmptyState';
import getTopJorbiters from '../actions/getTopJorbiters';
import TopJorbitersClient from './TopJorbitersClient';
import TopJorbitersClientSkeleton from '@/app/components/top-jorbiters/TopJorbitersClientSkeleton';

const TopJorbitersPage = async () => {
    const currentUser = await getCurrentUser();
    const topJorbiters = await getTopJorbiters();

    if (!topJorbiters) {
        return (
            <ClientOnly>
                <EmptyState />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly fallback={<TopJorbitersClientSkeleton />}>
            <TopJorbitersClient
                currentUser={currentUser}
                topJorbiters={topJorbiters}
            />
        </ClientOnly>
    );
};

export default TopJorbitersPage;
