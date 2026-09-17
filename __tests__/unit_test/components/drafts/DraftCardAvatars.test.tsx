import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useSWR from 'swr';
import DraftCardAvatars from '@/app/components/drafts/DraftCardAvatars';
import { SafeUser } from '@/app/types';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => options?.defaultValue || key,
    }),
}));

vi.mock('swr', () => ({
    default: vi.fn(),
    mutate: vi.fn(),
}));

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt, width, height, className, style }: any) => (
        <img
            src={src}
            alt={alt}
            width={width}
            height={height}
            className={className}
            style={style}
            data-testid="custom-proxy-image"
        />
    ),
}));

describe('DraftCardAvatars', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.mocked(useSWR).mockReturnValue({
            data: undefined,
            error: undefined,
            isLoading: false,
            isValidating: false,
            mutate: vi.fn(),
        });
    });

    it('returns null if both ownerId and coCooksIds are undefined or empty', () => {
        const { container } = render(<DraftCardAvatars />);
        expect(container.firstChild).toBeNull();

        const { container: emptyContainer } = render(
            <DraftCardAvatars coCooksIds={[]} />
        );
        expect(emptyContainer.firstChild).toBeNull();
    });

    it('renders avatar for owner when only ownerId is provided', () => {
        render(
            <DraftCardAvatars
                ownerId="owner-1"
                ownerName="Alice Chef"
            />
        );

        const container = screen.getByTestId('draft-card-avatars');
        expect(container).toBeInTheDocument();

        const ownerAvatar = screen.getByTestId('draft-card-owner-avatar');
        expect(ownerAvatar).toBeInTheDocument();
        expect(ownerAvatar).toHaveAttribute('title', 'Alice Chef (Owner)');
    });

    it('renders avatars for both the owner and the collaborator', () => {
        render(
            <DraftCardAvatars
                ownerId="owner-1"
                ownerName="Alice Chef"
                coCooksIds={['collab-1']}
            />
        );

        const container = screen.getByTestId('draft-card-avatars');
        expect(container.tagName).toBe('DIV');

        const ownerAvatar = screen.getByTestId('draft-card-owner-avatar');
        expect(ownerAvatar).toBeInTheDocument();
        expect(ownerAvatar).toHaveAttribute('title', 'Alice Chef (Owner)');

        const collabAvatar = screen.getByTestId(
            'draft-card-collaborator-avatar-collab-1'
        );
        expect(collabAvatar).toBeInTheDocument();
        expect(collabAvatar).toHaveAttribute(
            'title',
            'Collaborator (Collaborator)'
        );
    });

    it('renders collaborator avatar when only coCooksIds is provided (backward compatibility)', () => {
        render(<DraftCardAvatars coCooksIds={['collab-1']} />);

        const container = screen.getByTestId('draft-card-avatars');
        expect(container).toBeInTheDocument();

        expect(
            screen.queryByTestId('draft-card-owner-avatar')
        ).not.toBeInTheDocument();
        expect(
            screen.getByTestId('draft-card-collaborator-avatar-collab-1')
        ).toBeInTheDocument();
    });

    it('renders provided user profile images and names from users prop', () => {
        const mockUsers: SafeUser[] = [
            {
                id: 'owner-1',
                name: 'Alice',
                email: 'alice@example.com',
                image: 'https://example.com/alice.jpg',
                createdAt: '',
                updatedAt: '',
                emailVerified: null,
                role: 'user',
            } as unknown as SafeUser,
            {
                id: 'collab-1',
                name: 'Bob',
                email: 'bob@example.com',
                image: 'https://example.com/bob.jpg',
                createdAt: '',
                updatedAt: '',
                emailVerified: null,
                role: 'user',
            } as unknown as SafeUser,
        ];

        render(
            <DraftCardAvatars
                ownerId="owner-1"
                coCooksIds={['collab-1']}
                users={mockUsers}
            />
        );

        const images = screen.getAllByTestId('custom-proxy-image');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute(
            'src',
            'https://example.com/alice.jpg'
        );
        expect(images[1]).toHaveAttribute('src', 'https://example.com/bob.jpg');

        const ownerAvatar = screen.getByTestId('draft-card-owner-avatar');
        expect(ownerAvatar).toHaveAttribute('title', 'Alice (Owner)');

        const collabAvatar = screen.getByTestId(
            'draft-card-collaborator-avatar-collab-1'
        );
        expect(collabAvatar).toHaveAttribute('title', 'Bob (Collaborator)');
    });

    it('uses fallback placeholder image when user has no image', () => {
        const mockUsers: SafeUser[] = [
            {
                id: 'owner-1',
                name: 'Alice',
                image: null,
            } as unknown as SafeUser,
        ];

        render(
            <DraftCardAvatars
                ownerId="owner-1"
                users={mockUsers}
            />
        );

        const img = screen.getByTestId('custom-proxy-image');
        expect(img).toHaveAttribute('src', '/images/placeholder.webp');
    });

    it('deduplicates when ownerId is also present in coCooksIds', () => {
        render(
            <DraftCardAvatars
                ownerId="user-1"
                ownerName="Alice"
                coCooksIds={['user-1', 'collab-2']}
            />
        );

        const ownerAvatar = screen.getByTestId('draft-card-owner-avatar');
        expect(ownerAvatar).toBeInTheDocument();

        expect(
            screen.queryByTestId('draft-card-collaborator-avatar-user-1')
        ).not.toBeInTheDocument();
        expect(
            screen.getByTestId('draft-card-collaborator-avatar-collab-2')
        ).toBeInTheDocument();

        const container = screen.getByTestId('draft-card-avatars');
        expect(container.children).toHaveLength(2);
    });

    it('renders all avatars without overflow when up to 5 participants (owner + 4 co-cooks)', () => {
        render(
            <DraftCardAvatars
                ownerId="owner-1"
                coCooksIds={['c1', 'c2', 'c3', 'c4']}
            />
        );

        expect(
            screen.getByTestId('draft-card-owner-avatar')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('draft-card-collaborator-avatar-c1')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('draft-card-collaborator-avatar-c2')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('draft-card-collaborator-avatar-c3')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('draft-card-collaborator-avatar-c4')
        ).toBeInTheDocument();

        expect(
            screen.queryByTestId('draft-card-avatars-overflow')
        ).not.toBeInTheDocument();

        const container = screen.getByTestId('draft-card-avatars');
        expect(container.children).toHaveLength(5);
    });

    it('renders overflow counter when participants exceed 5', () => {
        render(
            <DraftCardAvatars
                ownerId="owner-1"
                coCooksIds={['c1', 'c2', 'c3', 'c4', 'c5', 'c6']}
            />
        );

        expect(
            screen.getByTestId('draft-card-owner-avatar')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('draft-card-collaborator-avatar-c1')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('draft-card-collaborator-avatar-c2')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('draft-card-collaborator-avatar-c3')
        ).toBeInTheDocument();
        expect(
            screen.getByTestId('draft-card-collaborator-avatar-c4')
        ).toBeInTheDocument();
        expect(
            screen.queryByTestId('draft-card-collaborator-avatar-c5')
        ).not.toBeInTheDocument();
        expect(
            screen.queryByTestId('draft-card-collaborator-avatar-c6')
        ).not.toBeInTheDocument();

        const overflow = screen.getByTestId('draft-card-avatars-overflow');
        expect(overflow).toBeInTheDocument();
        expect(overflow.textContent).toBe('+2');
        expect(overflow).toHaveAttribute('title', '+2 more');
    });

    it('renders button and triggers onManageCoCooks when provided', () => {
        const handleManage = vi.fn();
        render(
            <DraftCardAvatars
                ownerId="owner-1"
                coCooksIds={['collab-1']}
                onManageCoCooks={handleManage}
            />
        );

        const btn = screen.getByTestId('draft-card-avatars');
        expect(btn.tagName).toBe('BUTTON');
        expect(btn).toHaveAttribute('aria-label', 'Manage Co-Cooks & Invites');

        fireEvent.click(btn);
        expect(handleManage).toHaveBeenCalledTimes(1);
    });

    it('fetches users dynamically via SWR when users prop is not supplied', () => {
        const mockFetchedUsers: SafeUser[] = [
            {
                id: 'owner-1',
                name: 'Chef Maria',
                image: 'https://example.com/maria.jpg',
            } as unknown as SafeUser,
            {
                id: 'c1',
                name: 'Chef John',
                image: 'https://example.com/john.jpg',
            } as unknown as SafeUser,
        ];

        vi.mocked(useSWR).mockReturnValue({
            data: mockFetchedUsers,
            error: undefined,
            isLoading: false,
            isValidating: false,
            mutate: vi.fn(),
        });

        render(
            <DraftCardAvatars
                ownerId="owner-1"
                coCooksIds={['c1']}
            />
        );

        expect(useSWR).toHaveBeenCalledWith(
            '/api/users/multiple?ids=owner-1,c1',
            expect.any(Function)
        );

        const images = screen.getAllByTestId('custom-proxy-image');
        expect(images).toHaveLength(2);
        expect(images[0]).toHaveAttribute(
            'src',
            'https://example.com/maria.jpg'
        );
        expect(images[1]).toHaveAttribute(
            'src',
            'https://example.com/john.jpg'
        );
    });
});
