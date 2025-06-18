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

    // Detect if we're on a mobile device
    const isMobile = () => {
        return (
            /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
                navigator.userAgent
            ) ||
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0
        );
    };

    // Get cursor position with mobile-optimized approach
    const getCursorCoordinates = () => {
        if (!textareaRef.current || mentionStartIndex === -1)
            return { x: 0, y: 0 };

        const textarea = textareaRef.current;
        const rect = textarea.getBoundingClientRect();

        // Use simpler approach for mobile devices
        if (isMobile()) {
            // For mobile, position dropdown at the start of the textarea
            // and slightly below to avoid keyboard interference
            return {
                x: rect.left,
                y: rect.bottom + 10, // Position below textarea
            };
        }

        // Desktop approach with mirror div for precise positioning
        const mirrorDiv = document.createElement('div');
        const computedStyle = window.getComputedStyle(textarea);

        // Copy all text-related styles
        mirrorDiv.style.position = 'absolute';
        mirrorDiv.style.visibility = 'hidden';
        mirrorDiv.style.left = '-9999px';
        mirrorDiv.style.top = '-9999px';
        mirrorDiv.style.width = textarea.clientWidth + 'px';
        mirrorDiv.style.height = textarea.clientHeight + 'px';
        mirrorDiv.style.font = computedStyle.font;
        mirrorDiv.style.fontSize = computedStyle.fontSize;
        mirrorDiv.style.fontFamily = computedStyle.fontFamily;
        mirrorDiv.style.fontWeight = computedStyle.fontWeight;
        mirrorDiv.style.lineHeight = computedStyle.lineHeight;
        mirrorDiv.style.letterSpacing = computedStyle.letterSpacing;
        mirrorDiv.style.padding = computedStyle.padding;
        mirrorDiv.style.border = computedStyle.border;
        mirrorDiv.style.margin = computedStyle.margin;
        mirrorDiv.style.whiteSpace = 'pre-wrap';
        mirrorDiv.style.wordWrap = 'break-word';
        mirrorDiv.style.overflow = 'hidden';
        mirrorDiv.style.boxSizing = computedStyle.boxSizing;

        document.body.appendChild(mirrorDiv);

        // Add text before the @ symbol
        const textBeforeMention = value.substring(0, mentionStartIndex);
        mirrorDiv.textContent = textBeforeMention;

        // Create a span to mark the cursor position (where @ is)
        const cursorMarker = document.createElement('span');
        cursorMarker.textContent = '@';
        cursorMarker.style.position = 'relative';
        mirrorDiv.appendChild(cursorMarker);

        // Get the position of the cursor marker
        const markerRect = cursorMarker.getBoundingClientRect();
        const mirrorRect = mirrorDiv.getBoundingClientRect();

        // Calculate relative position within the textarea
        const relativeX = markerRect.left - mirrorRect.left;
        const relativeY = markerRect.top - mirrorRect.top;

        document.body.removeChild(mirrorDiv);

        // Convert to screen coordinates
        return {
            x: rect.left + relativeX,
            y: rect.top + relativeY + 20, // Add 20px below the cursor
        };
    };

    // Position dropdown with mobile-optimized logic
    const getDropdownPosition = () => {
        if (!textareaRef.current || mentionStartIndex === -1) return {};

        const cursorPos = getCursorCoordinates();
        const mobile = isMobile();

        // Different sizing for mobile vs desktop
        const dropdownWidth = mobile
            ? Math.min(320, window.innerWidth - 20)
            : 320;
        const dropdownHeight = 200;
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let left = cursorPos.x;
        let top = cursorPos.y;

        // Mobile-specific adjustments
        if (mobile) {
            // On mobile, center the dropdown horizontally and position below textarea
            left = Math.max(10, (viewportWidth - dropdownWidth) / 2);

            // Ensure dropdown doesn't get hidden by mobile keyboard
            const maxTop = viewportHeight * 0.6; // Use only top 60% of screen
            if (top > maxTop) {
                top = maxTop;
            }
        } else {
            // Desktop positioning logic
            if (left + dropdownWidth > viewportWidth) {
                left = viewportWidth - dropdownWidth - 10;
            }

            if (top + dropdownHeight > viewportHeight) {
                // Show above cursor instead
                top = cursorPos.y - dropdownHeight - 25;
            }
        }

        // Ensure minimum distance from screen edges
        left = Math.max(10, left);
        top = Math.max(10, top);

        return {
            position: 'fixed' as const,
            top: top,
            left: left,
            zIndex: 9999,
            width: mobile ? dropdownWidth : undefined,
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
                    className={`rounded-md border border-gray-200 bg-white shadow-lg dark:border-neutral-600 dark:bg-zinc-800 ${
                        isMobile() ? 'w-full max-w-none' : 'w-auto max-w-sm'
                    }`}
                    style={getDropdownPosition()}
                >
                    <div className="max-h-48 overflow-y-auto">
                        {users.map((user, index) => (
                            <div
                                key={user.id}
                                className={`flex cursor-pointer items-center gap-2 pr-5 hover:bg-gray-50 dark:hover:bg-zinc-700 ${
                                    isMobile() ? 'p-4' : 'p-3'
                                } ${
                                    index === selectedIndex
                                        ? 'bg-gray-50 dark:bg-zinc-700'
                                        : ''
                                }`}
                                onClick={() => selectUser(user)}
                                style={{
                                    minHeight: isMobile() ? '48px' : 'auto', // Minimum touch target size on mobile
                                }}
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
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default MentionInput;
