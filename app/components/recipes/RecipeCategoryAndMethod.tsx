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
                className="flex flex-row flex-wrap gap-8 dark:text-neutral-100"
            >
                {categories &&
                    categories.map((category, index) => (
                        <RecipeCategoryView
                            key={`${category.label}-${index}`}
                            icon={category.icon}
                            label={category.label}
                            description={''}
                        />
                    ))}
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
