'use client';

import { IconType } from 'react-icons';
import RecipeCategoryView from '@/app/components/recipes/RecipeCategory';

interface RecipeInfoProps {
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
}

const RecipeCategoryAndMethod: React.FC<RecipeInfoProps> = ({
    category,
    method,
}) => {
    return (
        <>
            <hr />
            <div
                data-testid="recipe-category-and-method"
                className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-2 dark:text-neutral-100"
            >
                {category && (
                    <>
                        <RecipeCategoryView
                            icon={category.icon}
                            label={category?.label}
                            description={''}
                        />
                    </>
                )}
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
