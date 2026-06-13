'use client';

import React, { useSyncExternalStore } from 'react';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface ButtonSelectorProps {
    sortOrder: 'asc' | 'desc';
    onSortChange: (_sortOrder: 'asc' | 'desc') => void;
}

const subscribe = () => () => {};

const ButtonSelector: React.FC<ButtonSelectorProps> = ({
    sortOrder,
    onSortChange,
}) => {
    const mounted = useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );
    const { t } = useTranslation();

    const toggleSortOrder = () => {
        const newOrder = sortOrder === 'asc' ? 'desc' : 'asc';
        onSortChange(newOrder);
    };

    return (
        <button
            type="button"
            onClick={toggleSortOrder}
            className="flex cursor-pointer items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
            {sortOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            {sortOrder === 'asc'
                ? mounted
                    ? t('oldest_first')
                    : 'oldest_first'
                : mounted
                  ? t('newest_first')
                  : 'newest_first'}
        </button>
    );
};

export default ButtonSelector;
