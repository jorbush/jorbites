import React from 'react';
import { FiCheckCircle, FiClock, FiCircle } from 'react-icons/fi';

export const getQuestStatusIcon = (status: string) => {
    switch (status) {
        case 'open':
            return <FiCircle size={13} />;
        case 'in_progress':
            return (
                <FiClock
                    className="dark:text-green-450 text-neutral-800"
                    size={13}
                />
            );
        case 'completed':
            return (
                <FiCheckCircle
                    className="text-neutral-600 dark:text-neutral-300"
                    size={13}
                />
            );
        default:
            return <FiCircle size={13} />;
    }
};

export const getQuestStatusColor = (status: string) => {
    switch (status) {
        case 'in_progress':
            return 'border border-green-450/40 bg-green-450/15 text-neutral-800 dark:text-green-450';
        case 'open':
            return 'border border-neutral-200/80 bg-neutral-100 text-neutral-700 dark:border-neutral-700/60 dark:bg-neutral-800 dark:text-neutral-300';
        case 'completed':
            return 'border border-neutral-200/80 bg-neutral-50 text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900/50 dark:text-neutral-400';
        default:
            return 'border border-neutral-200/80 bg-neutral-100 text-neutral-700 dark:border-neutral-800 dark:bg-neutral-800 dark:text-neutral-300';
    }
};
