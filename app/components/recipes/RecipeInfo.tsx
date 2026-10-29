'use client';

import { IconType } from 'react-icons';
import { GanttTable, SafeUser } from '@/app/types';
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
import { RecipeGanttTable } from './RecipeGanttTable';
import useIsMounted from '@/app/hooks/useIsMounted';
import useCooksnapModal from '@/app/hooks/useCooksnapModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import Button from '@/app/components/buttons/Button';
import { TbPhotoPlus, TbGitFork } from 'react-icons/tb';
import RemixAttributionBanner from '@/app/components/recipes/RemixAttributionBanner';

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
    calories?: number | null;
    recipeCuisine?: string | null;
    recipeYield?: number | null;
    ganttTable?: GanttTable | null;
    recipeTitle?: string;
    forkedFromRecipe?: {
        id: string;
        title: string;
        imageSrc?: string;
        user?: {
            id: string;
            name: string | null;
            image?: string | null;
        } | null;
    } | null;
    forkedFromRecipeId?: string | null;
}

const EMPTY_ARRAY: any[] = [];

interface RecipeDescriptionProps {
    content: string | React.ReactNode;
}

const RecipeDescription: React.FC<RecipeDescriptionProps> = ({ content }) => {
    return (
        <div
            className="text-justify text-lg font-light text-neutral-500 dark:text-neutral-100"
            data-cy="recipe-description-display"
        >
            {typeof content === 'string' ? formatText(content) : content}
        </div>
    );
};

interface RecipeIngredientsProps {
    items: string[];
}

const RecipeIngredients: React.FC<RecipeIngredientsProps> = ({ items }) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();

    if (items.length === 0) return null;
    return (
        <>
            <hr />
            <div
                className="dark:text-neutral-100"
                data-cy="ingredients-section"
            >
                <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                    {mounted ? t('ingredients') : 'ingredients'}
                </div>
                <ul className="list-disc pt-4 pl-9">
                    {items.map((item, i) => (
                        <li
                            key={`ing-${i}-${item}`}
                            className="mb-2"
                        >
                            {formatText(item)}
                        </li>
                    ))}
                </ul>
            </div>
        </>
    );
};

interface RecipeStepsProps {
    items: string[];
}

const RecipeSteps: React.FC<RecipeStepsProps> = ({ items }) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();

    if (items.length === 0) return null;
    return (
        <>
            <hr />
            <div
                className="dark:text-neutral-100"
                data-cy="steps-section"
            >
                <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                    {mounted ? t('steps') : 'steps'}
                </div>
                <ol className="list-decimal pt-4 pl-9">
                    {items.map((item, index) => (
                        <li
                            key={`step-${index}-${item}`}
                            className="overflow-wrap-anywhere mb-2 break-words"
                            data-cy={`step-${index}`}
                        >
                            {formatText(item)}
                        </li>
                    ))}
                </ol>
            </div>
        </>
    );
};

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
    calories,
    recipeCuisine,
    recipeYield,
    ganttTable,
    recipeTitle,
    forkedFromRecipe,
    forkedFromRecipeId,
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
    const cooksnapModal = useCooksnapModal();
    const loginModal = useLoginModal();

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
                calories={calories}
                recipeCuisine={recipeCuisine}
                recipeYield={recipeYield}
            />

            {(forkedFromRecipe || forkedFromRecipeId) && (
                <div className="-mt-4">
                    <RemixAttributionBanner
                        forkedFromRecipe={forkedFromRecipe}
                        forkedFromRecipeId={forkedFromRecipeId}
                    />
                </div>
            )}

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
                ganttTable={ganttTable}
                recipeTitle={recipeTitle}
                RenderDescription={RecipeDescription}
                RenderIngredients={RecipeIngredients}
                RenderSteps={RecipeSteps}
                RenderGanttTable={RecipeGanttTable}
            />

            {/* Post-steps Cooksnap and Remix Buttons */}
            <div className="flex w-full flex-wrap items-center justify-center gap-4 pt-2">
                <div className="w-[220px]">
                    <Button
                        label={
                            mounted
                                ? String(
                                      t('i_made_this', {
                                          defaultValue: 'I Made This!',
                                      })
                                  )
                                : 'I Made This!'
                        }
                        icon={TbPhotoPlus}
                        onClick={() => {
                            if (!currentUser) return loginModal.onOpen();
                            cooksnapModal.onOpen(id, recipeTitle);
                        }}
                        dataTestId="post-steps-cooksnap-btn"
                    />
                </div>
                <div className="w-[220px]">
                    <Button
                        label={
                            mounted
                                ? String(
                                      t('remix_recipe', {
                                          defaultValue: 'Remix Recipe',
                                      })
                                  )
                                : 'Remix Recipe'
                        }
                        icon={TbGitFork}
                        outline
                        onClick={() => {
                            if (!currentUser) return loginModal.onOpen();
                            push(`/recipes/create?forkFrom=${id}`);
                        }}
                        dataTestId="remix-recipe-btn"
                        dataCy="remix-recipe-btn"
                    />
                </div>
            </div>

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
