'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import axios from 'axios';
import debounce from 'lodash/debounce';
import Avatar from '@/app/components/utils/Avatar';
import VerificationBadge from '@/app/components/VerificationBadge';

interface User {
    id: string;
    name: string | null;
    image: string | null;
    verified: boolean;
    level: number;
}

interface MentionInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    maxLength?: number;
    dataCy?: string;
}

const MentionInput: React.FC<MentionInputProps> = ({
    value,
    onChange,
    placeholder,
    className,
    disabled,
    maxLength,
    dataCy,
}) => {
    const [users, setUsers] = useState<User[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const [mentionStartIndex, setMentionStartIndex] = useState(-1);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const debouncedSearch = useRef(
        debounce(async (query: string) => {
            if (query.length < 1) {
                setUsers([]);
                return;
            }

            try {
                const response = await axios.get(
                    `/api/search?q=${encodeURIComponent(query)}&type=users`
                );
                setUsers(response.data.users || []);
            } catch (error) {
                console.error('Search failed:', error);
                setUsers([]);
            }
        }, 300)
    ).current;

    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newValue = e.target.value;
        const cursorPosition = e.target.selectionStart;

        onChange(newValue);

        // Check if we're typing a mention
        const beforeCursor = newValue.substring(0, cursorPosition);
        const lastAtIndex = beforeCursor.lastIndexOf('@');

        if (lastAtIndex !== -1) {
            const afterAt = beforeCursor.substring(lastAtIndex + 1);
            // Check if there's no space after @ (which would end the mention)
            if (!afterAt.includes(' ') && !afterAt.includes('\n')) {
                setMentionStartIndex(lastAtIndex);
                setShowDropdown(true);
                setSelectedIndex(-1);
                debouncedSearch(afterAt);
            } else {
                setShowDropdown(false);
                setMentionStartIndex(-1);
            }
        } else {
            setShowDropdown(false);
            setMentionStartIndex(-1);
        }
    };

    const selectUser = useCallback(
        (user: User) => {
            if (mentionStartIndex === -1 || !textareaRef.current) return;

            const textarea = textareaRef.current;
            const currentValue = textarea.value;

            // Find the end of the current mention query (where cursor is)
            const beforeMention = currentValue.substring(0, mentionStartIndex);

            // Find the end of the mention by looking for the next space or end of string after @
            let afterMentionIndex = mentionStartIndex + 1; // Start after @
            while (
                afterMentionIndex < currentValue.length &&
                currentValue[afterMentionIndex] !== ' ' &&
                currentValue[afterMentionIndex] !== '\n'
            ) {
                afterMentionIndex++;
            }

            const afterMention = currentValue.substring(afterMentionIndex);

            // Replace @query with @username[userId] format for later parsing
            const newValue = `${beforeMention}@${user.name}[${user.id}] ${afterMention}`;
            onChange(newValue);

            // Set cursor position after the mention
            const newCursorPosition =
                mentionStartIndex + user.name!.length + user.id.length + 4; // +4 for @, [, ], and space
            setTimeout(() => {
                textarea.setSelectionRange(
                    newCursorPosition,
                    newCursorPosition
                );
                textarea.focus();
            }, 0);

            setShowDropdown(false);
            setMentionStartIndex(-1);
            setSelectedIndex(-1);
        },
        [mentionStartIndex, onChange]
    );

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (!showDropdown || users.length === 0) return;

        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev < users.length - 1 ? prev + 1 : 0
                );
                break;
            case 'ArrowUp':
                e.preventDefault();
                setSelectedIndex((prev) =>
                    prev > 0 ? prev - 1 : users.length - 1
                );
                break;
            case 'Enter':
                if (selectedIndex >= 0 && selectedIndex < users.length) {
                    e.preventDefault();
                    selectUser(users[selectedIndex]);
                }
                break;
            case 'Escape':
                setShowDropdown(false);
                setSelectedIndex(-1);
                break;
        }
    };

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target as Node) &&
                textareaRef.current &&
                !textareaRef.current.contains(event.target as Node)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Position dropdown near the cursor
    const getDropdownPosition = () => {
        if (!textareaRef.current || mentionStartIndex === -1) return {};

        const textarea = textareaRef.current;
        const rect = textarea.getBoundingClientRect();

        // Create a temporary element to measure text width up to the @ symbol
        const tempDiv = document.createElement('div');
        tempDiv.style.position = 'absolute';
        tempDiv.style.visibility = 'hidden';
        tempDiv.style.fontSize = window.getComputedStyle(textarea).fontSize;
        tempDiv.style.fontFamily = window.getComputedStyle(textarea).fontFamily;
        tempDiv.style.padding = window.getComputedStyle(textarea).padding;
        tempDiv.style.border = window.getComputedStyle(textarea).border;
        tempDiv.style.whiteSpace = 'pre-wrap';
        tempDiv.style.wordWrap = 'break-word';
        tempDiv.style.width = textarea.offsetWidth + 'px';

        // Get text up to the mention start
        const textBeforeMention = value.substring(0, mentionStartIndex);
        tempDiv.textContent = textBeforeMention;

        document.body.appendChild(tempDiv);

        // Calculate position
        const lines = textBeforeMention.split('\n');
        const currentLine = lines.length - 1;
        const currentLineText = lines[currentLine] || '';

        // Rough estimation of line height and character position
        const lineHeight =
            parseInt(window.getComputedStyle(textarea).lineHeight) || 20;

        document.body.removeChild(tempDiv);

        // Position dropdown
        const top = rect.top + currentLine * lineHeight + lineHeight + 5;
        const left = rect.left + currentLineText.length * 8; // Approximate char width

        // Ensure dropdown stays within viewport
        const maxLeft = window.innerWidth - 300; // 300px is approximate dropdown width
        const finalLeft = Math.min(left, maxLeft);

        return {
            position: 'fixed' as const,
            top: Math.min(top, window.innerHeight - 200), // Ensure it doesn't go below viewport
            left: finalLeft,
            zIndex: 9999,
        };
    };

    return (
        <div className="relative">
            <textarea
                ref={textareaRef}
                className={className}
                placeholder={placeholder}
                value={value}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                maxLength={maxLength}
                data-cy={dataCy}
            />

            {showDropdown && users.length > 0 && (
                <div
                    ref={dropdownRef}
                    className="w-80 max-w-sm rounded-md border border-gray-200 bg-white shadow-lg dark:border-neutral-600 dark:bg-zinc-800"
                    style={getDropdownPosition()}
                >
                    <div className="max-h-48 overflow-y-auto">
                        {users.map((user, index) => (
                            <div
                                key={user.id}
                                className={`flex cursor-pointer items-center gap-2 p-3 hover:bg-gray-50 dark:hover:bg-zinc-700 ${
                                    index === selectedIndex
                                        ? 'bg-gray-50 dark:bg-zinc-700'
                                        : ''
                                }`}
                                onClick={() => selectUser(user)}
                            >
                                <Avatar
                                    src={user.image}
                                    size={32}
                                />
                                <div className="flex items-center gap-1">
                                    <span className="font-medium text-zinc-900 dark:text-zinc-100">
                                        {user.name}
                                    </span>
                                    {user.verified && (
                                        <VerificationBadge className="ml-1" />
                                    )}
                                </div>
                                <span className="text-xs text-gray-500 dark:text-zinc-400">
                                    Level {user.level}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentionInput;
