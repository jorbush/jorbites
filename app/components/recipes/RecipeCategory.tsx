'use client';

import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';
import useIsMounted from '@/app/hooks/useIsMounted';

interface CategoryViewProps {
    icon: IconType;
    label: string;
    description: string;
}

const RecipeCategoryView: React.FC<CategoryViewProps> = ({
    icon: Icon,
    label,
    description,
}) => {
    const { t } = useTranslation();
    const mounted = useIsMounted();

    const translationKey = label.toLowerCase();
    const displayLabel = mounted ? t(translationKey) : translationKey;

    return (
        <div
            className="flex flex-col gap-6"
            data-testid="recipe-category-view"
        >
            <div
                className="flex flex-row items-center gap-4"
                data-testid="recipe-category-inner"
            >
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl border border-neutral-200/80 bg-neutral-50 shadow-2xs dark:border-neutral-700/60 dark:bg-neutral-800">
                    <Icon
                        size={30}
                        className="text-neutral-600 dark:text-neutral-300"
                        data-testid={`${Icon.name.toLowerCase()}`}
                    />
                </div>
                <div className="flex flex-col">
                    <div className="text-lg font-semibold text-neutral-900 dark:text-white">
                        {displayLabel}
                    </div>
                    <div className="font-light text-neutral-500 dark:text-neutral-400">
                        {description}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeCategoryView;
