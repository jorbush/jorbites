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
}) => {
    const { t } = useTranslation();
    const router = useRouter();
    const isMdOrSmaller = useMediaQuery('(max-width: 425px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 375px)');

    return (
        <div className="col-span-4 flex flex-col gap-8 pr-2 pl-2">
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-1">
                    <div className="col-span-2 flex flex-row items-center gap-2 text-xl font-semibold dark:text-neutral-100">
                        <Avatar
                            src={user?.image}
                            size={40}
                            onClick={() => router.push('/profile/' + user.id)}
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
            <RecipeCategoryAndMethod
                category={category}
                method={method}
            />
            <hr />
            <div className="text-justify text-lg font-light text-neutral-500 dark:text-neutral-100">
                {description}
            </div>
            {ingredients.length > 0 && (
                <>
                    <hr />
                    <div className="dark:text-neutral-100">
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
                    <div className="dark:text-neutral-100">
                        <div className="flex flex-row items-center gap-2 text-xl font-semibold">
                            {t('steps')}
                        </div>
                        <ol className="list-decimal pt-4 pl-9">
                            {steps.map((step, index) => (
                                <li
                                    key={index}
                                    className="mb-2"
                                >
                                    {step}
                                </li>
                            ))}
                        </ol>
                    </div>
                </>
            )}
        </div>
    );
};

export default RecipeInfo;
