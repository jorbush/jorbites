'use client';

import { SafeRecipe, SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';
import HeartButton from '@/app/components/buttons/HeartButton';
import { GiTrophyCup } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';
import CloudinaryImage from '@/app/components/optimization/CloudinaryImage';
import { memo } from 'react';

interface RecipeCardProps {
    data: SafeRecipe;
    currentUser?: SafeUser | null;
    isFirstCard?: boolean;
}

const RecipeCard = memo(function RecipeCard({
    data,
    currentUser,
    isFirstCard = false,
}: RecipeCardProps) {
    const router = useRouter();
    const { t } = useTranslation();

    return (
        <div
            onClick={() => router.push(`/recipes/${data.id}`)}
            className="group col-span-1 cursor-pointer"
            id={isFirstCard ? 'lcp-container' : undefined}
        >
            <div className="flex w-full flex-col gap-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                    <CloudinaryImage
                        src={data.imageSrc || '/advocado.webp'}
                        alt="recipe"
                        fill
                        priority={isFirstCard}
                        className="h-full w-full object-cover transition group-hover:scale-110"
                        width={250}
                        height={250}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 250px"
                    />
                    <div className="absolute top-3 right-3">
                        <HeartButton
                            recipeId={data.id}
                            currentUser={currentUser}
                        />
                    </div>
                    {data.category?.toLowerCase() === 'award-winning' && (
                        <div className="absolute bottom-0 flex w-full items-center justify-center bg-gray-900/50 p-2 text-white">
                            <GiTrophyCup
                                className="mr-1 inline-block"
                                size={20}
                            />
                            {t('award-winning')}
                        </div>
                    )}
                </div>
                <div className="text-lg font-semibold dark:text-neutral-100">
                    {data.title}
                </div>
                <div className="font-light text-neutral-500">
                    {data.minutes} min
                </div>
            </div>
        </div>
    );
});

export default RecipeCard;
