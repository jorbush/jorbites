import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { SelectedCoCooksList } from '@/app/components/modals/recipe-steps/SelectedCoCooksList';

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

const mockT = (key: string) => key;

describe('SelectedCoCooksList', () => {
    afterEach(() => {
        cleanup();
    });

    const mockCoCooks = [
        { id: 'u1', name: 'Cook 1', image: 'u1.jpg' },
        { id: 'u2', name: 'Cook 2', image: null },
    ];

    it('returns null if co-cooks list is empty', () => {
        const { container } = render(
            <SelectedCoCooksList
                selectedCoCooks={[]}
                onRemoveCoCook={vi.fn()}
                t={mockT}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders cooks list and triggers remove callback', () => {
        const mockRemove = vi.fn();
        render(
            <SelectedCoCooksList
                selectedCoCooks={mockCoCooks}
                onRemoveCoCook={mockRemove}
                t={mockT}
            />
        );
        expect(screen.getByText('Cook 1')).toBeDefined();
        expect(screen.getByText('Cook 2')).toBeDefined();
        const buttons = screen.getAllByRole('button');
        expect(buttons).toHaveLength(2);
        buttons[0].click();
        expect(mockRemove).toHaveBeenCalledWith('u1');
    });
});
