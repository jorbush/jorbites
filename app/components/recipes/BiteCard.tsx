'use client';

import React, { useState, useRef, useMemo } from 'react';
import { SafeRecipe, SafeUser } from '@/app/types';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import Avatar from '@/app/components/utils/Avatar';
import {
    FaHeart,
    FaTimes,
    FaEye,
    FaStar,
    FaClock,
    FaFire,
} from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { preparationMethods } from '@/app/components/modals/recipe-steps/preparationMethodsData';
import { CuisineIcon } from '@/app/components/recipes/CuisineIcon';

interface BiteCardProps {
    recipe: SafeRecipe & {
        user?: {
            id?: string;
            name?: string | null;
            image?: string | null;
        } | null;
    };
    currentUser?: SafeUser | null;
    isTop: boolean;
    onSwipeRight: (recipe: SafeRecipe) => void;
    onSwipeLeft: (recipe: SafeRecipe) => void;
    onSwipeUp: (recipe: SafeRecipe) => void;
}

const getCoords = (e: React.PointerEvent<HTMLDivElement>) => {
    const native = e.nativeEvent as any;
    return {
        x:
            e.clientX ??
            native?.clientX ??
            (e as any).pageX ??
            native?.pageX ??
            0,
        y:
            e.clientY ??
            native?.clientY ??
            (e as any).pageY ??
            native?.pageY ??
            0,
    };
};

const BiteCard: React.FC<BiteCardProps> = ({
    recipe,
    isTop,
    onSwipeRight,
    onSwipeLeft,
    onSwipeUp,
}) => {
    const { t } = useTranslation();
    const methodData = useMemo(
        () => preparationMethods.find((m) => m.label === recipe.method),
        [recipe.method]
    );
    const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({
        x: 0,
        y: 0,
    });
    const dragOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
    const cardRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isTop) return;
        const coords = getCoords(e);
        isDraggingRef.current = true;
        setIsDragging(true);
        dragStartRef.current = coords;
        dragOffsetRef.current = { x: 0, y: 0 };
        if (
            cardRef.current &&
            typeof cardRef.current.setPointerCapture === 'function'
        ) {
            cardRef.current.setPointerCapture(e.pointerId);
        }
    };

    const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!isDraggingRef.current || !isTop) return;
        const coords = getCoords(e);
        const deltaX = coords.x - dragStartRef.current.x;
        const deltaY = coords.y - dragStartRef.current.y;
        dragOffsetRef.current = { x: deltaX, y: deltaY };
        setDragOffset({ x: deltaX, y: deltaY });
    };

    const handlePointerUp = () => {
        if (!isDraggingRef.current || !isTop) return;
        isDraggingRef.current = false;
        setIsDragging(false);

        const thresholdX = 85;
        const thresholdY = -100;
        const currentOffset = dragOffsetRef.current;

        if (currentOffset.x > thresholdX) {
            onSwipeRight(recipe);
        } else if (currentOffset.x < -thresholdX) {
            onSwipeLeft(recipe);
        } else if (currentOffset.y < thresholdY) {
            onSwipeUp(recipe);
        }

        dragOffsetRef.current = { x: 0, y: 0 };
        setDragOffset({ x: 0, y: 0 });
    };

    // Calculate rotation & overlay opacities based on dragOffset
    const rotate = (dragOffset.x || 0) / 20;
    const rightOpacity = Math.min(Math.max((dragOffset.x || 0) / 80, 0), 1);
    const leftOpacity = Math.min(Math.max(-(dragOffset.x || 0) / 80, 0), 1);
    const upOpacity = Math.min(Math.max(-(dragOffset.y || 0) / 90, 0), 1);

    const transformStyle = isTop
        ? {
              transform: `translate3d(${dragOffset.x}px, ${dragOffset.y}px, 0px) rotate(${rotate}deg)`,
              transition: isDragging
                  ? 'none'
                  : 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
              touchAction: 'none' as const,
          }
        : {};

    return (
        <div
            ref={cardRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={transformStyle}
            className={`absolute inset-0 h-full w-full overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-xl select-none ${
                isTop
                    ? 'z-5 cursor-grab active:cursor-grabbing'
                    : 'pointer-events-none z-0 scale-95 opacity-80'
            }`}
            data-testid={`bite-card-${recipe.id}`}
        >
            {/* Background Image with Gradient Overlay */}
            <div className="relative h-full w-full">
                <CustomProxyImage
                    src={recipe.imageSrc || '/avocado.webp'}
                    alt={recipe.title}
                    fill
                    priority={isTop}
                    className="pointer-events-none size-full object-cover"
                    quality="auto:eco"
                />

                {/* Gradient Overlays for visual depth & text readability */}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

                {/* Gesture Swipe Feedback Badges */}
                {isTop && (
                    <>
                        {/* Right / Save Badge */}
                        <div
                            style={{ opacity: rightOpacity }}
                            className="border-green-450 bg-green-450/20 text-green-450 pointer-events-none absolute top-8 left-8 z-10 flex -rotate-12 transform items-center gap-2 rounded-2xl border-4 px-5 py-2 text-2xl font-black tracking-wider uppercase backdrop-blur-md transition-opacity duration-75"
                        >
                            <FaHeart className="text-green-450" />{' '}
                            {t('bite_cards_save')}
                        </div>

                        {/* Left / Skip Badge */}
                        <div
                            style={{ opacity: leftOpacity }}
                            className="pointer-events-none absolute top-8 right-8 z-10 flex rotate-12 transform items-center gap-2 rounded-2xl border-4 border-rose-500 bg-rose-500/20 px-5 py-2 text-2xl font-black tracking-wider text-rose-400 uppercase backdrop-blur-md transition-opacity duration-75"
                        >
                            <FaTimes className="text-rose-400" />{' '}
                            {t('bite_cards_skip')}
                        </div>

                        {/* Up / View Badge */}
                        <div
                            style={{ opacity: upOpacity }}
                            className="pointer-events-none absolute bottom-36 left-1/2 z-10 flex -translate-x-1/2 items-center gap-2 rounded-2xl border-4 border-amber-400 bg-amber-400/20 px-5 py-2 text-2xl font-black tracking-wider text-amber-300 uppercase backdrop-blur-md transition-opacity duration-75"
                        >
                            <FaEye className="text-amber-300" />{' '}
                            {t('bite_cards_view')}
                        </div>
                    </>
                )}

                {/* Top Badges (Rating, Cooking Time, Calories) */}
                <div className="absolute top-5 right-5 z-10 flex flex-wrap items-center gap-2">
                    {typeof recipe.averageRating === 'number' &&
                        recipe.averageRating > 0 && (
                            <div className="flex items-center gap-1.5 rounded-full border border-amber-400/30 bg-black/60 px-3 py-1.5 text-xs font-bold text-amber-400 backdrop-blur-md">
                                <FaStar size={13} />
                                <span>{recipe.averageRating.toFixed(1)}</span>
                            </div>
                        )}
                    <div className="flex items-center gap-1.5 rounded-full border border-white/20 bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
                        <FaClock
                            size={12}
                            className="text-neutral-300"
                        />
                        <span>{recipe.minutes} min</span>
                    </div>
                    {recipe.calories && (
                        <div className="flex items-center gap-1.5 rounded-full border border-orange-400/30 bg-black/60 px-3 py-1.5 text-xs font-semibold text-orange-400 backdrop-blur-md">
                            <FaFire size={12} />
                            <span>{recipe.calories} kcal</span>
                        </div>
                    )}
                </div>

                {/* Card Bottom Details Content */}
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
                    <h2 className="text-2xl leading-tight font-extrabold tracking-tight text-white drop-shadow-md sm:text-3xl">
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
            </div>
        </div>
    );
};

export default BiteCard;
