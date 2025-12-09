'use client';

import { IconType } from 'react-icons';
import RecipeCategoryView from '@/app/components/recipes/RecipeCategory';

interface RecipeInfoProps {
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
}

const RecipeCategoryAndMethod: React.FC<RecipeInfoProps> = ({
    categories,
    method,
}) => {
    const hasContent = (categories && categories.length > 0) || method;

    return (
        <>
            {hasContent && <hr />}
            <div
                data-testid="recipe-category-and-method"
                data-cy="cooking-methods"
                className="flex flex-col gap-8 sm:flex-row sm:items-center dark:text-neutral-100"
            >
                {categories && categories.length > 0 && (
                    <div className="flex flex-row flex-wrap items-center gap-8">
                        {categories.map((category, index) => (
                            <RecipeCategoryView
                                key={`${category.label}-${index}`}
                                icon={category.icon}
                                label={category.label}
                                description={''}
                            />
                        ))}
                    </div>
                )}
                {categories && categories.length > 0 && method && (
                    <div className="hidden sm:block h-12 w-px bg-gray-200 dark:bg-gray-700" />
                )}
                {method && (
                    <RecipeCategoryView
                        icon={method.icon}
                        label={method?.label}
                        description={''}
                    />
                )}
            </div>
        </>
    );
};

export default RecipeCategoryAndMethod;
