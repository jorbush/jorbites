'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { FiSearch } from 'react-icons/fi';
import axios from 'axios';
import debounce from 'lodash/debounce';
import SearchInput from '@/app/components/inputs/SearchInput';
import { SafeUser } from '@/app/types';
import { MAX_CO_COOKS } from '@/app/utils/constants';

export interface DraftDirectSearchSectionProps {
    coCooksCount: number;
    ownerId?: string;
    coCooksIds?: string[];
    isAddingUser: boolean;
    onAddCollaborator: (user: SafeUser) => Promise<void>;
}

const DraftDirectSearchSection: React.FC<DraftDirectSearchSectionProps> = ({
    coCooksCount,
    ownerId,
    coCooksIds,
    isAddingUser,
    onAddCollaborator,
}) => {
    const { t } = useTranslation();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{
        users: SafeUser[];
    }>({ users: [] });

    const isLimitReached = coCooksCount >= MAX_CO_COOKS;

    const debouncedSearch = useMemo(
        () =>
            debounce(async (query: string) => {
                if (query.trim().length < 2) {
                    setSearchResults({ users: [] });
                    return;
                }
                try {
                    const res = await axios.get(
                        `/api/search?q=${encodeURIComponent(query)}&type=users`
                    );
                    setSearchResults({ users: res.data.users || [] });
                } catch (err) {
                    console.error('User search failed:', err);
                }
            }, 300),
        []
    );

    useEffect(() => {
        debouncedSearch(searchQuery);
        return () => {
            debouncedSearch.cancel();
        };
    }, [searchQuery, debouncedSearch]);

    const handleSelectUser = async (result: any) => {
        await onAddCollaborator(result as SafeUser);
        setSearchQuery('');
    };

    return (
        <div className="flex flex-col gap-2">
            <span className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-neutral-600 uppercase dark:text-neutral-400">
                <FiSearch size={14} />
                <span>
                    {t('add_co_cook_directly', {
                        defaultValue: 'Add Co-Cook Directly',
                    })}
                </span>
            </span>
            <SearchInput
                id="invite-search-users"
                label={
                    t('search_users', {
                        defaultValue: 'Search Users',
                    }) as string
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                disabled={isAddingUser || isLimitReached}
                dataCy="search-input"
                icon={FiSearch}
                results={searchResults}
                onSelectResult={handleSelectUser}
                searchType="users"
                maxSelected={MAX_CO_COOKS}
                isSelected={(id) =>
                    id === ownerId || Boolean(coCooksIds?.includes(id))
                }
                emptyMessage={
                    t('no_users_found', {
                        defaultValue: 'No users found',
                    }) as string
                }
            />
            {isLimitReached && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                    {t('max_cooks_reached', {
                        defaultValue: `Maximum of ${MAX_CO_COOKS} co-cooks allowed`,
                    })}
                </p>
            )}
        </div>
    );
};

export default DraftDirectSearchSection;
