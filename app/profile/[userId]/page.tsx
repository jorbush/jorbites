import { Metadata } from 'next';
import { OrderByType } from '@/app/utils/filter';
import EmptyState from '@/app/components/utils/EmptyState';
import ClientOnly from '@/app/components/utils/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getRecipesByUserId from '@/app/actions/getRecipesByUserId';
import getRecipesForGraph from '@/app/actions/getRecipesForGraph';
import getUserById from '@/app/actions/getUserById';
import getPinnedRecipesByUserId from '@/app/actions/getPinnedRecipesByUserId';
import ProfileHeader from '@/app/profile/[userId]/ProfileHeader';
import UserStats from '@/app/components/stats/UserStats';
import ProfileHeaderSkeleton from '@/app/components/profile/ProfileHeaderSkeleton';
import UserStatsSkeleton from '@/app/components/stats/UserStatsSkeleton';
import ProfileJsonLd from '@/app/components/profile/ProfileJsonLd';
import ProfileContributionGraph from '@/app/components/profile/ProfileContributionGraph';
import ProfileContentSection from '@/app/components/profile/ProfileContentSection';
import { getBlogsByAuthor } from '@/app/utils/blog-utils';

interface IParams {
    userId?: string;
}

interface ISearchParams {
    orderBy?: OrderByType;
    page?: string;
    tab?: string;
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
    const description = user.bio
        ? `${displayName}: ${user.bio}`
        : `${displayName} es un usuario de Jorbites con nivel ${level}. Descubre sus recetas y logros en la comunidad de cocina Jorbites.`;
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
        alternates: {
            canonical: `/profile/${params.userId}`,
        },
    };
}

async function loadProfilePageData(
    paramsPromise: Promise<IParams>,
    searchParamsPromise: Promise<ISearchParams>
) {
    const [params, searchParams] = await Promise.all([
        paramsPromise,
        searchParamsPromise,
    ]);
    const userId = params.userId || '';
    const page = parseInt(searchParams.page || '1', 10);

    const [recipesResponse, graphRecipes, user, currentUser, pinnedRecipes] =
        await Promise.all([
            getRecipesByUserId({
                userId,
                orderBy: searchParams.orderBy,
                page,
                limit: 12,
            }),
            getRecipesForGraph({ userId }),
            getUserById({ userId, withStats: true }),
            getCurrentUser(),
            getPinnedRecipesByUserId(userId),
        ]);

    const language = currentUser?.language || user?.language || 'en';
    const blogs = await getBlogsByAuthor(userId, user?.name || null, language);

    return {
        userId,
        searchParams,
        recipesResponse,
        graphRecipes,
        user,
        currentUser,
        pinnedRecipes,
        blogs,
    };
}

const ProfilePage = async (props: {
    params: Promise<IParams>;
    searchParams: Promise<ISearchParams>;
}) => {
    const data = await loadProfilePageData(props.params, props.searchParams);
    const {
        userId,
        searchParams,
        recipesResponse,
        graphRecipes,
        user,
        currentUser,
        pinnedRecipes,
        blogs,
    } = data;

    const hasAnyContent =
        Boolean(user) || recipesResponse.recipes.length > 0 || blogs.length > 0;

    if (!hasAnyContent) {
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
            <ProfileJsonLd user={user} />

            <ClientOnly fallback={<ProfileHeaderSkeleton />}>
                <ProfileHeader
                    user={user}
                    currentUser={currentUser}
                />
            </ClientOnly>

            <ClientOnly fallback={<UserStatsSkeleton />}>
                <UserStats user={user} />
            </ClientOnly>

            <ProfileContributionGraph recipes={graphRecipes} />

            <ProfileContentSection
                userId={userId}
                tab={searchParams.tab}
                recipes={recipesResponse.recipes}
                pinnedRecipes={pinnedRecipes}
                currentUser={currentUser}
                totalPages={recipesResponse.totalPages}
                currentPage={recipesResponse.currentPage}
                totalRecipes={recipesResponse.totalRecipes}
                searchParams={searchParams}
                blogs={blogs}
            />
        </>
    );
};

export default ProfilePage;
