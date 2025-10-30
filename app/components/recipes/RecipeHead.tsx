'use client';

import { useState } from 'react';
import { FiChevronLeft, FiChevronRight, FiShare2 } from 'react-icons/fi';
import Heading from '@/app/components/navigation/Heading';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useTranslation } from 'react-i18next';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [[_page, direction], setPage] = useState([0, 0]);
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
        const newIndex =
            currentImageIndex === 0
                ? imagesSrc.length - 1
                : currentImageIndex - 1;
        setPage([newIndex, -1]);
        setCurrentImageIndex(newIndex);
    };

    const goToNextImage = () => {
        const newIndex =
            currentImageIndex === imagesSrc.length - 1
                ? 0
                : currentImageIndex + 1;
        setPage([newIndex, 1]);
        setCurrentImageIndex(newIndex);
    };

    // Swipe threshold for touch gesture detection
    // Higher values require more deliberate swipes to prevent accidental navigation
    const SWIPE_CONFIDENCE_THRESHOLD = 10000;
    const swipePower = (offset: number, velocity: number) => {
        return Math.abs(offset) * velocity;
    };

    const paginate = (newDirection: number) => {
        if (newDirection === 1) {
            goToNextImage();
        } else {
            goToPreviousImage();
        }
    };

    const handleDragEnd = (
        _e: MouseEvent | TouchEvent | PointerEvent,
        { offset, velocity }: { offset: { x: number }; velocity: { x: number } }
    ) => {
        const swipe = swipePower(offset.x, velocity.x);
        if (swipe < -SWIPE_CONFIDENCE_THRESHOLD) {
            paginate(1);
        } else if (swipe > SWIPE_CONFIDENCE_THRESHOLD) {
            paginate(-1);
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
                    onClick={share}
                    aria-label="Share"
                >
                    <FiShare2 className="text-xl" />
                </button>
            </div>
            <div className="relative h-[60vh] w-full overflow-hidden rounded-xl">
                <AnimatePresence
                    initial={false}
                    custom={direction}
                >
                    <motion.div
                        key={currentImageIndex}
                        custom={direction}
                        variants={{
                            enter: (direction: number) => ({
                                x: direction > 0 ? '100%' : '-100%',
                            }),
                            center: {
                                zIndex: 1,
                                x: 0,
                            },
                            exit: (direction: number) => ({
                                zIndex: 0,
                                x: direction < 0 ? '100%' : '-100%',
                            }),
                        }}
                        initial="enter"
                        animate="center"
                        exit="exit"
                        transition={{
                            x: { type: 'spring', stiffness: 300, damping: 30 },
                        }}
                        drag={imagesSrc.length > 1 ? 'x' : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={1}
                        onDragEnd={handleDragEnd}
                        className="absolute h-full w-full overflow-hidden rounded-xl"
                    >
                        <CustomProxyImage
                            src={
                                imagesSrc[currentImageIndex] || '/avocado.webp'
                            }
                            fill
                            priority={true}
                            className="rounded-xl object-cover"
                            alt="Recipe Image"
                            maxQuality={true}
                            quality="auto:best"
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                            preloadViaProxy={true}
                        />
                    </motion.div>
                </AnimatePresence>
                {imagesSrc.length > 1 && (
                    <>
                        <div
                            className="absolute top-0 bottom-0 left-0 z-10 flex w-1/4 items-center justify-center transition-colors hover:bg-black/10"
                            onClick={goToPreviousImage}
                            data-testid="prev-button"
                        >
                            <div className="absolute top-1/2 left-3 -translate-y-1/2 transform rounded-full bg-white/90 p-2 shadow-lg transition-colors hover:bg-white">
                                <FiChevronLeft className="cursor-pointer text-2xl text-gray-800" />
                            </div>
                        </div>
                        <div
                            className="absolute top-0 right-0 bottom-0 z-10 flex w-1/4 items-center justify-center transition-colors hover:bg-black/10"
                            onClick={goToNextImage}
                            data-testid="next-button"
                        >
                            <div className="absolute top-1/2 right-3 -translate-y-1/2 transform rounded-full bg-white/90 p-2 shadow-lg transition-colors hover:bg-white">
                                <FiChevronRight className="cursor-pointer text-2xl text-gray-800" />
                            </div>
                        </div>
                        {/* Dot Indicators */}
                        <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 transform gap-2">
                            {imagesSrc.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => {
                                        const newDirection =
                                            index > currentImageIndex ? 1 : -1;
                                        setPage([index, newDirection]);
                                        setCurrentImageIndex(index);
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
