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
            className={`mt-8 rounded-lg bg-green-50 p-4 text-center dark:bg-gray-800 sm:p-6`}
        >
            <h3 className="mb-2 text-lg font-semibold dark:text-white sm:text-xl">
                {title}
            </h3>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                {subtitle}
            </p>
            <button
                data-testid="action-button"
                onClick={onClick}
                className="rounded-full bg-green-450 px-4 py-2 text-sm text-white transition-colors hover:bg-green-500 dark:text-black sm:px-6 sm:text-base"
            >
                {buttonText}
            </button>
        </div>
    );
};

export default ActionCard;
