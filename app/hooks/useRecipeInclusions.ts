import useSWR from 'swr';
import { axiosFetcher } from '@/app/utils/fetcher';
import { SafeList, SafePlanning, SafeQuest } from '@/app/types';

interface RecipeInclusionsData {
    lists: SafeList[];
    plannings: SafePlanning[];
    quests: SafeQuest[];
}

const EMPTY_LISTS: SafeList[] = [];
const EMPTY_PLANNINGS: SafePlanning[] = [];
const EMPTY_QUESTS: SafeQuest[] = [];

export function useRecipeInclusions(recipeId?: string) {
    const { data, error, isLoading, mutate } = useSWR<RecipeInclusionsData>(
        recipeId ? `/api/recipes/${recipeId}/inclusions` : null,
        axiosFetcher,
        {
            revalidateOnFocus: false,
        }
    );

    return {
        lists: data?.lists || EMPTY_LISTS,
        plannings: data?.plannings || EMPTY_PLANNINGS,
        quests: data?.quests || EMPTY_QUESTS,
        isLoading,
        error,
        mutate,
    };
}
