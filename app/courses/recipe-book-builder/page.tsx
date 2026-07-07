import getCurrentUser from '@/app/actions/getCurrentUser';
import RecipeBookClient from './RecipeBookClient';
import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Recipe Book Builder Course | Jorbites',
    description:
        'Learn how to customize layouts, choose fonts, select recipes, and compile a custom recipe book PDF.',
};

const RecipeBookPage = async () => {
    const currentUser = await getCurrentUser();

    return <RecipeBookClient currentUser={currentUser} />;
};

export default RecipeBookPage;
