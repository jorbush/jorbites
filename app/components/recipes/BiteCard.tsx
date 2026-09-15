'use client';

import React, { useMemo } from 'react';
import { SafeRecipe, SafeUser } from '@/app/types';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import { preparationMethods } from '@/app/components/modals/recipe-steps/preparationMethodsData';
import { useBiteCardGesture } from '@/app/hooks/useBiteCardGesture';
import BiteCardGestureBadges from './BiteCardGestureBadges';
import BiteCardTopBadges from './BiteCardTopBadges';
import BiteCardDetails from './BiteCardDetails';

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

const BiteCard: React.FC<BiteCardProps> = ({
    recipe,
    isTop,
    onSwipeRight,
    onSwipeLeft,
    onSwipeUp,
}) => {
    const methodData = useMemo(
        () => preparationMethods.find((m) => m.label === recipe.method),
        [recipe.method]
    );

    const {
        cardRef,
        transformStyle,
        handlePointerDown,
        handlePointerMove,
        handlePointerUp,
        rightOpacity,
        leftOpacity,
        upOpacity,
    } = useBiteCardGesture({
        recipe,
        isTop,
        onSwipeRight,
        onSwipeLeft,
        onSwipeUp,
    });

    return (
        <div
            ref={cardRef}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={transformStyle}
            className={`absolute inset-0 h-full w-full touch-none overflow-hidden rounded-3xl border border-neutral-800 bg-neutral-900 shadow-xl select-none ${
                isTop
                    ? 'z-5 cursor-grab active:cursor-grabbing'
                    : 'pointer-events-none z-0 scale-95 opacity-80'
            }`}
            data-testid={`bite-card-${recipe.id}`}
        >
            <div className="relative h-full w-full">
                <CustomProxyImage
                    src={recipe.imageSrc || '/avocado.webp'}
                    alt={recipe.title}
                    fill
                    priority={isTop}
                    className="pointer-events-none size-full object-cover"
                    quality="auto:eco"
                />

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-black/20" />

                {isTop && (
                    <BiteCardGestureBadges
                        rightOpacity={rightOpacity}
                        leftOpacity={leftOpacity}
                        upOpacity={upOpacity}
                    />
                )}

                <BiteCardTopBadges
                    averageRating={recipe.averageRating}
                    minutes={recipe.minutes}
                    calories={recipe.calories}
                />

                <BiteCardDetails
                    recipe={recipe}
                    methodData={methodData}
                />
            </div>
        </div>
    );
};

export default BiteCard;
