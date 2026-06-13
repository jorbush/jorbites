import { Metadata } from 'next';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EmptyState from '@/app/components/utils/EmptyState';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getListById from '@/app/actions/getListById';
import ListClient from './ListClient';
import { NextResponse } from 'next/server';

interface IParams {
    listId?: string;
}

export async function generateMetadata(props: {
    params: Promise<IParams>;
}): Promise<Metadata> {
    const params = await props.params;
    const listData = await getListById(params);

    if (!listData || listData instanceof NextResponse) {
        return {
            title: 'Lista no encontrada | Jorbites',
        };
    }

    const { list } = listData;

    return {
        title: `${list.name} | Jorbites`,
        description: `Lista de recetas: ${list.name}.`,
    };
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
        if (listData.status === 401) {
            return (
                <ClientOnly>
                    <EmptyState
                        title="Unauthorized"
                        subtitle="This list is private"
                    />
                </ClientOnly>
            );
        }

        return (
            <ClientOnly>
                <EmptyState
                    title="List not found"
                    subtitle="It may have been deleted"
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
