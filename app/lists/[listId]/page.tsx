import ClientOnly from '@/app/components/utils/ClientOnly';
import EmptyState from '@/app/components/utils/EmptyState';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getListById from '@/app/actions/getListById';
import ListClient from './ListClient';
import { NextResponse } from 'next/server';

interface IParams {
    listId?: string;
}

const ListPage = async (props: { params: Promise<IParams> }) => {
    const [params, currentUser] = await Promise.all([
        props.params,
        getCurrentUser(),
    ]);

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

    if (listData instanceof NextResponse) {
        const errorData = await listData.json();
        const { code } = errorData;

        let title = 'Error';
        let subtitle = 'An unexpected error occurred';

        if (code === 'UNAUTHORIZED') {
            title = 'Unauthorized';
            subtitle = 'This list is private';
        } else if (code === 'NOT_FOUND') {
            title = 'List not found';
            subtitle = 'It may have been deleted';
        } else if (code === 'BAD_REQUEST') {
            title = 'List not found';
            subtitle = 'Invalid ID';
        }

        return (
            <ClientOnly>
                <EmptyState
                    title={title}
                    subtitle={subtitle}
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
