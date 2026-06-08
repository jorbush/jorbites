'use client';

import { SafeRecipe, SafeUser } from '@/app/types';
import { useRouter } from 'next/navigation';
import HeartButton from '@/app/components/buttons/HeartButton';
import PinButton from '@/app/components/buttons/PinButton';
import { GiTrophyCup } from 'react-icons/gi';
import { useTranslation } from 'react-i18next';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import { memo, useCallback, useMemo } from 'react';
import Avatar from '@/app/components/utils/Avatar';
import ClientOnly from '@/app/components/utils/ClientOnly';
import { IconType } from 'react-icons';

interface RecipeCardProps {
    data: SafeRecipe;
    currentUser?: SafeUser | null;
    isFirstCard?: boolean;
    user?: SafeUser | null;
    onAction?: (id: string) => void;
    disabled?: boolean;
    actionLabel?: string;
    actionIcon?: IconType;
    canPin?: boolean;
}

const RecipeCard = memo(function RecipeCard({
    data,
    currentUser,
    isFirstCard = false,
    user,
    onAction,
    disabled,
    actionLabel,
    actionIcon: ActionIcon,
    canPin = false,
}: RecipeCardProps) {
    const { push } = useRouter() || {};
    const { t } = useTranslation();

    const handleCancel = useCallback(
        (e: React.MouseEvent<HTMLButtonElement>) => {
            e.stopPropagation();

            if (disabled) {
                return;
            }

            onAction?.(data.id);
        },
        [onAction, data.id, disabled]
    );

    const isAwardWinning = useMemo(() => {
        return (
            data.categories?.some(
                (cat) => cat.toLowerCase() === 'award-winning'
            ) || false
        );
    }, [data]);

    return (
        <div
            onClick={() => push(`/recipes/${data.id}`)}
            className="group col-span-1 cursor-pointer"
            id={isFirstCard ? 'lcp-container' : undefined}
        >
            <div className="flex w-full flex-col gap-2">
                <div className="relative aspect-square w-full overflow-hidden rounded-xl">
                    <CustomProxyImage
                        src={data.imageSrc || '/avocado.webp'}
                        alt="recipe"
                        fill
                        priority={isFirstCard}
                        className="size-full object-cover transition group-hover:scale-110"
                        width={209}
                        height={209}
                        sizes="(max-width: 640px) 100vw, (max-width: 768px) 50vw, (max-width: 1024px) 33vw, 250px"
                        quality="auto:eco"
                    />
                    <div className="absolute top-3 right-3">
                        <HeartButton
                            recipeId={data.id}
                            currentUser={currentUser}
                        />
                    </div>
                    {canPin && !onAction ? (
                        <div className="absolute top-3 left-3">
                            <PinButton
                                recipeId={data.id}
                                currentUser={currentUser}
                            />
                        </div>
                    ) : (
                        onAction &&
                        ActionIcon && (
                            <button
                                type="button"
                                disabled={disabled}
                                onClick={handleCancel}
                                className="absolute top-3 left-3 flex size-8 cursor-pointer items-center justify-center rounded-full bg-white/80 transition hover:bg-white disabled:cursor-not-allowed disabled:opacity-70 dark:bg-neutral-800/80 dark:hover:bg-neutral-800"
                                title={actionLabel}
                            >
                                <ActionIcon
                                    size={18}
                                    className="text-neutral-700 dark:text-neutral-200"
                                />
                            </button>
                        )
                    )}
                    <ClientOnly>
                        {isAwardWinning && (
                            <div className="absolute bottom-0 flex w-full items-center justify-center bg-neutral-900/50 p-2 text-white">
                                <GiTrophyCup
                                    className="mr-1 inline-block"
                                    size={20}
                                />
                                {t('award-winning')}
                            </div>
                        )}
                    </ClientOnly>
                </div>
                <div className="text-lg font-semibold dark:text-neutral-100">
                    <button
                        type="button"
                        onClick={(e) => {
                            e.stopPropagation();
                            push(`/recipes/${data.id}`);
                        }}
                        className="cursor-pointer text-left font-semibold hover:underline focus:outline-hidden"
                        data-cy="recipe-card-title"
                    >
                        {data.title}
                    </button>
                </div>
                {user ? (
                    <div className="flex flex-row items-center gap-2">
                        <Avatar
                            src={user.image}
                            size={20}
                        />
                        <div className="text-sm font-medium">{user.name}</div>
                    </div>
                ) : (
                    <div className="font-light text-neutral-500">
                        {data.minutes} min
                    </div>
                )}
            </div>
        </div>
    );
});

export default RecipeCard;
