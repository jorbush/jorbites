'use client';

import { IconType } from 'react-icons';
import { SafeUser } from '@/app/types';
import RecipeCategoryAndMethod from '@/app/components/recipes/RecipeCategoryAndMethod';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import YouTubePreview from '@/app/components/utils/YouTubePreview';
import { TranslateableRecipeContent } from '@/app/components/translation/TranslateableRecipeContent';
import { formatText } from '@/app/utils/textFormatting';
import useSWR from 'swr';
import { axiosFetcher } from '@/app/utils/fetcher';
import { RecipeInfoHeader } from './RecipeInfoHeader';
import { RecipeCoCooks } from './RecipeCoCooks';
import { RecipeLinkedRecipes } from './RecipeLinkedRecipes';
import useIsMounted from '@/app/hooks/useIsMounted';

interface RecipeInfoProps {
    user: SafeUser;
    description: React.ReactNode;
    descriptionText?: string;
    ingredients: React.ReactNode[];
    ingredientsText?: string[];
    steps: React.ReactNode[];
    stepsText?: string[];
    categories?: Array<{
        icon: IconType;
        label: string;
        description: string;
    }>;
    method:
        | {
              icon: IconType;
              label: string;
          }
        | undefined;
    currentUser?: SafeUser | null;
    id: string;
    likes: number;
    coCooksIds?: string[];
    linkedRecipeIds?: string[];
    youtubeUrl?: string | null;
    averageRating?: number;
    ratingCount?: number;
}

const EMPTY_ARRAY: any[] = [];

const RecipeInfo: React.FC<RecipeInfoProps> = ({
    user,
    description,
    descriptionText,
    ingredients,
    ingredientsText,
    steps,
    stepsText,
    categories,
    method,
    likes,
    id,
    currentUser,
    coCooksIds = EMPTY_ARRAY,
    linkedRecipeIds = EMPTY_ARRAY,
    youtubeUrl,
    averageRating = 0,
    ratingCount = 0,
}) => {
    const { t } = useTranslation();
    const { push } = useRouter() || {};
    const isMdOrSmaller = useMediaQuery('(max-width: 425px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 375px)');
    const mounted = useIsMounted();

    const { data: coCooksData, isLoading: isCoCooksLoading } = useSWR<any[]>(
        coCooksIds.length > 0
            ? `/api/users/multiple?ids=${coCooksIds.join(',')}`
            : null,
        axiosFetcher
    );

    const { data: linkedRecipesData, isLoading: isLinkedRecipesLoading } =
        useSWR<any[]>(
            linkedRecipeIds.length > 0
                ? `/api/recipes/multiple?ids=${linkedRecipeIds.join(',')}`
                : null,
            axiosFetcher
        );

    const coCooks = coCooksData || [];
    const linkedRecipes = linkedRecipesData || [];
    const isLoadingRelatedData = isCoCooksLoading || isLinkedRecipesLoading;

    return (
        <div className="col-span-4 flex flex-col gap-8 pr-2 pl-2">
            <RecipeInfoHeader
                user={user}
                currentUser={currentUser}
                id={id}
                likes={likes}
                stepsCount={steps.length}
                ingredientsCount={ingredients.length}
                averageRating={averageRating}
                ratingCount={ratingCount}
                mounted={mounted}
                t={t}
                push={push}
                isMdOrSmaller={isMdOrSmaller}
                isSmOrSmaller={isSmOrSmaller}
            />

            <RecipeCoCooks
                isLoadingRelatedData={isLoadingRelatedData}
                coCooks={coCooks}
                mounted={mounted}
                t={t}
                push={push}
            />

            <RecipeCategoryAndMethod
                categories={categories}
                method={method}
            />
            <TranslateableRecipeContent
                description={description}
                descriptionText={descriptionText}
                ingredientsText={ingredientsText}
                stepsText={stepsText}
            >
                <TranslateableRecipeContent.Description />
                <TranslateableRecipeContent.Ingredients />
                <TranslateableRecipeContent.Steps />
            </TranslateableRecipeContent>

            {/* YouTube video section */}
            {youtubeUrl && (
                <>
                    <hr />
                    <div className="dark:text-neutral-100">
                        <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                            {t('youtube_video')}
                        </div>
                        <div className="mt-4">
                            <YouTubePreview
                                url={youtubeUrl}
                                title={`${t('video_for')} ${user.name}'s recipe`}
                            />
                        </div>
                    </div>
                </>
            )}

            {/* Linked recipes section */}
            <RecipeLinkedRecipes
                isLoadingRelatedData={isLoadingRelatedData}
                linkedRecipes={linkedRecipes}
                currentUser={currentUser}
                mounted={mounted}
                t={t}
            />
        </div>
    );
};

export default RecipeInfo;
