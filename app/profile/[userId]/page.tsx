import { Metadata } from 'next';
import { OrderByType } from '@/app/utils/filter';
import EmptyState from '@/app/components/utils/EmptyState';
import ClientOnly from '@/app/components/utils/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getRecipesByUserId from '@/app/actions/getRecipesByUserId';
import getUserActivityForGraph from '@/app/actions/getUserActivityForGraph';
import getUserById from '@/app/actions/getUserById';
import getPinnedRecipesByUserId from '@/app/actions/getPinnedRecipesByUserId';
import ProfileHeader from '@/app/profile/[userId]/ProfileHeader';
import ProfileHeaderSkeleton from '@/app/components/profile/ProfileHeaderSkeleton';
import ProfileJsonLd from '@/app/components/profile/ProfileJsonLd';
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

    const [recipesResponse, user, currentUser, pinnedRecipes] =
        await Promise.all([
            getRecipesByUserId({
                userId,
                orderBy: searchParams.orderBy,
                page,
                limit: 12,
            }),
            getUserById({ userId, withStats: true }),
            getCurrentUser(),
            getPinnedRecipesByUserId(userId),
        ]);

    const showActivityGraph =
        user?.profilePreferences?.showActivityGraph ?? true;
    const language = currentUser?.language || user?.language || 'en';

    const [userActivity, blogs] = await Promise.all([
        showActivityGraph
            ? getUserActivityForGraph({ userId })
            : Promise.resolve({
                  recipes: [],
                  comments: [],
                  challengeSubmissions: [],
              }),
        getBlogsByAuthor(userId, user?.name || null, language),
    ]);

    return {
        userId,
        searchParams,
        recipesResponse,
        user,
        currentUser,
        pinnedRecipes,
        blogs,
        userActivity,
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
        user,
        currentUser,
        pinnedRecipes,
        blogs,
        userActivity,
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
                user={user}
                graphRecipes={userActivity.recipes}
                comments={userActivity.comments}
                challengeSubmissions={userActivity.challengeSubmissions}
            />
        </>
    );
};

export default ProfilePage;
