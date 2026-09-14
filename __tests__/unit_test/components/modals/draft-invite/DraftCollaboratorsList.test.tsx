import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DraftCollaboratorsList from '@/app/components/modals/draft-invite/DraftCollaboratorsList';
import { SafeUser } from '@/app/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => options?.defaultValue || key,
    }),
}));

describe('DraftCollaboratorsList', () => {
    const mockOwner: SafeUser = {
        id: 'owner-1',
        name: 'Owner Chef',
        email: 'owner@example.com',
        favoriteIds: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
    };

    const mockCoCook: SafeUser = {
        id: 'user-cook-1',
        name: 'Guest Chef',
        email: 'guest@example.com',
        favoriteIds: [],
        createdAt: '2023-01-01',
        updatedAt: '2023-01-01',
    };

    const usersMap = new Map<string, SafeUser>([
        ['owner-1', mockOwner],
        ['user-cook-1', mockCoCook],
    ]);

    const defaultProps = {
        ownerId: 'owner-1',
        ownerName: 'Owner Chef',
        coCooksIds: ['user-cook-1'],
        coCookRoles: { 'user-cook-1': 'editor' as const },
        usersMap,
        currentUser: mockOwner,
        isOwner: true,
        mutatingUserId: null,
        onRoleChange: vi.fn(),
        onRemoveCollaborator: vi.fn(),
    };

    it('renders owner and collaborator items with role controls for owner', () => {
        render(<DraftCollaboratorsList {...defaultProps} />);

        expect(screen.getByTestId('collaborator-owner')).toBeInTheDocument();
        expect(screen.getByTestId('role-badge-owner')).toBeInTheDocument();
        expect(screen.getByText('Owner Chef')).toBeInTheDocument();

        expect(
            screen.getByTestId('collaborator-item-user-cook-1')
        ).toBeInTheDocument();
        expect(screen.getByText('Guest Chef')).toBeInTheDocument();

        const roleSelect = screen.getByTestId('role-select-user-cook-1');
        expect(roleSelect).toHaveValue('editor');

        fireEvent.change(roleSelect, { target: { value: 'viewer' } });
        expect(defaultProps.onRoleChange).toHaveBeenCalledWith(
            'user-cook-1',
            'viewer'
        );

        const removeBtn = screen.getByTestId('remove-collaborator-user-cook-1');
        fireEvent.click(removeBtn);
        expect(defaultProps.onRemoveCollaborator).toHaveBeenCalledWith(
            'user-cook-1'
        );
    });

    it('renders role badge and leave button for non-owner collaborator', () => {
        render(
            <DraftCollaboratorsList
                {...defaultProps}
                currentUser={mockCoCook}
                isOwner={false}
            />
        );

        expect(screen.getByTestId('role-badge-user-cook-1')).toHaveTextContent(
            'Editor'
        );
        expect(
            screen.queryByTestId('role-select-user-cook-1')
        ).not.toBeInTheDocument();

        const leaveBtn = screen.getByTestId('leave-draft-btn');
        expect(leaveBtn).toBeInTheDocument();
        fireEvent.click(leaveBtn);
        expect(defaultProps.onRemoveCollaborator).toHaveBeenCalledWith(
            'user-cook-1'
        );
    });

    it('renders empty co-cooks message when list is empty', () => {
        render(
            <DraftCollaboratorsList
                {...defaultProps}
                coCooksIds={[]}
            />
        );

        expect(
            screen.getByText(
                'No co-cooks have joined yet. Share the invite link above!'
            )
        ).toBeInTheDocument();
    });
});
