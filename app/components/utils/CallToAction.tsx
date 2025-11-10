'use client';

import React from 'react';
import Button from '../buttons/Button';

interface CallToActionProps {
    icon?: React.ReactNode;
    title: string;
    subtitle: string;
    buttonText: string;
    onClick: () => void;
}

const CallToAction: React.FC<CallToActionProps> = ({
    icon,
    title,
    subtitle,
    buttonText,
    onClick,
}) => {
    return (
        <div className="flex w-full flex-row items-center justify-center">
            <div className="border-green-450/20 from-green-450/10 to-green-450/20 dark:border-green-450/30 dark:from-green-450/10 dark:to-green-450/20 w-full max-w-2xl rounded-lg border-2 border-dashed bg-gradient-to-r p-8 text-center">
                <div className="mx-auto max-w-md">
                    {icon && <div className="mb-4 text-4xl">{icon}</div>}
                    <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100">
                        {title}
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-neutral-400">
                        {subtitle}
                    </p>
                    <Button
                        label={buttonText}
                        onClick={onClick}
                        dataCy="action-button"
                    />
                </div>
            </div>
        </div>
    );
};

export default CallToAction;
