'use client';

import { SafeRecipe, SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import Button from '../Button';
import Image from 'next/image';
import HeartButton from '../HeartButton';

interface RecipeCardProps {
    data: SafeRecipe;
    onAction?: (id: string) => void;
    disabled?: boolean;
    actionLabel?: string;
    actionId?: string;
    currentUser?: SafeUser | null;
}

const RecipeCard: React.FC<RecipeCardProps> = ({
    data,
    onAction,
    disabled,
    actionLabel,
    actionId = '',
    currentUser,
}) => {
    const router = useRouter();

    const handleCancel = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();

            if (disabled) {
                return;
            }

            onAction?.(actionId);
        },
        [onAction, actionId, disabled]
    );

    return (
        <div
            onClick={() =>
                router.push(`/recipes/${data.id}`)
            }
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
                </div>
                <div className="text-lg font-semibold dark:text-neutral-100">
                    {data.title}
                </div>
                <div className="font-light text-neutral-500">
                    {data.minutes} min
                </div>
                {/*
            <div className="flex flex-row items-center gap-1">
                <div className="font-semibold">
                    { data.category}
                </div>
            </div>*/}
                {onAction && actionLabel && (
                    <Button
                        disabled={disabled}
                        small
                        label={actionLabel}
                        onClick={handleCancel}
                    />
                )}
            </div>
        </div>
    );
};

export default RecipeCard;
