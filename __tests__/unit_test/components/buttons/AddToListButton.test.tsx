import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import AddToListButton from '@/app/components/buttons/AddToListButton';
import useAddToListModal from '@/app/hooks/useAddToListModal';
import useLoginModal from '@/app/hooks/useLoginModal';

vi.mock('@/app/hooks/useAddToListModal');
vi.mock('@/app/hooks/useLoginModal');
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('AddToListButton', () => {
    const mockAddToListOnOpen = vi.fn();
    const mockLoginOnOpen = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useAddToListModal).mockReturnValue({
            onOpen: mockAddToListOnOpen,
        } as any);
        vi.mocked(useLoginModal).mockReturnValue({
            onOpen: mockLoginOnOpen,
        } as any);
    });

    afterEach(() => {
        cleanup();
    });

    it('should open login modal if user is not authenticated', () => {
        render(
            <AddToListButton
                recipeId="test-recipe-id"
                currentUser={null}
            />
        );

        const button = screen.getByTitle('add_to_list');
        fireEvent.click(button);

        expect(mockLoginOnOpen).toHaveBeenCalled();
        expect(mockAddToListOnOpen).not.toHaveBeenCalled();
    });

    it('should open add to list modal if user is authenticated', () => {
        const mockUser: any = { id: 'user-id' };
        render(
            <AddToListButton
                recipeId="test-recipe-id"
                currentUser={mockUser}
            />
        );

        const button = screen.getByTitle('add_to_list');
        fireEvent.click(button);

        expect(mockLoginOnOpen).not.toHaveBeenCalled();
        expect(mockAddToListOnOpen).toHaveBeenCalledWith('test-recipe-id');
    });
});
