'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface CollapsibleSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
    dataCy?: string;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    description,
    children,
    dataCy,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="rounded-lg border dark:border-neutral-700">
            <button
                type="button"
                className="flex w-full cursor-pointer items-center justify-between border-0 bg-transparent p-4 text-left focus:outline-hidden"
                onClick={() => setIsOpen(!isOpen)}
                data-cy={dataCy}
            >
                <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {description}
                    </p>
                </div>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </button>
            {isOpen && <div className="p-4">{children}</div>}
        </div>
    );
};

export default CollapsibleSection;
