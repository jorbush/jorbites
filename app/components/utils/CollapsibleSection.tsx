'use client';

import { useState } from 'react';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';

interface CollapsibleSectionProps {
    title: string;
    description: string;
    children: React.ReactNode;
}

const CollapsibleSection: React.FC<CollapsibleSectionProps> = ({
    title,
    description,
    children,
}) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="rounded-lg border dark:border-neutral-700">
            <div
                className="flex cursor-pointer items-center justify-between p-4"
                onClick={() => setIsOpen(!isOpen)}
            >
                <div>
                    <h3 className="font-semibold">{title}</h3>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        {description}
                    </p>
                </div>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
            </div>
            {isOpen && <div className="p-4">{children}</div>}
        </div>
    );
};

export default CollapsibleSection;
