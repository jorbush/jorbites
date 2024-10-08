'use client';

import { IconType } from 'react-icons';
import { SafeUser } from '@/app/types';
import Avatar from '../Avatar';
import RecipeCategoryAndMethod from '@/app/components/recipes/RecipeCategoryAndMethod';
import HeartButton from '../HeartButton';
import { useTranslation } from 'react-i18next';
import { MdVerified } from 'react-icons/md';
import { useRouter } from 'next/navigation';

interface RecipeInfoProps {
    user: SafeUser;
    description: string;
    steps: string[];
    ingredients: string[];
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

    return (
        <div className="col-span-4 flex flex-col gap-8 pl-2 pr-2">
            <div className="flex flex-col gap-2">
                <div className="grid grid-cols-3 gap-8">
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
                                    {user?.name}
                                </div>
                                {user.verified && (
                                    <MdVerified
                                        data-testid="verified-icon"
                                        className="ml-1 mt-1 text-green-450"
                                    />
                                )}
                            </div>
                            <div className="text-sm text-gray-400">{`${t('level')} ${user?.level}`}</div>
                        </div>
                    </div>
                    <div className="mb-5 ml-auto mr-4 flex flex-row items-end gap-2 text-xl">
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
                        <ul className="list-disc pl-9 pt-4">
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
                        <ol className="list-decimal pl-9 pt-4">
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
