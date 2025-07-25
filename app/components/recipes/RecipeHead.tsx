'use client';

import { useState } from 'react';
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
        setCurrentImageIndex((prevIndex) =>
            prevIndex === 0 ? imagesSrc.length - 1 : prevIndex - 1
        );
    };

    const goToNextImage = () => {
        setCurrentImageIndex((prevIndex) =>
            prevIndex === imagesSrc.length - 1 ? 0 : prevIndex + 1
        );
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
                <CustomProxyImage
                    src={imagesSrc[currentImageIndex] || '/avocado.webp'}
                    fill
                    priority={true}
                    className="object-cover"
                    alt="Recipe Image"
                    maxQuality={true}
                    quality="auto:best"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    preloadViaProxy={true}
                />
                {imagesSrc.length > 1 && (
                    <>
                        <div
                            className="absolute top-0 bottom-0 left-0 flex w-1/4 items-center justify-center"
                            onClick={goToPreviousImage}
                            data-testid="prev-button"
                        >
                            <div className="absolute top-1/2 left-3 -translate-y-1/2 transform">
                                <FiChevronLeft className="cursor-pointer text-2xl text-white" />
                            </div>
                        </div>
                        <div
                            className="absolute top-0 right-0 bottom-0 flex w-1/4 items-center justify-center"
                            onClick={goToNextImage}
                            data-testid="next-button"
                        >
                            <div className="absolute top-1/2 right-3 -translate-y-1/2 transform">
                                <FiChevronRight className="cursor-pointer text-2xl text-white" />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </>
    );
};

export default RecipeHead;
