'use client';

import React from 'react';
import { AiFillDelete } from 'react-icons/ai';

interface SelectedQuestDisplayProps {
    selectedQuest: any | null;
    onRemoveQuest: () => void;
    t: (key: string) => string;
}

export const SelectedQuestDisplay: React.FC<SelectedQuestDisplayProps> = ({
    selectedQuest,
    onRemoveQuest,
    t,
}) => {
    if (!selectedQuest) return null;

    return (
        <div>
            <h3 className="mb-2 text-sm font-medium text-neutral-500 dark:text-neutral-400">
                {t('selected_quest') || 'Selected Quest'}
            </h3>
            <div className="rounded-lg border border-neutral-300 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
                <div className="flex items-start justify-between">
                    <div className="flex-1">
                        <p className="font-medium text-neutral-900 dark:text-neutral-100">
                            {selectedQuest.title}
                        </p>
                        <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                            {selectedQuest.description.length > 100
                                ? selectedQuest.description.substring(0, 100) +
                                  '...'
                                : selectedQuest.description}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onRemoveQuest}
                        className="ml-2 text-neutral-500 hover:text-rose-500 dark:text-neutral-400 dark:hover:text-rose-500"
                    >
                        <AiFillDelete size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
};
