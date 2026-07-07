import getCurrentUser from '@/app/actions/getCurrentUser';
import RecipeListsClient from './RecipeListsClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recipe Lists Course | Jorbites',
    description:
        'Learn how to create, manage, and share recipe lists and earn your badge.',
};

const RecipeListsPage = async () => {
    const currentUser = await getCurrentUser();

    return <RecipeListsClient currentUser={currentUser} />;
};

export default RecipeListsPage;
