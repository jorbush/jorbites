import {
    render,
    screen,
    fireEvent,
    cleanup,
    act,
} from '@testing-library/react';
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

const mockMyLists: SafeList[] = [
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

const mockCommunityLists: SafeList[] = [
    {
        id: 'list-3',
        name: 'Awesome Desserts',
        userId: 'other-user-id',
        recipeIds: ['recipe-2', 'recipe-3'],
        isDefault: false,
        isPrivate: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        user: {
            id: 'other-user-id',
            name: 'Other Chef',
            image: null,
            level: 2,
            verified: true,
            badges: [],
        },
    },
];

describe('ListsClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders tabs correctly when authenticated', () => {
        render(
            <ListsClient
                initialMyLists={mockMyLists}
                initialCommunityLists={mockCommunityLists}
                currentUser={mockUser}
            />
        );
        expect(screen.getByText('my_lists')).toBeDefined();
        expect(screen.getByText('community_lists')).toBeDefined();
    });

    it('renders only community lists tab when unauthenticated', () => {
        render(
            <ListsClient
                initialMyLists={[]}
                initialCommunityLists={mockCommunityLists}
                currentUser={null}
            />
        );
        expect(screen.queryByText('my_lists')).toBeNull();
        expect(screen.getByText('community_lists')).toBeDefined();
        expect(screen.getByText('Awesome Desserts')).toBeDefined();
    });

    it('renders user lists under my lists tab by default when logged in', () => {
        render(
            <ListsClient
                initialMyLists={mockMyLists}
                initialCommunityLists={mockCommunityLists}
                currentUser={mockUser}
            />
        );
        expect(screen.getByText('to_cook_later')).toBeDefined();
        expect(screen.getByText('My Special List')).toBeDefined();
        expect(screen.queryByText('Awesome Desserts')).toBeNull();
    });

    it('switches to community lists when tab is clicked', () => {
        render(
            <ListsClient
                initialMyLists={mockMyLists}
                initialCommunityLists={mockCommunityLists}
                currentUser={mockUser}
            />
        );

        const communityTab = screen.getByText('community_lists');
        fireEvent.click(communityTab);

        expect(screen.queryByText('to_cook_later')).toBeNull();
        expect(screen.queryByText('My Special List')).toBeNull();
        expect(screen.getByText('Awesome Desserts')).toBeDefined();
    });

    it('shows delete button only for non-default owned lists on My Lists tab', () => {
        render(
            <ListsClient
                initialMyLists={mockMyLists}
                initialCommunityLists={mockCommunityLists}
                currentUser={mockUser}
            />
        );

        const deleteButtons = screen.queryAllByTitle('delete_list');
        expect(deleteButtons.length).toBe(1); // Only for My Special List
    });

    it('never shows delete button on Community Lists tab', () => {
        render(
            <ListsClient
                initialMyLists={mockMyLists}
                initialCommunityLists={mockCommunityLists}
                currentUser={mockUser}
            />
        );

        const communityTab = screen.getByText('community_lists');
        fireEvent.click(communityTab);

        const deleteButtons = screen.queryAllByTitle('delete_list');
        expect(deleteButtons.length).toBe(0);
    });

    it('opens confirm modal and calls delete API when deleting owned list', async () => {
        vi.mocked(axios.delete).mockResolvedValue({ data: {} });

        render(
            <ListsClient
                initialMyLists={mockMyLists}
                initialCommunityLists={mockCommunityLists}
                currentUser={mockUser}
            />
        );

        const deleteButton = screen.getByTitle('delete_list');
        fireEvent.click(deleteButton);

        expect(screen.getByText('delete_list_confirmation')).toBeDefined();

        const confirmButton = screen.getByTestId('modal-action-button');
        await act(async () => {
            fireEvent.click(confirmButton);
        });

        expect(axios.delete).toHaveBeenCalledWith('/api/lists/list-2');
    });
});
