import getCurrentUser from '@/app/actions/getCurrentUser';
import RecipeCreatorClient from './RecipeCreatorClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recipe Creator Course | Jorbites',
    description:
        'Learn how to build cooking guides, utilize plain text copy-paste parsing mode, persist creation drafts, and edit published recipes.',
};

const RecipeCreatorPage = async () => {
    const currentUser = await getCurrentUser();

    return <RecipeCreatorClient currentUser={currentUser} />;
};

export default RecipeCreatorPage;
