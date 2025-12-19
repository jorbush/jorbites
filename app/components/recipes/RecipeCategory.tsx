'use client';

import { IconType } from 'react-icons';
import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

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
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const translationKey = label.toLocaleLowerCase();
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
                <Icon
                    size={40}
                    className="text-neutral-600"
                    data-testid={`${Icon.name.toLowerCase()}`}
                />
                <div className="flex flex-col">
                    <div className="text-lg font-semibold">{displayLabel}</div>
                    <div className="font-light text-neutral-500">
                        {description}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RecipeCategoryView;
