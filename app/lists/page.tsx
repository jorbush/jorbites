import ClientOnly from '@/app/components/utils/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getLists from '@/app/actions/getLists';
import ListsClient from '@/app/lists/ListsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Listas de Recetas | Jorbites',
    description:
        'Organiza tus recetas favoritas en listas y descubre listas públicas de la comunidad.',
    alternates: {
        canonical: '/lists',
    },
};

const ListsPage = async () => {
    const [currentUser, { myLists, communityLists }] = await Promise.all([
        getCurrentUser(),
        getLists(),
    ]);

    return (
        <ClientOnly>
            <ListsClient
                initialMyLists={myLists}
                initialCommunityLists={communityLists}
                currentUser={currentUser}
            />
        </ClientOnly>
    );
};

export default ListsPage;
