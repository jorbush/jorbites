'use client';

import { useTranslation } from 'react-i18next';
import Heading from '@/app/components/navigation/Heading';
import CategoryInput from '@/app/components/inputs/CategoryInput';
import { categories } from '@/app/components/navbar/categoriesData';
import { RECIPE_MAX_CATEGORIES } from '@/app/utils/constants';
import { toast } from 'react-hot-toast';

interface CategoryStepProps {
    selectedCategories: string[];
    onCategorySelect: (categories: string[]) => void;
}

const EMPTY_CATEGORIES: string[] = [];

const CategoryStep: React.FC<CategoryStepProps> = ({
    selectedCategories = EMPTY_CATEGORIES,
    onCategorySelect,
}) => {
    const { t } = useTranslation();

    const handleCategoryClick = (categoryLabel: string) => {
        const isSelected = selectedCategories.includes(categoryLabel);

        if (isSelected) {
            // Remove category if already selected
            onCategorySelect(
                selectedCategories.filter((cat) => cat !== categoryLabel)
            );
        } else {
            // Add category if not selected and under limit
            if (selectedCategories.length >= RECIPE_MAX_CATEGORIES) {
                toast.error(
                    t('max_categories_reached') ||
                        `Maximum of ${RECIPE_MAX_CATEGORIES} categories allowed`
                );
                return;
            }
            onCategorySelect([...selectedCategories, categoryLabel]);
        }
    };

    return (
        <div className="flex flex-col gap-8">
            <Heading
                title={t('title_category_recipe')}
                subtitle={`${(t('subtitle_categories_recipe') || '').trim()} (${selectedCategories.length}/${RECIPE_MAX_CATEGORIES})`}
            />
            <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto">
                {categories.reduce((acc: React.ReactNode[], item) => {
                    if (item.label.toLowerCase() !== 'award-winning') {
                        acc.push(
                            <div
                                key={item.label}
                                className="col-span-1"
                            >
                                <CategoryInput
                                    onClick={handleCategoryClick}
                                    selected={selectedCategories.includes(
                                        item.label
                                    )}
                                    label={item.label}
                                    icon={item.icon}
                                    dataCy={`category-box-${item.label}`}
                                />
                            </div>
                        );
                    }
                    return acc;
                }, [])}
            </div>
        </div>
    );
};

export default CategoryStep;
