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
                className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 dark:text-neutral-100"
            >
                {categories &&
                    categories.map((category, index) => (
                        <RecipeCategoryView
                            key={`${category.label}-${index}`}
                            icon={category.icon}
                            label={category.label}
                            description={category.description}
                        />
                    ))}
                {method && (
                    <>
                        <RecipeCategoryView
                            icon={method.icon}
                            label={method?.label}
                            description={''}
                        />
                    </>
                )}
            </div>
        </>
    );
};

export default RecipeCategoryAndMethod;
