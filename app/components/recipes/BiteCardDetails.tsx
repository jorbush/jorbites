'use client';

import React from 'react';
import { SafeRecipe } from '@/app/types';
import Avatar from '@/app/components/utils/Avatar';
import { useTranslation } from 'react-i18next';
import { CuisineIcon } from '@/app/components/recipes/CuisineIcon';

interface BiteCardDetailsProps {
    recipe: SafeRecipe & {
        user?: {
            id?: string;
            name?: string | null;
            image?: string | null;
        } | null;
    };
    methodData?: {
        label: string;
        icon: React.ComponentType<{ size?: number; className?: string }>;
    };
}

export const BiteCardDetails: React.FC<BiteCardDetailsProps> = ({
    recipe,
    methodData,
}) => {
    const { t } = useTranslation();

    return (
        <div className="pointer-events-none absolute right-0 bottom-0 left-0 z-10 flex flex-col gap-3 p-6 text-white">
            {/* Categories Chips */}
            {recipe.categories && recipe.categories.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {recipe.categories.slice(0, 3).map((cat) => (
                        <span
                            key={cat}
                            className="bg-green-450/20 text-green-450 border-green-450/40 rounded-full border px-2.5 py-1 text-xs font-semibold backdrop-blur-sm"
                        >
                            {t(cat.toLowerCase())}
                        </span>
                    ))}
                </div>
            )}

            {/* Title */}
            <h2 className="text-2xl leading-tight font-semibold tracking-tight text-white drop-shadow-md sm:text-3xl">
                {recipe.title}
            </h2>

            {/* Description */}
            {recipe.description && (
                <p className="line-clamp-2 text-sm leading-relaxed text-neutral-300">
                    {recipe.description}
                </p>
            )}

            {/* Method & Cuisine Tags */}
            <div className="flex flex-wrap items-center gap-3">
                {recipe.method && methodData && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                        <methodData.icon
                            size={13}
                            className="text-green-450 shrink-0"
                        />
                        <span>{t(recipe.method.toLowerCase())}</span>
                    </div>
                )}
                {recipe.recipeCuisine && (
                    <div className="flex items-center gap-1.5 text-xs text-neutral-300">
                        <CuisineIcon
                            cuisine={recipe.recipeCuisine}
                            size={14}
                        />
                        <span>
                            {t(
                                `cuisine_${recipe.recipeCuisine.toLowerCase().replace(/\s+/g, '_')}`,
                                { defaultValue: recipe.recipeCuisine }
                            )}
                        </span>
                    </div>
                )}
            </div>

            {/* Author / Creator info */}
            {recipe.user && (
                <div className="mt-1 flex items-center gap-2.5 border-t border-white/10 pt-2">
                    <Avatar
                        src={recipe.user.image}
                        size={26}
                    />
                    <span className="text-xs font-medium text-neutral-200">
                        {recipe.user.name || t('bite_cards_anonymous')}
                    </span>
                </div>
            )}
        </div>
    );
};

export default BiteCardDetails;
