import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import RecipeBookButton from '@/app/components/profile/RecipeBookButton';

// Mock axios and react-hot-toast
vi.mock('axios');
vi.mock('react-hot-toast', () => ({
    toast: {
        loading: vi.fn().mockReturnValue('toast-loading-id'),
        success: vi.fn(),
        error: vi.fn(),
    },
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'recipe_book_cover_subtitle') {
                return `Collection of ${options?.count || 0} recipes`;
            }
            return key;
        },
    }),
}));

// Mock @react-pdf/renderer and RecipeBookPDF
const mockToBlob = vi
    .fn()
    .mockResolvedValue(new Blob(['pdf-data'], { type: 'application/pdf' }));
const mockPdf = vi.fn().mockReturnValue({ toBlob: mockToBlob });

vi.mock('@react-pdf/renderer', () => ({
    pdf: (doc: any) => mockPdf(doc),
    Font: {
        register: vi.fn(),
        registerEmojiSource: vi.fn(),
    },
    Document: vi.fn(),
    Page: vi.fn(),
    Text: vi.fn(),
    View: vi.fn(),
    StyleSheet: {
        create: vi.fn((x) => x),
    },
    Image: vi.fn(),
}));

vi.mock('@/app/components/profile/RecipeBookPDF', () => ({
    RecipeBookPDF: vi.fn(() => <div data-testid="recipe-book-pdf" />),
}));

// Mock relative path too, just to be sure Vitest resolves it
vi.mock('./RecipeBookPDF', () => ({
    RecipeBookPDF: vi.fn(() => <div data-testid="recipe-book-pdf" />),
}));

describe('RecipeBookButton', () => {
    const defaultProps = {
        userId: 'user-123',
        userName: 'John Doe',
        userImage: 'https://example.com/avatar.png',
    };

    let clickSpy: any;

    beforeEach(() => {
        vi.clearAllMocks();

        // Mock URL and document API
        global.URL.createObjectURL = vi
            .fn()
            .mockReturnValue('blob:http://localhost/test-uuid');
        global.URL.revokeObjectURL = vi.fn();

        // Spy on document.body.appendChild and removeChild
        vi.spyOn(document.body, 'appendChild');
        vi.spyOn(document.body, 'removeChild');

        // Spy on HTMLAnchorElement click
        clickSpy = vi
            .spyOn(HTMLAnchorElement.prototype, 'click')
            .mockImplementation(() => {});
    });

    afterEach(() => {
        cleanup();
    });

    it('renders with book icon initially', () => {
        render(<RecipeBookButton {...defaultProps} />);

        expect(screen.getByTestId('book-icon')).toBeDefined();
        expect(screen.queryByTestId('loader-icon')).toBeNull();
    });

    it('shows error toast when user has no recipes', async () => {
        vi.mocked(axios.get).mockResolvedValueOnce({ data: [] });

        render(<RecipeBookButton {...defaultProps} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        expect(toast.loading).toHaveBeenCalledWith('recipe_book_generating');

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                '/api/user/user-123/recipes'
            );
            expect(toast.error).toHaveBeenCalledWith('recipe_book_no_recipes', {
                id: 'toast-loading-id',
            });
            expect(screen.getByTestId('book-icon')).toBeDefined();
        });
    });

    it('generates and downloads PDF recipe book when user has recipes', async () => {
        const mockRecipes = [
            {
                id: 'recipe-1',
                title: 'Scrambled Eggs',
                description: 'Classic scrambled eggs',
                imageSrc: 'https://example.com/eggs.jpg',
                minutes: 10,
                method: 'Frying pan',
                categories: ['Breakfast'],
                ingredients: ['2 eggs', '1 tbsp butter'],
                steps: ['Melt butter', 'Whisk eggs and cook'],
                createdAt: '2026-05-21T00:00:00.000Z',
            },
        ];

        vi.mocked(axios.get).mockResolvedValueOnce({ data: mockRecipes });

        render(<RecipeBookButton {...defaultProps} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        // Should show loader while generating
        await waitFor(() => {
            expect(screen.getByTestId('loader-icon')).toBeDefined();
        });

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                '/api/user/user-123/recipes'
            );
            expect(mockPdf).toHaveBeenCalled();
            expect(mockToBlob).toHaveBeenCalled();

            // Check that the link was appended, clicked, and cleaned up
            expect(document.body.appendChild).toHaveBeenCalled();
            const appendedCalls = vi.mocked(document.body.appendChild).mock
                .calls;
            const appendedAnchor = appendedCalls
                .map((call) => call[0] as HTMLElement)
                .find((el) => el.tagName === 'A') as HTMLAnchorElement;

            expect(appendedAnchor).toBeDefined();
            expect(appendedAnchor.download).toBe('John_Doe_Recipe_Book.pdf');
            expect(appendedAnchor.href).toBe('blob:http://localhost/test-uuid');

            expect(clickSpy).toHaveBeenCalled();
            expect(document.body.removeChild).toHaveBeenCalledWith(
                appendedAnchor
            );
            expect(toast.success).toHaveBeenCalledWith(
                'recipe_book_generated_success',
                {
                    id: 'toast-loading-id',
                }
            );
            expect(screen.getByTestId('book-icon')).toBeDefined();
        });
    });

    it('shows error toast when api call fails', async () => {
        vi.mocked(axios.get).mockRejectedValueOnce(new Error('Network error'));

        render(<RecipeBookButton {...defaultProps} />);

        const button = screen.getByRole('button');
        fireEvent.click(button);

        await waitFor(() => {
            expect(axios.get).toHaveBeenCalledWith(
                '/api/user/user-123/recipes'
            );
            expect(toast.error).toHaveBeenCalledWith('something_went_wrong', {
                id: 'toast-loading-id',
            });
            expect(screen.getByTestId('book-icon')).toBeDefined();
        });
    });
});
