'use client';

import React from 'react';
import Avatar from '@/app/components/utils/Avatar';
import VerificationBadge from '@/app/components/VerificationBadge';

interface User {
    id: string;
    name: string | null;
    image: string | null;
    verified: boolean;
    level: number;
}

interface MentionDropdownProps {
    dropdownRef: React.RefObject<HTMLDivElement | null>;
    users: User[];
    selectedIndex: number;
    onSelectUser: (user: User) => void;
    isMobile: boolean;
    dropdownStyle: React.CSSProperties;
}

export const MentionDropdown: React.FC<MentionDropdownProps> = ({
    dropdownRef,
    users,
    selectedIndex,
    onSelectUser,
    isMobile,
    dropdownStyle,
}) => {
    if (users.length === 0) return null;

    return (
        <div
            ref={dropdownRef}
            className={`rounded-md border border-neutral-200 bg-white shadow-lg dark:border-neutral-600 dark:bg-neutral-800 ${
                isMobile ? 'w-full max-w-none' : 'w-auto max-w-sm'
            }`}
            style={dropdownStyle}
        >
            <div className="max-h-48 overflow-y-auto">
                {users.map((user, index) => (
                    <button
                        key={user.id}
                        type="button"
                        className={`flex w-full cursor-pointer items-center gap-2 pr-5 text-left hover:bg-neutral-50 dark:hover:bg-neutral-700 ${
                            isMobile ? 'p-4' : 'p-3'
                        } ${
                            index === selectedIndex
                                ? 'bg-neutral-50 dark:bg-neutral-700'
                                : ''
                        }`}
                        onClick={() => onSelectUser(user)}
                        style={{
                            minHeight: isMobile ? '48px' : 'auto',
                        }}
                    >
                        <Avatar
                            src={user.image}
                            size={32}
                        />
                        <div className="flex items-center gap-1">
                            <span className="font-medium text-neutral-900 dark:text-neutral-100">
                                {user.name}
                            </span>
                            {user.verified && (
                                <VerificationBadge className="ml-1" />
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MentionDropdown;
