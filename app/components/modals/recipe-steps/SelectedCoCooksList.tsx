'use client';

import React from 'react';
import Avatar from '@/app/components/utils/Avatar';
import { AiFillDelete } from 'react-icons/ai';

interface SelectedCoCooksListProps {
    selectedCoCooks: any[];
    onRemoveCoCook: (userId: string) => void;
    t: (key: string) => string;
}

export const SelectedCoCooksList: React.FC<SelectedCoCooksListProps> = ({
    selectedCoCooks,
    onRemoveCoCook,
    t,
}) => {
    if (selectedCoCooks.length === 0) return null;

    return (
        <div>
            <h3 className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t('selected_co_cooks') || 'Selected Co-Cooks'}
                <span className="ml-1 text-xs text-neutral-400 dark:text-neutral-500">
                    ({selectedCoCooks.length}/4)
                </span>
            </h3>
            <div className="flex flex-wrap gap-2">
                {selectedCoCooks.map((user) => (
                    <div
                        key={user.id}
                        className="flex items-center gap-2 rounded-full bg-neutral-100 py-1 pr-2 pl-1 dark:bg-neutral-900"
                    >
                        <Avatar
                            src={user.image}
                            size={24}
                        />
                        <span className="text-sm text-neutral-900 dark:text-neutral-100">
                            {user.name}
                        </span>
                        <button
                            type="button"
                            onClick={() => onRemoveCoCook(user.id)}
                            className="ml-1 text-neutral-500 hover:text-rose-500 dark:text-neutral-400 dark:hover:text-rose-500"
                        >
                            <AiFillDelete size={16} />
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};
