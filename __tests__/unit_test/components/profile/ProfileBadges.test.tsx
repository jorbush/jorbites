import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import ProfileBadges from '@/app/components/profile/ProfileBadges';
import confetti from 'canvas-confetti';

const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
}));

vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

describe('ProfileBadges Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('returns null when badges array is empty or undefined', () => {
        const { container: c1 } = render(<ProfileBadges badges={[]} />);
        expect(c1.firstChild).toBeNull();

        const { container: c2 } = render(<ProfileBadges badges={null} />);
        expect(c2.firstChild).toBeNull();
    });

    it('renders badges when list is provided', () => {
        render(
            <ProfileBadges
                badges={['early_adopter', 'top_chef', 'quest_solver_1']}
            />
        );

        const badges = screen.getAllByRole('button');
        expect(badges.length).toBe(3);
    });

    it('triggers confetti on non-quest badge click', () => {
        render(<ProfileBadges badges={['early_adopter']} />);

        const badgeButton = screen.getByRole('button');
        fireEvent.click(badgeButton);

        expect(confetti).toHaveBeenCalledWith({
            particleCount: 100,
            spread: 160,
            origin: { y: 0.6 },
        });
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('navigates to quest badges page on quest badge click', () => {
        render(<ProfileBadges badges={['quest_solver_10']} />);

        const badgeButton = screen.getByRole('button');
        fireEvent.click(badgeButton);

        expect(mockPush).toHaveBeenCalledWith('/events/quest_badges');
        expect(confetti).not.toHaveBeenCalled();
    });
});
