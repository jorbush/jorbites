import EmptyState from '@/app/components/utils/EmptyState';
import ClientOnly from '@/app/components/utils/ClientOnly';
import Container from '@/app/components/utils/Container';
import Pagination from '@/app/components/navigation/Pagination';

import getCurrentUser from '@/app/actions/getCurrentUser';
import getFavoriteRecipes from '@/app/actions/getFavoriteRecipes';

import FavoritesClient from './FavoritesClient';

interface FavoritesPageProps {
    searchParams: { [key: string]: string | string[] | undefined };
}

const FavoritesPage = async ({ searchParams }: FavoritesPageProps) => {
    const response = await getFavoriteRecipes(searchParams);
    const currentUser = await getCurrentUser();

    if (response.error || !response.data) {
        return (
            <ClientOnly>
                <EmptyState
                    title="Something went wrong"
                    subtitle="Please try again later"
                />
            </ClientOnly>
        );
    }

    if (response.data.recipes.length === 0) {
        return (
            <ClientOnly>
                <EmptyState
                    title="No favorites found"
                    subtitle="Looks like you have no favorite recipes."
                />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <Container>
                <FavoritesClient
                    recipes={response.data.recipes}
                    currentUser={currentUser}
                />
                <Pagination
                    totalPages={response.data.totalPages || 1}
                    currentPage={response.data.currentPage || 1}
                    searchParams={searchParams}
                />
            </Container>
        </ClientOnly>
    );
};

export default FavoritesPage;
