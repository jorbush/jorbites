'use client';

import React, { useEffect, useState } from 'react';
import { FaSortAmountDown, FaSortAmountUp } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';

interface ButtonSelectorProps {
    sortOrder: 'asc' | 'desc';
    onSortChange: (sortOrder: 'asc' | 'desc') => void;
}

const ButtonSelector: React.FC<ButtonSelectorProps> = ({
    sortOrder,
    onSortChange,
}) => {
    const [currentOrder, setCurrentOrder] = useState<'asc' | 'desc'>(sortOrder);
    const { t } = useTranslation();

    useEffect(() => {
        setCurrentOrder(sortOrder);
    }, [sortOrder]);

    const toggleSortOrder = () => {
        const newOrder = currentOrder === 'asc' ? 'desc' : 'asc';
        setCurrentOrder(newOrder);
        onSortChange(newOrder);
    };

    return (
        <button
            onClick={toggleSortOrder}
            className="flex items-center gap-2 rounded-lg px-3 py-1 text-sm font-medium text-neutral-700 hover:bg-neutral-200 dark:text-neutral-200 dark:hover:bg-neutral-800"
        >
            {currentOrder === 'asc' ? <FaSortAmountUp /> : <FaSortAmountDown />}
            {currentOrder === 'asc' ? t('oldest_first') : t('newest_first')}
        </button>
    );
};

export default ButtonSelector;
