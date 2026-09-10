import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import DraftCardAvatars from '@/app/components/drafts/DraftCardAvatars';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => options?.defaultValue || key,
    }),
}));

describe('DraftCardAvatars', () => {
    it('returns null if coCooksIds is undefined or empty', () => {
        const { container } = render(<DraftCardAvatars />);
        expect(container.firstChild).toBeNull();

        const { container: emptyContainer } = render(
            <DraftCardAvatars coCooksIds={[]} />
        );
        expect(emptyContainer.firstChild).toBeNull();
    });

    it('renders avatars for co-cooks', () => {
        render(<DraftCardAvatars coCooksIds={['alice', 'bob']} />);

        const container = screen.getByTestId('draft-card-avatars');
        expect(container.tagName).toBe('DIV');
        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
    });

    it('renders overflow counter when more than 3 co-cooks', () => {
        render(
            <DraftCardAvatars
                coCooksIds={['alice', 'bob', 'charlie', 'david', 'emma']}
            />
        );

        expect(screen.getByText('A')).toBeInTheDocument();
        expect(screen.getByText('B')).toBeInTheDocument();
        expect(screen.getByText('C')).toBeInTheDocument();
        expect(screen.getByText('+2')).toBeInTheDocument();
    });

    it('renders button and triggers onManageCoCooks when provided', () => {
        const handleManage = vi.fn();
        render(
            <DraftCardAvatars
                coCooksIds={['alice']}
                onManageCoCooks={handleManage}
            />
        );

        const btn = screen.getByTestId('draft-card-avatars');
        expect(btn.tagName).toBe('BUTTON');
        expect(btn).toHaveAttribute('aria-label', 'Manage Co-Cooks & Invites');

        fireEvent.click(btn);
        expect(handleManage).toHaveBeenCalledTimes(1);
    });
});
