'use client';

import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { FiSearch } from 'react-icons/fi';
import { useTranslation } from 'react-i18next';
import debounce from 'lodash/debounce';
import Modal from '@/app/components/modals/Modal';

interface RecipeSelectModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (recipe: any) => void;
}

const RecipeSelectModal: React.FC<RecipeSelectModalProps> = ({
    isOpen,
    onClose,
    onSelect,
}) => {
    const { t } = useTranslation();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const debouncedSearch = useRef(
        debounce(async (searchQuery: string) => {
            if (searchQuery.trim().length < 2) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const response = await axios.get(
                    `/api/search?q=${encodeURIComponent(searchQuery)}&type=recipes`
                );
                setResults(response.data.recipes || []);
            } catch (error) {
                console.error('Recipe search failed:', error);
            } finally {
                setIsLoading(false);
            }
        }, 300)
    ).current;

    useEffect(() => {
        if (isOpen) {
            debouncedSearch(query);
        }
    }, [query, isOpen, debouncedSearch]);

    // Reset state on close
    const handleClose = () => {
        setQuery('');
        setResults([]);
        onClose();
    };

    const bodyContent = (
        <div className="flex flex-col gap-4 text-black dark:text-neutral-100">
            {/* Search Bar */}
            <div className="relative">
                <FiSearch
                    className="absolute top-3.5 left-3 text-neutral-400"
                    size={18}
                />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                        t('search_recipes_placeholder') ||
                        'Search recipes by title...'
                    }
                    aria-label={
                        t('search_recipes_placeholder') || 'Search recipes'
                    }
                    className="focus:border-neutral-450 w-full rounded-xl border border-neutral-200 bg-neutral-50 py-3 pr-4 pl-10 text-sm font-light text-neutral-900 outline-hidden dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-100 dark:focus:border-neutral-700"
                    autoFocus
                />
            </div>

            {/* Results List */}
            <div className="max-h-[300px] overflow-y-auto pr-1">
                {isLoading ? (
                    <div className="py-6 text-center text-sm font-light text-neutral-400">
                        {t('loading') || 'Loading...'}
                    </div>
                ) : results.length > 0 ? (
                    <div className="flex flex-col gap-2">
                        {results.map((recipe) => (
                            <div
                                key={recipe.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => {
                                    onSelect(recipe);
                                    handleClose();
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' || e.key === ' ') {
                                        e.preventDefault();
                                        onSelect(recipe);
                                        handleClose();
                                    }
                                }}
                                className="dark:hover:bg-neutral-850 flex cursor-pointer flex-row items-center gap-3 rounded-xl p-2 transition hover:bg-neutral-100"
                            >
                                {recipe.imageSrc && (
                                    <img
                                        src={recipe.imageSrc}
                                        alt={recipe.title}
                                        className="size-12 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex flex-col">
                                    <span className="text-sm font-semibold">
                                        {recipe.title}
                                    </span>
                                    {recipe.user && (
                                        <span className="text-xs font-light text-neutral-400">
                                            by {recipe.user.name || 'Anonymous'}
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : query.trim().length >= 2 ? (
                    <div className="text-neutral-450 py-6 text-center text-sm font-light">
                        {t('no_recipes_found')}
                    </div>
                ) : (
                    <div className="text-neutral-450 py-8 text-center text-sm font-light dark:text-neutral-500">
                        {t('type_to_search') ||
                            'Type at least 2 characters to search'}
                    </div>
                )}
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            onSubmit={handleClose}
            title={t('select_recipe') || 'Select Recipe'}
            actionLabel={t('cancel') || 'Cancel'}
            body={bodyContent}
        />
    );
};

export default RecipeSelectModal;
