'use client';

import { IconType } from 'react-icons';
import { SafeUser } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import RecipeCategoryAndMethod from '@/app/components/recipes/RecipeCategoryAndMethod';
import HeartButton from '@/app/components/buttons/HeartButton';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import getUserDisplayName from '@/app/utils/responsive';
import VerificationBadge from '@/app/components/VerificationBadge';
import { useEffect, useState } from 'react';
import axios from 'axios';
import RecipeCard from '@/app/components/recipes/RecipeCard';
import YouTubePreview from '@/app/components/utils/YouTubePreview';

interface RecipeInfoProps {
    user: SafeUser;
    description: React.ReactNode;
    ingredients: React.ReactNode[];
    steps: React.ReactNode[];
    category:
        | {
              icon: IconType;
              label: string;
              description: string;
          }
        | undefined;
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
}

const RecipeInfo: React.FC<RecipeInfoProps> = ({
    user,
    description,
    ingredients,
    steps,
    category,
    method,
    likes,
    id,
    currentUser,
    coCooksIds = [],
    linkedRecipeIds = [],
    youtubeUrl,
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const isMdOrSmaller = useMediaQuery('(max-width: 425px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 375px)');

    const [coCooks, setCoCooks] = useState<any[]>([]);
    const [linkedRecipes, setLinkedRecipes] = useState<any[]>([]);

    useEffect(() => {
        const fetchRelatedData = async () => {
            if (coCooksIds.length > 0) {
                try {
                    const { data } = await axios.get(
                        `/api/users/multiple?ids=${coCooksIds.join(',')}`
                    );
                    setCoCooks(data);
                } catch (error) {
                    console.error('Failed to load co-cooks', error);
                }
            }

            if (linkedRecipeIds.length > 0) {
                try {
                    const { data } = await axios.get(
                        `/api/recipes/multiple?ids=${linkedRecipeIds.join(',')}`
                    );
                    setLinkedRecipes(data);
                } catch (error) {
                    console.error('Failed to load linked recipes', error);
                }
            }
        };

        fetchRelatedData();
    }, [coCooksIds, linkedRecipeIds]);

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
                            <div className="text-sm text-gray-400">{`${t('level')} ${user?.level}`}</div>
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
                        {steps.length} {t('steps').toLowerCase()}
                    </div>
                    <div>
                        {ingredients.length} {t('ingredients').toLowerCase()}
                    </div>
                </div>
            </div>

            {/* Co-cooks section */}
            {coCooks.length > 0 && (
                <div className="flex flex-col gap-2">
                    <h3 className="text-md font-semibold dark:text-neutral-100">
                        {t('co_cooks') || 'Co-Cooks'}
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
                category={category}
                method={method}
            />
            <hr />
            <div
                className="text-justify text-lg font-light text-neutral-500 dark:text-neutral-100"
                data-cy="recipe-description-display"
            >
                {description}
            </div>
            {ingredients.length > 0 && (
                <>
                    <hr />
                    <div
                        className="dark:text-neutral-100"
                        data-cy="ingredients-section"
                    >
                        <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                            {t('ingredients')}
                        </div>
                        <ul className="list-disc pt-4 pl-9">
                            {ingredients.map((ingredient, index) => (
                                <li
                                    key={index}
                                    className="mb-2"
                                >
                                    {ingredient}
                                </li>
                            ))}
                        </ul>
                    </div>
                </>
            )}
            {steps.length > 0 && (
                <>
                    <hr />
                    <div
                        className="dark:text-neutral-100"
                        data-cy="steps-section"
                    >
                        <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                            {t('steps')}
                        </div>
                        <ol className="list-decimal pt-4 pl-9">
                            {steps.map((step, index) => (
                                <li
                                    key={index}
                                    className="overflow-wrap-anywhere mb-2 break-words"
                                    data-cy={`step-${index}`}
                                >
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                </>
            )}

            {/* YouTube video section */}
            {youtubeUrl && (
                <>
                    <hr />
                    <div className="dark:text-neutral-100">
                        <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                            {t('video_tutorial') || 'Video Tutorial'}
                        </div>
                        <div className="mt-4">
                            <YouTubePreview
                                url={youtubeUrl}
                                title={`${t('video_for')} ${user.name}'s recipe`}
                                className="max-w-md"
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
                            {t('linked_recipes') || 'Linked Recipes'}
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
