import useSWR from 'swr';
import { axiosFetcher } from '@/app/utils/fetcher';
import { SafeList, SafePlanning } from '@/app/types';

interface RecipeInclusionsData {
    lists: SafeList[];
    plannings: SafePlanning[];
}

const EMPTY_LISTS: SafeList[] = [];
const EMPTY_PLANNINGS: SafePlanning[] = [];

export function useRecipeInclusions(recipeId?: string) {
    const { data, error, isLoading, mutate } = useSWR<RecipeInclusionsData>(
        recipeId ? `/api/recipes/${recipeId}/lists-and-plannings` : null,
        axiosFetcher,
        {
            revalidateOnFocus: false,
        }
    );

    return {
        lists: data?.lists || EMPTY_LISTS,
        plannings: data?.plannings || EMPTY_PLANNINGS,
        isLoading,
        error,
        mutate,
    };
}
