'use client';

import { IconType } from 'react-icons';
import { SafeUser, SafeRecipe } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import RecipeCategoryAndMethod from '@/app/components/recipes/RecipeCategoryAndMethod';
import HeartButton from '@/app/components/buttons/HeartButton';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import getUserDisplayName from '@/app/utils/responsive';
import VerificationBadge from '@/app/components/VerificationBadge';
import { useEffect, useState } from 'react';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import YouTubePreview from '@/app/components/utils/YouTubePreview';
import { TranslateableRecipeContent } from '@/app/components/translation/TranslateableRecipeContent';
import { formatText } from '@/app/utils/textFormatting';

interface RecipeInfoProps {
    user: SafeUser;
    description: React.ReactNode;
    descriptionText?: string; // Raw description text for translation
    ingredients: React.ReactNode[];
    ingredientsText?: string[]; // Raw ingredients text for translation
    steps: React.ReactNode[];
    stepsText?: string[]; // Raw steps text for translation
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
    coCooks?: Array<{
        id: string;
        name: string | null;
        image: string | null;
        level: number;
        verified: boolean;
    }>;
    linkedRecipes?: (SafeRecipe & { user: SafeUser })[];
    youtubeUrl?: string | null;
}

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
    coCooks = [],
    linkedRecipes = [],
    youtubeUrl,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const isMdOrSmaller = useMediaQuery('(max-width: 425px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 375px)');
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    return (
        <div className="col-span-4 flex flex-col gap-8 pr-2 pl-2">
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-1">
                    <div className="col-span-2 flex flex-row items-center gap-2 text-xl font-semibold dark:text-neutral-100">
                        <Avatar
                            src={user?.image}
                            size={40}
                            onClick={() => router.push('/profile/' + user.id)}
                            quality="auto:eco"
                        />
                        <div className="flex flex-col">
                            <div className="flex flex-row">
                                <div
                                    className="cursor-pointer"
                                    onClick={() =>
                                        router.push('/profile/' + user.id)
                                    }
                                >
                                    {getUserDisplayName(
                                        user,
                                        isMdOrSmaller,
                                        isSmOrSmaller
                                    )}
                                </div>
                                {user.verified && (
                                    <VerificationBadge className="mt-1 ml-1" />
                                )}
                            </div>
                            <div className="text-sm text-gray-400">
                                {mounted
                                    ? `${t('level')} ${user?.level}`
                                    : `level ${user?.level}`}
                            </div>
                        </div>
                    </div>
                    <div className="mr-4 mb-5 ml-auto flex flex-row items-end gap-2 text-xl">
                        <HeartButton
                            recipeId={id}
                            currentUser={currentUser}
                        />
                        <div
                            className="dark:text-neutral-100"
                            data-cy="recipe-num-likes"
                        >
                            {likes}
                        </div>
                    </div>
                </div>
                <div className="flex flex-row items-center gap-4 font-light text-neutral-500">
                    <div>
                        {steps.length}{' '}
                        {mounted ? t('steps').toLowerCase() : 'steps'}
                    </div>
                    <div>
                        {ingredients.length}{' '}
                        {mounted
                            ? t('ingredients').toLowerCase()
                            : 'ingredients'}
                    </div>
                </div>
            </div>

            {/* Co-cooks section */}
            {coCooks.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-md font-semibold dark:text-neutral-100">
                        {mounted ? t('co_cooks') || 'Co-Cooks' : 'co_cooks'}
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {coCooks.map((cook) => (
                            <div
                                key={cook.id}
                                className="flex cursor-pointer items-center gap-2 rounded-full bg-gray-100 px-2 py-1 dark:bg-gray-800"
                                onClick={() =>
                                    router.push(`/profile/${cook.id}`)
                                }
                            >
                                <Avatar
                                    src={cook.image}
                                    size={24}
                                />
                                <span className="text-sm dark:text-neutral-100">
                                    {cook.name}
                                </span>
                                {cook.verified && (
                                    <VerificationBadge
                                        className="ml-1"
                                        size={16}
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <RecipeCategoryAndMethod
                categories={categories}
                method={method}
            />
            <hr />
            <TranslateableRecipeContent
                description={description}
                descriptionText={descriptionText}
                ingredients={ingredients}
                ingredientsText={ingredientsText}
                steps={steps}
                stepsText={stepsText}
                renderDescription={(content) => (
                    <div
                        className="text-justify text-lg font-light text-neutral-500 dark:text-neutral-100"
                        data-cy="recipe-description-display"
                    >
                        {typeof content === 'string'
                            ? formatText(content)
                            : content}
                    </div>
                )}
                renderIngredients={(items) => {
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
                                    {items.map((item, index) => (
                                        <li
                                            key={index}
                                            className="mb-2"
                                        >
                                            {formatText(item)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </>
                    );
                }}
                renderSteps={(items) => {
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
                                            key={index}
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
                }}
            />

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
            {linkedRecipes.length > 0 && (
                <>
                    <hr />
                    <div className="dark:text-neutral-100">
                        <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                            {mounted
                                ? t('linked_recipes') || 'Linked Recipes'
                                : 'linked_recipes'}
                        </div>
                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                            {linkedRecipes.map((recipe) => (
                                <RecipeCard
                                    key={recipe.id}
                                    data={recipe}
                                    currentUser={currentUser}
                                    user={recipe.user}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
};

export default RecipeInfo;
