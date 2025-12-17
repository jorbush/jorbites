'use client';

import { useState, useRef, useEffect } from 'react';
import { FiChevronLeft, FiChevronRight, FiShare2 } from 'react-icons/fi';
import Heading from '@/app/components/navigation/Heading';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';

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
    const touchStartX = useRef<number>(0);
    const touchEndX = useRef<number>(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const router = useRouter();
    const { t } = useTranslation();

    const copyToClipboard = () => {
        const currentURL = window.location.href;
        navigator.clipboard.writeText(currentURL);
        toast.success(t('link_copied'));
    };

    const share = () => {
        if (navigator.share) {
            navigator
                .share({
                    title: document.title,
                    url: window.location.href,
                })
                .then(() => {
                    console.log('Successfully shared');
                })
                .catch((error) => {
                    console.error('Error sharing:', error);
                });
        } else {
            copyToClipboard();
        }
    };

    const goToPreviousImage = () => {
        if (isTransitioning || imagesSrc.length <= 1) return;
        setIsTransitioning(true);
        const newIndex =
            currentImageIndex === 0
                ? imagesSrc.length - 1
                : currentImageIndex - 1;
        setCurrentImageIndex(newIndex);
    };

    const goToNextImage = () => {
        if (isTransitioning || imagesSrc.length <= 1) return;
        setIsTransitioning(true);
        const newIndex =
            currentImageIndex === imagesSrc.length - 1
                ? 0
                : currentImageIndex + 1;
        setCurrentImageIndex(newIndex);
    };

    const goToImage = (index: number) => {
        if (isTransitioning || index === currentImageIndex) return;
        setIsTransitioning(true);
        setCurrentImageIndex(index);
    };

    // Reset transition state after animation completes
    useEffect(() => {
        if (isTransitioning) {
            const timer = setTimeout(() => {
                setIsTransitioning(false);
            }, 300); // Match CSS transition duration
            return () => clearTimeout(timer);
        }
    }, [isTransitioning]);

    // Touch handlers for swipe functionality
    const handleTouchStart = (e: React.TouchEvent) => {
        if (imagesSrc.length <= 1) return;
        touchStartX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (imagesSrc.length <= 1) return;
        touchEndX.current = e.touches[0].clientX;
    };

    const handleTouchEnd = () => {
        if (imagesSrc.length <= 1) return;
        const swipeThreshold = 50; // Minimum swipe distance in pixels
        const diff = touchStartX.current - touchEndX.current;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                // Swiped left, go to next image
                goToNextImage();
            } else {
                // Swiped right, go to previous image
                goToPreviousImage();
            }
        }

        touchStartX.current = null as unknown as number;
        touchEndX.current = null as unknown as number;
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
                    onClick={share}
                    aria-label="Share"
                >
                    <FiShare2 className="text-xl" />
                </button>
            </div>
            <div
                ref={containerRef}
                className="relative h-[60vh] w-full overflow-hidden rounded-xl"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {imagesSrc.map((src, index) => (
                    <div
                        key={index}
                        className="absolute h-full w-full overflow-hidden rounded-xl transition-opacity duration-300 ease-in-out"
                        style={{
                            opacity: index === currentImageIndex ? 1 : 0,
                            pointerEvents:
                                index === currentImageIndex ? 'auto' : 'none',
                            zIndex: index === currentImageIndex ? 1 : 0,
                        }}
                    >
                        <CustomProxyImage
                            src={src || '/avocado.webp'}
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
                                    onClick={() => goToImage(index)}
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
