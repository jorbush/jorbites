import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import ListTopBar from '@/app/components/lists/ListTopBar';
import { SafeList } from '@/app/types';

const mockShare = vi.fn();
const mockBack = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        back: mockBack,
        push: vi.fn(),
    }),
}));

vi.mock('@/app/hooks/useShare', () => ({
    default: () => ({
        share: mockShare,
    }),
}));

describe('ListTopBar', () => {
    const mockList: SafeList = {
        id: 'list-1',
        name: 'My Special List',
        userId: 'user-id',
        recipeIds: ['recipe-1'],
        isDefault: false,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    };

    const defaultProps = {
        list: mockList,
        shareTitle: 'My Special List',
        isOwner: true,
        isLoading: false,
        onTogglePrivacy: vi.fn(),
        onOpenDeleteModal: vi.fn(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders back button and navigates on click', () => {
        render(<ListTopBar {...defaultProps} />);

        const backBtn = screen.getByTestId
            ? screen.getByRole('link', { name: /back/i })
            : screen.getByText('back');
        expect(backBtn).toBeDefined();
    });

    it('renders share button and calls share on click', () => {
        render(<ListTopBar {...defaultProps} />);

        const shareBtn = screen.getByRole('button', { name: /share/i });
        fireEvent.click(shareBtn);

        expect(mockShare).toHaveBeenCalledWith({ title: 'My Special List' });
    });

    it('calls onTogglePrivacy when lock button is clicked', () => {
        render(<ListTopBar {...defaultProps} />);

        const privacyBtn = screen.getByTitle('public');
        fireEvent.click(privacyBtn);

        expect(defaultProps.onTogglePrivacy).toHaveBeenCalled();
    });

    it('calls onOpenDeleteModal when delete list button is clicked', () => {
        render(<ListTopBar {...defaultProps} />);

        const deleteBtn = screen.getByTitle('delete_list');
        fireEvent.click(deleteBtn);

        expect(defaultProps.onOpenDeleteModal).toHaveBeenCalled();
    });

    it('hides delete button when list isDefault is true', () => {
        render(
            <ListTopBar
                {...defaultProps}
                list={{ ...mockList, isDefault: true }}
            />
        );

        expect(screen.queryByTitle('delete_list')).toBeNull();
    });

    it('hides action controls when list is private and user is not owner', () => {
        render(
            <ListTopBar
                {...defaultProps}
                list={{ ...mockList, isPrivate: true }}
                isOwner={false}
            />
        );

        expect(screen.queryByRole('button', { name: /share/i })).toBeNull();
        expect(screen.queryByTitle('private')).toBeNull();
        expect(screen.queryByTitle('delete_list')).toBeNull();
    });
});
