import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import JorbiterCard from '@/app/components/top-jorbiters/JorbiterCard';

// Mock dependencies
vi.mock('next/navigation', () => ({
    useRouter: vi.fn(),
}));

vi.mock('@/app/hooks/useMediaQuery', () => ({
    default: () => false,
}));

vi.mock('@/app/utils/reponsive', () => ({
    default: vi.fn().mockReturnValue('John Doe'),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('<JorbiterCard />', () => {
    const mockJorbiter: any = {
        id: 'user1',
        name: 'John Doe',
        email: 'john@example.com',
        image: '/avatar.jpg',
        verified: true,
        level: 10,
        recipeCount: 42,
        likesReceived: 100,
        badges: ['chef', 'popular'],
    };

    afterEach(() => {
        cleanup();
    });

    it('renders user info correctly', () => {
        render(
            <JorbiterCard
                jorbiter={mockJorbiter}
                index={0}
            />
        );
        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('level 10')).toBeDefined();
    });

    it('renders verification badge when user is verified', () => {
        render(
            <JorbiterCard
                jorbiter={mockJorbiter}
                index={0}
            />
        );
        const verificationIcon = document.querySelector('.text-green-450');
        expect(verificationIcon).toBeDefined();
    });

    it('shows user stats correctly', () => {
        render(
            <JorbiterCard
                jorbiter={mockJorbiter}
                index={0}
            />
        );
        expect(screen.getByText('42')).toBeDefined(); // Recipe count
        expect(screen.getByText('100')).toBeDefined(); // Likes received
        expect(screen.getByText('2')).toBeDefined(); // Badge count
    });

    it('applies gold border for first place', () => {
        const { container } = render(
            <JorbiterCard
                jorbiter={mockJorbiter}
                index={0}
            />
        );
        const cardDiv = container.firstChild as HTMLElement;
        expect(cardDiv.className).toContain('border-yellow-400');
    });

    it('applies silver border for second place', () => {
        const { container } = render(
            <JorbiterCard
                jorbiter={mockJorbiter}
                index={1}
            />
        );
        const cardDiv = container.firstChild as HTMLElement;
        expect(cardDiv.className).toContain('border-gray-400');
    });
});
