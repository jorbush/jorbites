'use client';

import { IconType } from 'react-icons';

interface SectionHeaderProps {
    icon: IconType;
    title: string;
    description?: string | undefined | null;
    className?: string;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    icon: Icon,
    title,
    description,
    className,
}) => {
    return (
        <div className={`mb-10 text-center ${className}`}>
            <h1 className="mb-3 flex items-center justify-center text-3xl font-bold sm:text-4xl dark:text-neutral-100">
                <Icon
                    className="mr-2 text-3xl sm:text-4xl"
                    aria-hidden="true"
                />
                {title}
            </h1>
            {description && (
                <p className="text-sm text-gray-600 sm:text-base dark:text-gray-300">
                    {description}
                </p>
            )}
        </div>
    );
};

export default SectionHeader;
