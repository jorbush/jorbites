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
import getProfileCollections from '@/app/actions/getProfileCollections';
import { getBlogsByAuthor } from '@/app/utils/blog-utils';
import { getProfilePreferences } from '@/app/utils/profile-utils';
import { ProfileLoadedCollections, ProfilePreferences } from '@/app/types';

interface IParams {
    userId?: string;
}

interface ISearchParams {
    orderBy?: OrderByType;
    page?: string;
    tab?: string;
    search?: string;
}

const normalizeRequestedTab = (tab?: string): string => {
    if (tab === 'articles') return 'blogs';
    return tab || '';
};

const EMPTY_COLLECTIONS = {
    lists: [],
    quests: [],
    plannings: [],
};

const ALL_UNLOADED: ProfileLoadedCollections = {
    lists: false,
    quests: false,
    plannings: false,
};

async function resolveProfileCollections({
    userId,
    requestedTab,
    isOwnProfile,
    preferences,
    recipesCount,
    blogsCount,
    hasSearch,
}: {
    userId: string;
    requestedTab: string;
    isOwnProfile: boolean;
    preferences: Required<ProfilePreferences>;
    recipesCount: number;
    blogsCount: number;
    hasSearch: boolean;
}) {
    if (requestedTab === 'lists' && preferences.showLists) {
        const collections = await getProfileCollections({
            userId,
            includePrivate: isOwnProfile,
            includeLists: true,
            includeQuests: false,
            includePlannings: false,
        });
        return {
            collections,
            loadedCollections: { ...ALL_UNLOADED, lists: true },
        };
    }

    if (requestedTab === 'quests' && preferences.showQuests) {
        const collections = await getProfileCollections({
            userId,
            includePrivate: isOwnProfile,
            includeLists: false,
            includeQuests: true,
            includePlannings: false,
        });
        return {
            collections,
            loadedCollections: { ...ALL_UNLOADED, quests: true },
        };
    }

    if (requestedTab === 'plannings' && preferences.showPlannings) {
        const collections = await getProfileCollections({
            userId,
            includePrivate: isOwnProfile,
            includeLists: false,
            includeQuests: false,
            includePlannings: true,
        });
        return {
            collections,
            loadedCollections: { ...ALL_UNLOADED, plannings: true },
        };
    }

    const shouldFallbackLoad =
        recipesCount === 0 &&
        blogsCount === 0 &&
        !hasSearch &&
        requestedTab !== 'blogs';

    if (shouldFallbackLoad) {
        const collections = await getProfileCollections({
            userId,
            includePrivate: isOwnProfile,
            includeLists: preferences.showLists,
            includeQuests: preferences.showQuests,
            includePlannings: preferences.showPlannings,
        });
        return {
            collections,
            loadedCollections: {
                lists: preferences.showLists,
                quests: preferences.showQuests,
                plannings: preferences.showPlannings,
            },
        };
    }

    return {
        collections: EMPTY_COLLECTIONS,
        loadedCollections: ALL_UNLOADED,
    };
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
    const parsedPage = parseInt(searchParams.page || '1', 10);
    const page = Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage;
    const search = searchParams.search;

    const [recipesResponse, user, currentUser, pinnedRecipes] =
        await Promise.all([
            getRecipesByUserId({
                userId,
                orderBy: searchParams.orderBy,
                page,
                limit: 12,
                ...(search ? { search } : {}),
            }),
            getUserById({ userId, withStats: true }),
            getCurrentUser(),
            getPinnedRecipesByUserId(userId),
        ]);

    const preferences = getProfilePreferences(user);
    const isOwnProfile = Boolean(currentUser && currentUser.id === userId);
    const language = currentUser?.language || user?.language || 'en';
    const requestedTab = normalizeRequestedTab(searchParams.tab);

    const [userActivity, blogs] = await Promise.all([
        preferences.showActivityGraph
            ? getUserActivityForGraph({ userId })
            : Promise.resolve({
                  recipes: [],
                  comments: [],
                  challengeSubmissions: [],
              }),
        preferences.showArticles
            ? getBlogsByAuthor(userId, user?.name || null, language)
            : Promise.resolve([]),
    ]);

    const { collections, loadedCollections } = await resolveProfileCollections({
        userId,
        requestedTab,
        isOwnProfile,
        preferences,
        recipesCount: recipesResponse.recipes.length + pinnedRecipes.length,
        blogsCount: blogs.length,
        hasSearch: Boolean(search?.trim()),
    });

    return {
        userId,
        searchParams,
        recipesResponse,
        user,
        currentUser,
        pinnedRecipes,
        blogs,
        lists: collections.lists,
        quests: collections.quests,
        plannings: collections.plannings,
        loadedCollections,
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
        lists,
        quests,
        plannings,
        loadedCollections,
        userActivity,
    } = data;

    const hasAnyContent =
        Boolean(user) ||
        recipesResponse.recipes.length > 0 ||
        blogs.length > 0 ||
        lists.length > 0 ||
        quests.length > 0 ||
        plannings.length > 0;

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
                lists={lists}
                quests={quests}
                plannings={plannings}
                loadedCollections={loadedCollections}
                user={user}
                graphRecipes={userActivity.recipes}
                comments={userActivity.comments}
                challengeSubmissions={userActivity.challengeSubmissions}
            />
        </>
    );
};

export default ProfilePage;
