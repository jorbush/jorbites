'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import SearchInput from '@/app/components/inputs/SearchInput';
import Avatar from '@/app/components/utils/Avatar';
import { FiSearch } from 'react-icons/fi';
import { AiFillDelete } from 'react-icons/ai';
import debounce from 'lodash/debounce';

interface WhitelistUsersStepProps {
    isLoading: boolean;
    selectedUsers: any[];
    onAddUser: (user: any) => void;
    onRemoveUser: (userId: string) => void;
}

const WhitelistUsersStep: React.FC<WhitelistUsersStepProps> = ({
    isLoading,
    selectedUsers,
    onAddUser,
    onRemoveUser,
}) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{
        users: any[];
        recipes: any[];
    }>({ users: [], recipes: [] });

    const debouncedSearch = useRef(
        debounce(
            async (
                query: string,
                tFunction: Function,
                setResults: Function
            ) => {
                if (query.length < 2) {
                    setResults({ users: [], recipes: [] });
                    return;
                }

                try {
                    const response = await axios.get(
                        `/api/search?q=${encodeURIComponent(query)}&type=users`
                    );
                    setResults(response.data);
                } catch (error) {
                    console.error('Search failed:', error);
                    toast.error(tFunction('search_failed') || 'Search failed');
                }
            },
            300
        )
    ).current;

    const handleSearch = useCallback(
        (query: string) => {
            debouncedSearch(query, t, setSearchResults);
        },
        [debouncedSearch, t]
    );

    useEffect(() => {
        handleSearch(searchQuery);
    }, [searchQuery, handleSearch]);

    return (
        <div className="flex flex-col gap-4">
            <div className="mb-2">
                <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t('workshop_whitelist_description')}
                </p>
            </div>

            {/* Search input with integrated dropdown */}
            <div className="relative">
                <SearchInput
                    id="search-users"
                    label={t('search_users') || 'Search Users'}
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    disabled={isLoading}
                    dataCy="whitelist-search-input"
                    icon={FiSearch}
                    results={searchResults}
                    onSelectResult={(result) => {
                        onAddUser(result);
                        setSearchQuery('');
                    }}
                    searchType="users"
                    maxSelected={0} // No limit for whitelisted users
                    isSelected={(id) =>
                        selectedUsers.some((user) => user.id === id)
                    }
                    emptyMessage={t('no_users_found') || 'No users found'}
                />
            </div>

            {/* Display of selected users */}
            {selectedUsers.length > 0 && (
                <div>
                    <h3 className="mb-2 text-sm font-medium text-gray-500 dark:text-zinc-400">
                        {t('workshop_whitelist') || 'Invited Users'}
                        <span className="ml-1 text-xs text-gray-400 dark:text-zinc-500">
                            ({selectedUsers.length})
                        </span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {selectedUsers.map((user) => (
                            <div
                                key={user.id}
                                className="flex items-center gap-2 rounded-full bg-gray-100 py-1 pr-2 pl-1 dark:bg-zinc-800"
                            >
                                <Avatar
                                    src={user.image}
                                    size={24}
                                />
                                <span className="text-sm text-zinc-900 dark:text-zinc-100">
                                    {user.name}
                                </span>
                                <button
                                    onClick={() => onRemoveUser(user.id)}
                                    className="ml-1 text-gray-500 hover:text-rose-500 dark:text-zinc-400 dark:hover:text-rose-500"
                                    type="button"
                                >
                                    <AiFillDelete size={16} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {selectedUsers.length === 0 && (
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-4 text-center dark:border-zinc-700">
                    <p className="text-sm text-gray-500 dark:text-zinc-400">
                        {t('no_whitelisted_users')}
                    </p>
                </div>
            )}
        </div>
    );
};

export default WhitelistUsersStep;
