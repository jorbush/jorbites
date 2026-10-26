import { Metadata } from 'next';
import { redirect } from 'next/navigation';
import getCurrentUser from '@/app/actions/getCurrentUser';
import getRecipeById from '@/app/actions/getRecipeById';
import ClientOnly from '@/app/components/utils/ClientOnly';
import RecipeCreateClient from './RecipeCreateClient';

export const metadata: Metadata = {
    title: 'Create Recipe | Jorbites',
    description: 'Create or remix a recipe on Jorbites',
};

interface CreatePageProps {
    searchParams: Promise<{
        forkFrom?: string;
    }>;
}

export default async function RecipeCreatePage(props: CreatePageProps) {
    const [searchParams, currentUser] = await Promise.all([
        props.searchParams,
        getCurrentUser(),
    ]);

    if (!currentUser) {
        redirect('/?login=true');
    }

    let forkFromRecipe = null;
    if (searchParams.forkFrom) {
        try {
            forkFromRecipe = await getRecipeById({
                recipeId: searchParams.forkFrom,
            });
        } catch (error) {
            console.error('Failed to fetch forkFrom recipe', error);
        }
    }

    return (
        <ClientOnly>
            <RecipeCreateClient
                forkFromRecipe={forkFromRecipe}
                forkFromId={searchParams.forkFrom}
            />
        </ClientOnly>
    );
}
