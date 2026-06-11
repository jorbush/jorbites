import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import MentionDropdown from '@/app/components/inputs/MentionDropdown';

vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src, size }: any) => (
        <div
            data-testid="avatar"
            data-src={src}
            data-size={size}
        >
            avatar
        </div>
    ),
}));

vi.mock('@/app/components/VerificationBadge', () => ({
    default: () => <div data-testid="verification-badge">verified</div>,
}));

describe('MentionDropdown', () => {
    afterEach(() => {
        cleanup();
    });

    const mockUsers = [
        {
            id: '1',
            name: 'John Doe',
            image: 'john.png',
            verified: true,
            level: 1,
        },
        { id: '2', name: 'Jane Smith', image: null, verified: false, level: 2 },
    ];

    it('returns null if users list is empty', () => {
        const dropdownRef = React.createRef<HTMLDivElement>();
        const { container } = render(
            <MentionDropdown
                dropdownRef={dropdownRef}
                users={[]}
                selectedIndex={-1}
                onSelectUser={vi.fn()}
                isMobile={false}
                dropdownStyle={{}}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders list of users and handles selection', () => {
        const dropdownRef = React.createRef<HTMLDivElement>();
        const mockSelectUser = vi.fn();
        render(
            <MentionDropdown
                dropdownRef={dropdownRef}
                users={mockUsers}
                selectedIndex={0}
                onSelectUser={mockSelectUser}
                isMobile={false}
                dropdownStyle={{}}
            />
        );

        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('Jane Smith')).toBeDefined();
        expect(screen.getAllByTestId('verification-badge')).toHaveLength(1);

        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(2);
        buttons[0].click();
        expect(mockSelectUser).toHaveBeenCalledWith(mockUsers[0]);
    });
});
