import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeLockBanner from '@/app/components/modals/recipe-steps/RecipeLockBanner';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'lock_step_editing') {
                return `@${options?.userName} is currently editing this step`;
            }
            if (key === 'co_cook_active_other_step') {
                return `@${options?.userName} is currently editing another step`;
            }
            return key;
        },
    }),
}));

describe('RecipeLockBanner', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('returns null when there are no locks and not a shared session', () => {
        const { container } = render(
            <RecipeLockBanner
                isCurrentStepLocked={false}
                lockOwner={null}
                isSharedSession={false}
                otherActiveLocks={[]}
            />
        );
        expect(container.firstChild).toBeNull();
    });

    it('renders lock banner when current step is locked with a named lock owner', () => {
        render(
            <RecipeLockBanner
                isCurrentStepLocked={true}
                lockOwner={{ userName: 'Alice', userId: 'user-1' }}
                isSharedSession={true}
                otherActiveLocks={[]}
            />
        );

        const banner = screen.getByTestId('lock-banner');
        expect(banner).toBeDefined();
        expect(
            screen.getByText('@Alice is currently editing this step')
        ).toBeDefined();
    });

    it('renders lock banner when current step is locked with generic text if no username', () => {
        render(
            <RecipeLockBanner
                isCurrentStepLocked={true}
                lockOwner={{ userName: '', userId: 'user-1' }}
                isSharedSession={true}
                otherActiveLocks={[]}
            />
        );

        const banner = screen.getByTestId('lock-banner');
        expect(banner).toBeDefined();
        expect(screen.getByText('lock_step_editing_generic')).toBeDefined();
    });

    it('renders co-cook activity banner when another step is locked in a shared session', () => {
        render(
            <RecipeLockBanner
                isCurrentStepLocked={false}
                lockOwner={null}
                isSharedSession={true}
                otherActiveLocks={[
                    ['step:1', { userName: 'Bob', userId: 'user-2' }],
                ]}
            />
        );

        const banner = screen.getByTestId('co-cook-activity-banner');
        expect(banner).toBeDefined();
        expect(
            screen.getByText('@Bob is currently editing another step')
        ).toBeDefined();
    });

    it('renders generic co-cook activity banner when another step is locked with no username', () => {
        render(
            <RecipeLockBanner
                isCurrentStepLocked={false}
                lockOwner={null}
                isSharedSession={true}
                otherActiveLocks={[['step:1', { userId: 'user-2' }]]}
            />
        );

        const banner = screen.getByTestId('co-cook-activity-banner');
        expect(banner).toBeDefined();
        expect(
            screen.getByText('co_cook_active_other_step_generic')
        ).toBeDefined();
    });
});
