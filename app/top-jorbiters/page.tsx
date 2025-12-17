import getCurrentUser from '@/app/actions/getCurrentUser';
import EmptyState from '@/app/components/utils/EmptyState';
import getTopJorbiters from '../actions/getTopJorbiters';
import TopJorbitersClient from './TopJorbitersClient';

const TopJorbitersPage = async () => {
    const currentUser = await getCurrentUser();
    const topJorbiters = await getTopJorbiters();

    if (!topJorbiters) {
        return <EmptyState />;
    }

    return (
        <TopJorbitersClient
            currentUser={currentUser}
            topJorbiters={topJorbiters}
        />
    );
};

export default TopJorbitersPage;
