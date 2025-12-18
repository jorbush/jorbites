'use client';

import React from 'react';
import Button from '@/app/components/buttons/Button';

interface ActionCardProps {
    title: string;
    subtitle: string;
    buttonText: string;
    onClick: () => void;
    emoji?: string;
    dataCy?: string;
    variant?: 'default' | 'secondary';
}

const ActionCard: React.FC<ActionCardProps> = ({
    title,
    subtitle,
    buttonText,
    onClick,
    emoji = '👨‍🍳',
    dataCy,
    variant = 'default',
}) => {
    if (variant === 'secondary') {
        return (
            <div className="w-full rounded-2xl bg-neutral-50 p-6 dark:bg-neutral-800/50">
                {title && (
                    <h3 className="mb-2 text-xl font-bold text-neutral-900 dark:text-white">
                        {title}
                    </h3>
                )}
                <p className="mb-6 text-neutral-600 dark:text-neutral-400">
                    {subtitle}
                </p>
                <Button
                    label={buttonText}
                    onClick={onClick}
                    dataCy={dataCy || 'action-button'}
                    outline
                />
            </div>
        );
    }

    return (
        <div className="flex w-full flex-row items-center justify-center">
            <div className="border-green-450/20 from-green-450/10 to-green-450/20 dark:border-green-450/30 dark:from-green-450/10 dark:to-green-450/20 w-full max-w-2xl rounded-lg border-2 border-dashed bg-gradient-to-r p-8 text-center">
                <div className="mx-auto max-w-md">
                    <div className="mb-4 text-4xl">{emoji}</div>
                    <h3 className="mb-3 text-xl font-bold text-gray-900 dark:text-neutral-100">
                        {title}
                    </h3>
                    <p className="mb-6 text-gray-600 dark:text-neutral-400">
                        {subtitle}
                    </p>
                    <Button
                        label={buttonText}
                        onClick={onClick}
                        dataCy={dataCy || 'action-button'}
                    />
                </div>
            </div>
        </div>
    );
};

export default ActionCard;
