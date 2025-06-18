import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import MentionInput from '@/app/components/inputs/MentionInput';
import axios from 'axios';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

// Mock components
vi.mock('@/app/components/utils/Avatar', () => ({
    default: ({ src, size }: { src: string; size: number }) => (
        <img
            src={src}
            alt="avatar"
            data-testid="avatar"
            style={{ width: size, height: size }}
        />
    ),
}));

vi.mock('@/app/components/VerificationBadge', () => ({
    default: ({ className }: { className?: string }) => (
        <span
            data-testid="verification-badge"
            className={className}
        >
            ✓
        </span>
    ),
}));

describe('MentionInput', () => {
    const mockOnChange = vi.fn();
    const mockUsers = [
        {
            id: 'user1',
            name: 'John Doe',
            image: '/john.jpg',
            verified: true,
            level: 5,
        },
        {
            id: 'user2',
            name: 'Jane Smith',
            image: '/jane.jpg',
            verified: false,
            level: 3,
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
        mockedAxios.get.mockResolvedValue({ data: { users: mockUsers } });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders correctly', () => {
        render(
            <MentionInput
                value=""
                onChange={mockOnChange}
                placeholder="Type a comment..."
                className="test-class"
            />
        );

        const textarea = screen.getByPlaceholderText('Type a comment...');
        expect(textarea).toBeDefined();
        expect(textarea).toHaveProperty(
            'className',
            expect.stringContaining('test-class')
        );
    });

    it('calls onChange when typing', () => {
        render(
            <MentionInput
                value=""
                onChange={mockOnChange}
                placeholder="Type a comment..."
            />
        );

        const textarea = screen.getByPlaceholderText('Type a comment...');
        fireEvent.change(textarea, { target: { value: 'Hello world' } });

        expect(mockOnChange).toHaveBeenCalledWith('Hello world');
    });

    it('shows dropdown when typing @ symbol', async () => {
        render(
            <MentionInput
                value=""
                onChange={mockOnChange}
                placeholder="Type a comment..."
            />
        );

        const textarea = screen.getByPlaceholderText('Type a comment...');
        fireEvent.change(textarea, { target: { value: 'Hello @j' } });

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/search?q=j&type=users'
            );
        });

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeDefined();
            expect(screen.getByText('Jane Smith')).toBeDefined();
        });
    });

    it('does not show dropdown for short queries', async () => {
        render(
            <MentionInput
                value=""
                onChange={mockOnChange}
                placeholder="Type a comment..."
            />
        );

        const textarea = screen.getByPlaceholderText('Type a comment...');
        fireEvent.change(textarea, { target: { value: 'Hello @' } });

        // Wait a bit to ensure no API call is made
        await new Promise((resolve) => setTimeout(resolve, 400));

        expect(mockedAxios.get).not.toHaveBeenCalled();
    });

    it('selects user when clicked', async () => {
        render(
            <MentionInput
                value=""
                onChange={mockOnChange}
                placeholder="Type a comment..."
            />
        );

        const textarea = screen.getByPlaceholderText('Type a comment...');
        fireEvent.change(textarea, { target: { value: 'Hello @john' } });

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeDefined();
        });

        fireEvent.click(screen.getByText('John Doe'));

        // Should be called twice: once for the initial typing, once for the selection
        expect(mockOnChange).toHaveBeenLastCalledWith('@John Doe[user1] ');
    });

    it('navigates dropdown with arrow keys', async () => {
        render(
            <MentionInput
                value=""
                onChange={mockOnChange}
                placeholder="Type a comment..."
            />
        );

        const textarea = screen.getByPlaceholderText('Type a comment...');
        fireEvent.change(textarea, { target: { value: 'Hello @j' } });

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeDefined();
        });

        // Arrow down to select first user
        fireEvent.keyDown(textarea, { key: 'ArrowDown' });

        // Enter to select
        fireEvent.keyDown(textarea, { key: 'Enter' });

        // Should be called twice: once for the initial typing, once for the selection
        expect(mockOnChange).toHaveBeenLastCalledWith('@John Doe[user1] ');
    });

    it('closes dropdown with Escape key', async () => {
        render(
            <MentionInput
                value=""
                onChange={mockOnChange}
                placeholder="Type a comment..."
            />
        );

        const textarea = screen.getByPlaceholderText('Type a comment...');
        fireEvent.change(textarea, { target: { value: 'Hello @j' } });

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeDefined();
        });

        fireEvent.keyDown(textarea, { key: 'Escape' });

        expect(screen.queryByText('John Doe')).toBeNull();
    });

    it('shows verification badge for verified users', async () => {
        render(
            <MentionInput
                value=""
                onChange={mockOnChange}
                placeholder="Type a comment..."
            />
        );

        const textarea = screen.getByPlaceholderText('Type a comment...');
        fireEvent.change(textarea, { target: { value: 'Hello @j' } });

        await waitFor(() => {
            expect(screen.getByText('John Doe')).toBeDefined();
            expect(screen.getByTestId('verification-badge')).toBeDefined();
        });
    });

    it('respects disabled state', () => {
        render(
            <MentionInput
                value=""
                onChange={mockOnChange}
                placeholder="Type a comment..."
                disabled={true}
            />
        );

        const textarea = screen.getByPlaceholderText('Type a comment...');
        expect(textarea).toHaveProperty('disabled', true);
    });

    it('respects maxLength', () => {
        render(
            <MentionInput
                value=""
                onChange={mockOnChange}
                placeholder="Type a comment..."
                maxLength={100}
            />
        );

        const textarea = screen.getByPlaceholderText('Type a comment...');
        expect(textarea).toHaveProperty('maxLength', 100);
    });
});
