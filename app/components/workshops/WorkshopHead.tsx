'use client';

import { FiChevronLeft, FiShare2 } from 'react-icons/fi';
import Heading from '@/app/components/navigation/Heading';
import { useRouter } from 'next/navigation';
import CustomProxyImage from '@/app/components/optimization/CustomProxyImage';
import useShare from '@/app/hooks/useShare';

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
    const router = useRouter();
    const { share } = useShare();

    const workshopDate = new Date(date);
    const formattedDate = new Intl.DateTimeFormat('default', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
    }).format(workshopDate);

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
                    subtitle={formattedDate}
                    center
                    dataCy="workshop-title-display"
                />
                <button
                    className="ml-4 flex translate-y-3 cursor-pointer items-center space-x-2 text-gray-600 focus:outline-hidden md:translate-y-0 dark:text-neutral-100"
                    onClick={() => share()}
                    aria-label="Share"
                >
                    <FiShare2 className="text-xl" />
                </button>
            </div>
            <div className="relative h-[60vh] w-full overflow-hidden rounded-xl">
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
        </>
    );
};

export default WorkshopHead;
