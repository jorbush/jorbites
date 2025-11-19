import EmptyState from '@/app/components/utils/EmptyState';
import ClientOnly from '@/app/components/utils/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import ProfileClient from '@/app/profile/[userId]/ProfileClient';
import getRecipesByUserId from '@/app/actions/getRecipesByUserId';
import getUserById from '@/app/actions/getUserById';
import ProfileHeader from '@/app/profile/[userId]/ProfileHeader';
import UserStats from '@/app/components/stats/UserStats';
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
    const recipes = await getRecipesByUserId({
        ...params,
        orderBy: searchParams.orderBy,
    });
    const user = await getUserById({ userId: params.userId, withStats: true });
    const currentUser = await getCurrentUser();

    if (!user && recipes.length === 0) {
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

            {recipes.length > 0 && (
                <ClientOnly fallback={<ProfileClientSkeleton />}>
                    <ProfileClient
                        recipes={recipes}
                        currentUser={currentUser}
                    />
                </ClientOnly>
            )}

            {recipes.length === 0 && (
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
