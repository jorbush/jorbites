'use client';

import React from 'react';

interface ActionCardProps {
    title: string;
    subtitle: string;
    buttonText: string;
    onClick: () => void;
}

const ActionCard: React.FC<ActionCardProps> = ({
    title,
    subtitle,
    buttonText,
    onClick,
}) => {
    return (
        <div
            className={`mt-8 rounded-lg bg-green-50 p-4 text-center sm:p-6 dark:bg-gray-800`}
        >
            <h3 className="mb-2 text-lg font-semibold sm:text-xl dark:text-white">
                {title}
            </h3>
            <p className="mb-4 text-sm text-gray-600 sm:text-base dark:text-gray-300">
                {subtitle}
            </p>
            <button
                data-testid="action-button"
                onClick={onClick}
                className="bg-green-450 rounded-full px-4 py-2 text-sm text-white transition-colors hover:bg-green-500 sm:px-6 sm:text-base dark:text-black"
            >
                {buttonText}
            </button>
        </div>
    );
};

export default ActionCard;
