import EmptyState from '@/app/components/utils/EmptyState';
import ClientOnly from '@/app/components/utils/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import ProfileClient from '@/app/profile/[userId]/ProfileClient';
import getRecipesByUserId from '@/app/actions/getRecipesByUserId';
import getRecipesForGraph from '@/app/actions/getRecipesForGraph';
import getUserById from '@/app/actions/getUserById';
import ProfileHeader from '@/app/profile/[userId]/ProfileHeader';
import UserStats from '@/app/components/stats/UserStats';
import RecipeContributionGraph from '@/app/components/stats/RecipeContributionGraph';
import RecipeContributionGraphSkeleton from '@/app/components/stats/RecipeContributionGraphSkeleton';
import ProfileHeaderSkeleton from '@/app/components/profile/ProfileHeaderSkeleton';
import UserStatsSkeleton from '@/app/components/stats/UserStatsSkeleton';
import ProfileClientSkeleton from '@/app/components/profile/ProfileClientSkeleton';
import { Metadata } from 'next';
import { OrderByType } from '@/app/utils/filter';

interface IParams {
    userId?: string;
}

interface ISearchParams {
    orderBy?: OrderByType;
    page?: string;
}

export async function generateMetadata(props: {
    params: Promise<IParams>;
}): Promise<Metadata> {
    const params = await props.params;
    const user = await getUserById({ userId: params.userId, withStats: true });

    if (!user) {
        return {
            title: 'Usuario no encontrado | Jorbites',
            description:
                'El usuario solicitado no pudo ser encontrado en Jorbites.',
        };
    }

    const displayName = user.name || 'Usuario';
    const level = user && user.level ? user.level : 1;
    const title = `${displayName} | Perfil de usuario | Jorbites`;
    const description = `${displayName} es un usuario de Jorbites con nivel ${level}. Descubre sus recetas y logros en la comunidad de cocina Jorbites.`;
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [
                {
                    url: user.image || '/jorbites-social.jpg',
                    width: 400,
                    height: 400,
                    alt: displayName,
                },
            ],
            type: 'profile',
        },
        twitter: {
            card: 'summary',
            title,
            description,
            images: [user.image || '/jorbites-social.jpg'],
        },
    };
}

const ProfilePage = async (props: {
    params: Promise<IParams>;
    searchParams: Promise<ISearchParams>;
}) => {
    const params = await props.params;
    const searchParams = await props.searchParams;
    const page = parseInt(searchParams.page || '1');

    // Get paginated recipes for display
    const recipesResponse = await getRecipesByUserId({
        ...params,
        orderBy: searchParams.orderBy,
        page,
        limit: 12,
    });

    // Get all recipes for the contribution graph
    const graphRecipes = await getRecipesForGraph({
        userId: params.userId,
    });

    const user = await getUserById({ userId: params.userId, withStats: true });
    const currentUser = await getCurrentUser();

    if (!user && recipesResponse.recipes.length === 0) {
        return (
            <ClientOnly>
                <EmptyState
                    title="No recipes found"
                    subtitle="Looks like this user has not created recipes."
                />
            </ClientOnly>
        );
    }

    return (
        <>
            <ClientOnly fallback={<ProfileHeaderSkeleton />}>
                <ProfileHeader user={user} />
            </ClientOnly>

            <ClientOnly fallback={<UserStatsSkeleton />}>
                <UserStats user={user} />
            </ClientOnly>

            {graphRecipes.length > 0 && (
                <ClientOnly fallback={<RecipeContributionGraphSkeleton />}>
                    <RecipeContributionGraph recipes={graphRecipes} />
                </ClientOnly>
            )}

            {recipesResponse.recipes.length > 0 && (
                <ClientOnly fallback={<ProfileClientSkeleton />}>
                    <ProfileClient
                        recipes={recipesResponse.recipes}
                        currentUser={currentUser}
                        totalPages={recipesResponse.totalPages}
                        currentPage={recipesResponse.currentPage}
                        searchParams={searchParams}
                    />
                </ClientOnly>
            )}

            {recipesResponse.recipes.length === 0 && (
                <ClientOnly>
                    <EmptyState
                        title="No recipes found"
                        subtitle="Looks like this user has not created recipes."
                    />
                </ClientOnly>
            )}
        </>
    );
};

export default ProfilePage;
