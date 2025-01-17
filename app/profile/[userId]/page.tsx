import EmptyState from '@/app/components/EmptyState';
import ClientOnly from '@/app/components/ClientOnly';
import getCurrentUser from '@/app/actions/getCurrentUser';
import ProfileClient from '@/app/profile/[userId]/ProfileClient';
import getRecipesByUserId from '@/app/actions/getRecipesByUserId';
import getUserById from '@/app/actions/getUserById';
import ProfileHeader from '@/app/profile/[userId]/ProfileHeader';

interface IParams {
    userId?: string;
}

const ProfilePage = async ({ params }: { params: IParams }) => {
    const recipes = await getRecipesByUserId(params);
    const user = await getUserById(params);
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
        <ClientOnly>
            <ProfileHeader user={user} />
            {recipes.length > 0 && (
                <ProfileClient
                    recipes={recipes}
                    currentUser={currentUser}
                />
            )}
            {recipes.length === 0 && (
                <EmptyState
                    title="No recipes found"
                    subtitle="Looks like this user has not created recipes."
                />
            )}
        </ClientOnly>
    );
};

export default ProfilePage;
