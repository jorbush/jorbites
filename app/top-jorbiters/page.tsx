import getCurrentUser from '@/app/actions/getCurrentUser';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EmptyState from '@/app/components/utils/EmptyState';
import getTopJorbiters from '../actions/getTopJorbiters';
import TopJorbitersClient from './TopJorbitersClient';
import TopJorbitersClientSkeleton from '@/app/components/top-jorbiters/TopJorbitersClientSkeleton';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Top Jorbiters | Jorbites',
    description:
        'Descubre a los cocineros más activos y populares de la comunidad Jorbites.',
};

const TopJorbitersPage = async () => {
    const [currentUser, topJorbiters] = await Promise.all([
        getCurrentUser(),
        getTopJorbiters(),
    ]);

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
