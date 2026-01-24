'use client';

import { useState, useRef, useEffect, TouchEvent } from 'react';
import { FiChevronLeft, FiChevronRight, FiShare2 } from 'react-icons/fi';
import Heading from '@/app/components/navigation/Heading';
import { useRouter } from 'next/navigation';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import useShare from '@/app/hooks/useShare';

interface RecipeHeadProps {
    title: string;
    minutes: string;
    imagesSrc: string[];
}

const RecipeHead: React.FC<RecipeHeadProps> = ({
    title,
    minutes,
    imagesSrc,
}) => {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const router = useRouter();
    const { share } = useShare();
    const touchStartX = useRef(0);
    const touchEndX = useRef(0);
    const transitionTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        return () => {
            if (transitionTimeoutRef.current) {
                clearTimeout(transitionTimeoutRef.current);
            }
        };
    }, []);

    const startTransition = (newIndex: number) => {
        setIsTransitioning(true);
        setCurrentImageIndex(newIndex);

        if (transitionTimeoutRef.current) {
            clearTimeout(transitionTimeoutRef.current);
        }
        transitionTimeoutRef.current = setTimeout(() => {
            setIsTransitioning(false);
            transitionTimeoutRef.current = null;
        }, 300);
    };

    const goToPreviousImage = () => {
        if (isTransitioning) return;
        const newIndex =
            currentImageIndex === 0
                ? imagesSrc.length - 1
                : currentImageIndex - 1;
        startTransition(newIndex);
    };

    const goToNextImage = () => {
        if (isTransitioning) return;
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
        if (imagesSrc.length <= 1 || isTransitioning) return;
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
            <div className="flex items-baseline justify-between sm:mr-4 sm:ml-4">
                <button
                    className="mr-4 flex translate-y-3 cursor-pointer items-center space-x-2 text-gray-600 focus:outline-hidden md:translate-y-0 dark:text-neutral-100"
                    onClick={() => router.back()}
                >
                    <FiChevronLeft className="text-xl" />
                </button>
                <Heading
                    title={title}
                    subtitle={`${minutes} min`}
                    center
                />
                <button
                    className="ml-4 flex translate-y-3 cursor-pointer items-center space-x-2 text-gray-600 focus:outline-hidden md:translate-y-0 dark:text-neutral-100"
                    onClick={() => share()}
                    aria-label="Share"
                >
                    <FiShare2 className="text-xl" />
                </button>
            </div>
            <div
                className="relative h-[60vh] w-full overflow-hidden rounded-xl"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {imagesSrc.map((imageSrc, index) => (
                    <div
                        key={index}
                        className="absolute h-full w-full transition-all duration-300 ease-in-out"
                        style={{
                            transform: `translateX(${
                                (index - currentImageIndex) * 100
                            }%)`,
                            opacity: index === currentImageIndex ? 1 : 0,
                            pointerEvents:
                                index === currentImageIndex ? 'auto' : 'none',
                        }}
                    >
                        <CustomProxyImage
                            src={imageSrc || '/avocado.webp'}
                            fill
                            priority={index === 0}
                            className="rounded-xl object-cover"
                            alt="Recipe Image"
                            maxQuality={true}
                            quality="auto:best"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                            preloadViaProxy={index === 0}
                        />
                    </div>
                ))}
                {imagesSrc.length > 1 && (
                    <>
                        <div
                            className="absolute top-0 bottom-0 left-0 z-[2] flex w-1/4 items-center justify-center transition-colors hover:bg-gradient-to-r hover:from-black/10 hover:to-transparent"
                            style={{ pointerEvents: 'none' }}
                            data-testid="prev-button"
                        >
                            <div
                                className="absolute top-1/2 left-3 -translate-y-1/2 transform rounded-full bg-white/90 p-2 shadow-lg transition-colors hover:bg-white"
                                style={{ pointerEvents: 'auto' }}
                                onClick={goToPreviousImage}
                            >
                                <FiChevronLeft className="cursor-pointer text-2xl text-gray-800" />
                            </div>
                        </div>
                        <div
                            className="absolute top-0 right-0 bottom-0 z-[2] flex w-1/4 items-center justify-center transition-colors hover:bg-gradient-to-l hover:from-black/10 hover:to-transparent"
                            style={{ pointerEvents: 'none' }}
                            data-testid="next-button"
                        >
                            <div
                                className="absolute top-1/2 right-3 -translate-y-1/2 transform rounded-full bg-white/90 p-2 shadow-lg transition-colors hover:bg-white"
                                style={{ pointerEvents: 'auto' }}
                                onClick={goToNextImage}
                            >
                                <FiChevronRight className="cursor-pointer text-2xl text-gray-800" />
                            </div>
                        </div>
                        {/* Dot Indicators */}
                        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 transform gap-2">
                            {imagesSrc.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        if (isTransitioning) return;
                                        startTransition(index);
                                    }}
                                    className={`h-2 cursor-pointer rounded-full transition-all duration-300 ${
                                        index === currentImageIndex
                                            ? 'w-8 bg-white'
                                            : 'w-2 bg-white/60 hover:bg-white/80'
                                    }`}
                                    aria-label={`Go to image ${index + 1}`}
                                    data-testid={`dot-indicator-${index}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default RecipeHead;
