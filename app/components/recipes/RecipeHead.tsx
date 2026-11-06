'use client';

import { useState, useRef, useEffect, useMemo, TouchEvent } from 'react';
import { FiChevronLeft, FiChevronRight, FiShare2 } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import Heading from '@/app/components/navigation/Heading';
import { useRouter } from 'next/navigation';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import useShare from '@/app/hooks/useShare';
import useIsMounted from '@/app/hooks/useIsMounted';
import ViewTransition from '@/app/components/utils/ViewTransition';

interface RecipeHeadProps {
    id?: string;
    title: string;
    minutes: string;
    prepTime?: number | null;
    cookTime?: number | null;
    imagesSrc: string[];
}

const RecipeHead: React.FC<RecipeHeadProps> = ({
    id,
    title,
    minutes,
    prepTime,
    cookTime,
    imagesSrc,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const isTransitioning = useRef(false);
    const { back } = useRouter() || {};
    const { share } = useShare();
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const { t } = useTranslation();
    const mounted = useIsMounted();

    const subtitleText = useMemo(() => {
        const prepLabel = mounted ? (t('prep_short') ?? 'Prep') : 'Prep';
        const cookLabel = mounted ? (t('cook_short') ?? 'Cook') : 'Cook';
        const parts: string[] = [];
        if (prepTime) parts.push(`${prepLabel}: ${prepTime}m`);
        if (cookTime) parts.push(`${cookLabel}: ${cookTime}m`);
        if (parts.length > 0) {
            return `${minutes} min (${parts.join(' · ')})`;
        }
        return `${minutes} min`;
    }, [minutes, prepTime, cookTime, mounted, t]);

    useEffect(() => {
        if (isTransitioning.current) {
            const timeout = setTimeout(() => {
                isTransitioning.current = false;
            }, 300);
            return () => clearTimeout(timeout);
        }
    }, [currentImageIndex]);

    const startTransition = (newIndex: number) => {
        isTransitioning.current = true;
        setCurrentImageIndex(newIndex);
    };

    const goToPreviousImage = () => {
        if (isTransitioning.current) return;
        const newIndex =
            currentImageIndex === 0
                ? imagesSrc.length - 1
                : currentImageIndex - 1;
        startTransition(newIndex);
    };

    const goToNextImage = () => {
        if (isTransitioning.current) return;
        const newIndex =
            currentImageIndex === imagesSrc.length - 1
                ? 0
                : currentImageIndex + 1;
        startTransition(newIndex);
    };

    const handleTouchStart = (e: TouchEvent) => {
        if (imagesSrc.length <= 1) return;
        touchStartX.current = e.touches[0].clientX;
        touchEndX.current = touchStartX.current;
    };

    const handleTouchMove = (e: TouchEvent) => {
        if (imagesSrc.length <= 1) return;
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (imagesSrc.length <= 1 || isTransitioning.current) return;
        const swipeDistance = touchStartX.current - touchEndX.current;
        const minSwipeDistance = 50;

        if (swipeDistance > minSwipeDistance) {
            goToNextImage();
        } else if (swipeDistance < -minSwipeDistance) {
            goToPreviousImage();
        }
    };

    return (
        <>
            {/* Header: Back, Title, Share aligned in the same row */}
            <div className="mb-4 flex items-center justify-between gap-2 sm:mb-6 sm:gap-4 sm:px-2">
                <button
                    type="button"
                    className="group inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:text-neutral-900 focus:outline-hidden md:w-auto dark:text-neutral-400 dark:hover:text-white"
                    onClick={() => back()}
                    aria-label="Go back"
                    data-cy="back-button"
                >
                    <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 group-hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:border-neutral-600">
                        <FiChevronLeft size={18} />
                    </div>
                    <span className="hidden text-xs font-semibold md:inline">
                        {mounted ? t('back') || 'Back' : 'Back'}
                    </span>
                </button>

                <div className="min-w-0 flex-1">
                    <Heading
                        title={title}
                        subtitle={subtitleText}
                        center
                        dataCy="recipe-title-display"
                    />
                </div>

                <button
                    type="button"
                    className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 focus:outline-hidden md:w-auto md:gap-2 md:px-3 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                    onClick={() => share()}
                    aria-label="Share"
                    data-cy="share-button"
                >
                    <FiShare2 size={16} />
                    <span className="hidden text-xs font-semibold md:inline">
                        {mounted ? t('share') || 'Share' : 'Share'}
                    </span>
                </button>
            </div>

            {/* Hero Image Carousel */}
            <div
                className="relative h-[60vh] w-full overflow-hidden rounded-2xl border border-neutral-200/80 shadow-xs dark:border-neutral-800"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {imagesSrc.map((imageSrc, index) => (
                    <div
                        key={imageSrc}
                        className="absolute size-full transition-[transform,opacity] duration-300 ease-in-out"
                        style={{
                            transform: `translateX(${
                                (index - currentImageIndex) * 100
                            }%)`,
                            opacity: index === currentImageIndex ? 1 : 0,
                            pointerEvents:
                                index === currentImageIndex ? 'auto' : 'none',
                        }}
                    >
                        {index === 0 ? (
                            <ViewTransition
                                name={id ? `recipe-image-${id}` : undefined}
                                share="morph"
                                default="none"
                            >
                                <CustomProxyImage
                                    src={imageSrc || '/avocado.webp'}
                                    fill
                                    priority={true}
                                    className="rounded-2xl object-cover"
                                    alt="Recipe Image"
                                    maxQuality={true}
                                    quality="auto:best"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                                    preloadViaProxy={true}
                                />
                            </ViewTransition>
                        ) : (
                            <CustomProxyImage
                                src={imageSrc || '/avocado.webp'}
                                fill
                                priority={false}
                                className="rounded-2xl object-cover"
                                alt="Recipe Image"
                                maxQuality={true}
                                quality="auto:best"
                                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                                preloadViaProxy={false}
                            />
                        )}
                    </div>
                ))}
                {imagesSrc.length > 1 && (
                    <>
                        <div
                            className="absolute top-0 bottom-0 left-0 z-[2] flex w-1/4 items-center justify-center transition-colors duration-200 hover:bg-gradient-to-r hover:from-black/10 hover:to-transparent"
                            style={{ pointerEvents: 'none' }}
                            data-testid="prev-button"
                        >
                            <button
                                type="button"
                                className="absolute top-1/2 left-3 flex size-9 -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full border border-neutral-200/60 bg-white/90 text-neutral-800 shadow-md backdrop-blur-xs transition-colors duration-200 hover:bg-white focus:outline-hidden dark:border-neutral-700/60 dark:bg-neutral-800/90 dark:text-neutral-100 dark:hover:bg-neutral-800"
                                style={{ pointerEvents: 'auto' }}
                                onClick={goToPreviousImage}
                                aria-label="Previous image"
                            >
                                <FiChevronLeft className="cursor-pointer text-xl" />
                            </button>
                        </div>

                        <div
                            className="absolute top-0 right-0 bottom-0 z-[2] flex w-1/4 items-center justify-center transition-colors duration-200 hover:bg-gradient-to-l hover:from-black/10 hover:to-transparent"
                            style={{ pointerEvents: 'none' }}
                            data-testid="next-button"
                        >
                            <button
                                type="button"
                                className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 transform cursor-pointer items-center justify-center rounded-full border border-neutral-200/60 bg-white/90 text-neutral-800 shadow-md backdrop-blur-xs transition-colors duration-200 hover:bg-white focus:outline-hidden dark:border-neutral-700/60 dark:bg-neutral-800/90 dark:text-neutral-100 dark:hover:bg-neutral-800"
                                style={{ pointerEvents: 'auto' }}
                                onClick={goToNextImage}
                                aria-label="Next image"
                            >
                                <FiChevronRight className="cursor-pointer text-xl" />
                            </button>
                        </div>
                        {/* Dot Indicators */}
                        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 transform">
                            {imagesSrc.map((imageSrc, index) => (
                                <button
                                    key={`dot-${imageSrc}`}
                                    type="button"
                                    onClick={() => {
                                        if (isTransitioning.current) return;
                                        startTransition(index);
                                    }}
                                    className="group flex h-12 cursor-pointer items-center justify-center p-2 focus:outline-hidden"
                                    aria-label={`Go to image ${index + 1}`}
                                    data-testid={`dot-indicator-${index}`}
                                >
                                    <span
                                        className={`h-2 rounded-full transition-[width,background-color] duration-300 ${
                                            index === currentImageIndex
                                                ? 'w-8 bg-white'
                                                : 'w-2 bg-white/60 group-hover:bg-white/80'
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default RecipeHead;
