import { render, screen, fireEvent, cleanup, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ListsClient from '@/app/lists/ListsClient';
import { SafeList, SafeUser } from '@/app/types';
import axios from 'axios';

vi.mock('axios');
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
        push: vi.fn(),
    }),
}));

const mockUser: SafeUser = {
    id: 'user-id',
    name: 'Test User',
    image: null,
    level: 1,
    verified: false,
    badges: [],
};

const mockLists: SafeList[] = [
    {
        id: 'list-1',
        name: 'To cook later',
        userId: 'user-id',
        recipeIds: ['recipe-1'],
        isDefault: true,
        isPrivate: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: mockUser,
    },
    {
        id: 'list-2',
        name: 'My Special List',
        userId: 'user-id',
        recipeIds: [],
        isDefault: false,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: mockUser,
    },
];

describe('ListsClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders all lists', () => {
        render(<ListsClient initialLists={mockLists} />);
        expect(screen.getByText('to_cook_later')).toBeDefined();
        expect(screen.getByText('My Special List')).toBeDefined();
    });

    it('shows delete button only for non-default lists', () => {
        render(<ListsClient initialLists={mockLists} />);

        // Use container to find the list items and check for delete buttons
        const listItems = screen.getAllByRole('button');
        // Filter those that have the delete icon/title
        const deleteButtons = screen.queryAllByTitle('delete_list');

        expect(deleteButtons.length).toBe(1);
    });

    it('opens confirm modal when delete is clicked', async () => {
        render(<ListsClient initialLists={mockLists} />);

        const deleteButton = screen.getByTitle('delete_list');
        fireEvent.click(deleteButton);

        expect(screen.getByText('delete_list_confirmation')).toBeDefined();
    });

    it('calls axios.delete when confirmed', async () => {
        vi.mocked(axios.delete).mockResolvedValue({ data: {} });
        render(<ListsClient initialLists={mockLists} />);

        const deleteButton = screen.getByTitle('delete_list');
        fireEvent.click(deleteButton);

        const confirmButton = screen.getByTestId('modal-action-button');
        await act(async () => {
            fireEvent.click(confirmButton);
        });

        expect(axios.delete).toHaveBeenCalledWith('/api/lists/list-2');
    });
});
