import EmptyState from '@/app/components/utils/EmptyState';
import ClientOnly from '@/app/components/utils/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getLists from '@/app/actions/getLists';
import ListsClient from '@/app/lists/ListsClient';

const ListsPage = async () => {
    const [currentUser, lists] = await Promise.all([
        getCurrentUser(),
        getLists(),
    ]);

    if (!currentUser) {
        return (
            <ClientOnly>
                <EmptyState
                    title="Unauthorized"
                    subtitle="Please login"
                />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <ListsClient initialLists={lists} />
        </ClientOnly>
    );
};

export default ListsPage;
