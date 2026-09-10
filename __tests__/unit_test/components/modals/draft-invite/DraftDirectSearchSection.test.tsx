import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DraftDirectSearchSection from '@/app/components/modals/draft-invite/DraftDirectSearchSection';
import axios from 'axios';

vi.mock('axios');
const mockedAxios = axios as any;

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => options?.defaultValue || key,
    }),
}));

describe('DraftDirectSearchSection', () => {
    const mockOnAdd = vi.fn().mockResolvedValue(undefined);
    const defaultProps = {
        coCooksCount: 1,
        ownerId: 'owner-1',
        coCooksIds: ['user-1'],
        isAddingUser: false,
        onAddCollaborator: mockOnAdd,
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders label and search input', () => {
        render(<DraftDirectSearchSection {...defaultProps} />);

        expect(screen.getByText('Add Co-Cook Directly')).toBeInTheDocument();
        const input = screen.getByLabelText('Search Users');
        expect(input).toBeInTheDocument();
        expect(input).not.toBeDisabled();
    });

    it('displays max co-cooks warning and disables input when limit is reached', () => {
        render(
            <DraftDirectSearchSection
                {...defaultProps}
                coCooksCount={4}
            />
        );

        expect(
            screen.getByText('Maximum of 4 co-cooks allowed')
        ).toBeInTheDocument();
        const input = screen.getByLabelText('Search Users');
        expect(input).toBeDisabled();
    });

    it('disables input when isAddingUser is true', () => {
        render(
            <DraftDirectSearchSection
                {...defaultProps}
                isAddingUser={true}
            />
        );

        const input = screen.getByLabelText('Search Users');
        expect(input).toBeDisabled();
    });

    it('performs search when user types in search input', async () => {
        mockedAxios.get.mockResolvedValueOnce({
            data: {
                users: [
                    {
                        id: 'user-2',
                        name: 'Chef Maria',
                        email: 'maria@test.com',
                    },
                ],
            },
        });

        render(<DraftDirectSearchSection {...defaultProps} />);

        const input = screen.getByLabelText('Search Users');
        fireEvent.change(input, { target: { value: 'Maria' } });

        await waitFor(() => {
            expect(mockedAxios.get).toHaveBeenCalledWith(
                '/api/search?q=Maria&type=users'
            );
        });
    });
});
