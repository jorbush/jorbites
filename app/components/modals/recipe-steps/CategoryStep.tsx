'use client';

import { useTranslation } from 'react-i18next';
import Heading from '@/app/components/navigation/Heading';
import CategoryInput from '@/app/components/inputs/CategoryInput';
import { categories } from '@/app/components/navbar/Categories';

interface CategoryStepProps {
    selectedCategory: string;
    onCategorySelect: (category: string) => void;
}

const CategoryStep: React.FC<CategoryStepProps> = ({
    selectedCategory,
    onCategorySelect,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-8">
            <Heading
                title={t('title_category_recipe')}
                subtitle={t('subtitle_category_recipe') ?? ''}
            />
            <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto">
                {categories
                    .filter(
                        (item) => item.label.toLowerCase() !== 'award-winning'
                    )
                    .map((item) => (
                        <div
                            key={item.label}
                            className="col-span-1"
                        >
                            <CategoryInput
                                onClick={(category) =>
                                    onCategorySelect(category)
                                }
                                selected={selectedCategory === item.label}
                                label={item.label}
                                icon={item.icon}
                                dataCy={`category-box-${item.label}`}
                            />
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default CategoryStep;
