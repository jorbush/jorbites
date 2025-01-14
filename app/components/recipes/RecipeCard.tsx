'use client';

import { SafeRecipe, SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import HeartButton from '@/app/components/HeartButton';
import { GiTrophyCup } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';

interface RecipeCardProps {
    data: SafeRecipe;
    currentUser?: SafeUser | null;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ data, currentUser }) => {
    const router = useRouter();
    const { t } = useTranslation();
    return (
        <div
            onClick={() => router.push(`/recipes/${data.id}`)}
            className="group col-span-1 cursor-pointer"
        >
            <div className="flex w-full flex-col gap-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                    <Image
                        fill
                        priority={true}
                        className="h-full w-full object-cover transition group-hover:scale-110"
                        src={data.imageSrc}
                        alt="recipe"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute right-3 top-3">
                        <HeartButton
                            recipeId={data.id}
                            currentUser={currentUser}
                        />
                    </div>
                    {data.category.toLowerCase() === 'award-winning' && (
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
};

export default RecipeCard;
