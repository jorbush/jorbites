'use client';

import { useMemo } from 'react';
import { FiChevronLeft, FiShare2 } from 'react-icons/fi';
import Heading from '@/app/components/navigation/Heading';
import { useRouter } from 'next/navigation';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import useShare from '@/app/hooks/useShare';
import { useTranslation } from 'react-i18next';
import { formatDateLanguage } from '@/app/utils/date-utils';

interface WorkshopHeadProps {
    title: string;
    date: string;
    imageSrc: string;
}

const WorkshopHead: React.FC<WorkshopHeadProps> = ({
    title,
    date,
    imageSrc,
}) => {
    const { back } = useRouter() || {};
    const { share } = useShare();
    const { i18n } = useTranslation();

    const formattedDate = useMemo(() => {
        return formatDateLanguage(date, 'MMM d, yyyy', i18n?.language);
    }, [date, i18n?.language]);

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between gap-2 sm:gap-4">
                <button
                    type="button"
                    className="group inline-flex shrink-0 cursor-pointer items-center gap-2 text-sm font-semibold text-neutral-600 transition-colors duration-200 hover:text-neutral-900 focus:outline-hidden md:w-auto dark:text-neutral-400 dark:hover:text-white"
                    onClick={() => back()}
                    aria-label="Back"
                >
                    <div className="flex size-9 items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 group-hover:border-neutral-300 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:group-hover:border-neutral-600">
                        <FiChevronLeft size={18} />
                    </div>
                </button>

                <div className="flex-1 text-center">
                    <Heading
                        title={title}
                        subtitle={formattedDate}
                        center
                        dataCy="workshop-title-display"
                    />
                </div>

                <button
                    type="button"
                    className="flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-neutral-200/80 bg-white text-neutral-700 shadow-2xs transition-colors duration-200 hover:border-neutral-300 focus:outline-hidden dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300 dark:hover:border-neutral-600"
                    onClick={() => share()}
                    aria-label="Share"
                >
                    <FiShare2 size={16} />
                </button>
            </div>

            <div className="relative h-[45vh] w-full overflow-hidden rounded-2xl border border-neutral-200/80 shadow-xs sm:h-[55vh] dark:border-neutral-800">
                <CustomProxyImage
                    src={imageSrc || '/jorbites-social.jpg'}
                    fill
                    priority={true}
                    className="object-cover"
                    alt="Workshop Image"
                    maxQuality={true}
                    quality="auto:best"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
                    preloadViaProxy={true}
                />
            </div>
        </div>
    );
};

export default WorkshopHead;
