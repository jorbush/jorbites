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

interface IParams {
    userId?: string;
}

const ProfilePage = async (props: { params: Promise<IParams> }) => {
    const params = await props.params;
    const recipes = await getRecipesByUserId(params);
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
