import ClientOnly from '@/app/components/utils/ClientOnly';
import EmptyState from '@/app/components/utils/EmptyState';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getListById from '@/app/actions/getListById';
import ListClient from './ListClient';

interface IParams {
    listId?: string;
}

const ListPage = async (props: { params: Promise<IParams> }) => {
    const params = await props.params;
    const currentUser = await getCurrentUser();

    if (!params.listId) {
        return (
            <ClientOnly>
                <EmptyState
                    title="List not found"
                    subtitle="Invalid ID"
                />
            </ClientOnly>
        );
    }

    const listData = await getListById(params);

    if (!listData) {
        return (
            <ClientOnly>
                <EmptyState
                    title="List not found"
                    subtitle="It may have been deleted"
                />
            </ClientOnly>
        );
    }

    if ('error' in listData) {
        return (
            <ClientOnly>
                <EmptyState
                    title="Unauthorized"
                    subtitle="This list is private"
                />
            </ClientOnly>
        );
    }

    const { list, recipes } = listData;

    return (
        <ClientOnly>
            <ListClient
                list={list}
                recipes={recipes}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
};

export default ListPage;
