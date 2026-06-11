import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import React from 'react';
import { PlanningHeader } from '@/app/components/plannings/PlanningHeader';

vi.mock('@/app/components/utils/Avatar', () => ({
    default: () => <div data-testid="avatar" />,
}));

vi.mock('@/app/utils/date-utils', () => ({
    formatDate: (date: any, lang: string) => `formatted-date-${lang}`,
}));

describe('PlanningHeader', () => {
    const mockPlanning = {
        id: 'plan-123',
        name: 'Weekly Keto',
        description: 'Low carb plan',
        userId: 'user-1',
        createdAt: new Date().toISOString(),
        user: {
            id: 'user-1',
            name: 'John Doe',
            image: 'john.png',
        },
    } as any;

    const t = (key: string) => key;
    const push = vi.fn();
    const togglePrivacy = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders name, description, date and avatar correctly', () => {
        render(
            <PlanningHeader
                editedName="Weekly Keto"
                editedDesc="Low carb plan"
                planning={mockPlanning}
                language="en"
                isOwner={true}
                isPrivate={false}
                isSaving={false}
                togglePrivacy={togglePrivacy}
                push={push}
                t={t}
            />
        );

        expect(screen.getByText('Weekly Keto')).toBeDefined();
        expect(screen.getByText('Low carb plan')).toBeDefined();
        expect(screen.getByText('John Doe')).toBeDefined();
        expect(screen.getByText('formatted-date-en')).toBeDefined();
        expect(screen.getByTestId('avatar')).toBeDefined();
    });

    it('triggers togglePrivacy when lock button clicked', () => {
        render(
            <PlanningHeader
                editedName="Weekly Keto"
                editedDesc="Low carb plan"
                planning={mockPlanning}
                language="en"
                isOwner={true}
                isPrivate={true}
                isSaving={false}
                togglePrivacy={togglePrivacy}
                push={push}
                t={t}
            />
        );

        const lockBtn = screen.getByRole('button', { name: 'private' });
        fireEvent.click(lockBtn);
        expect(togglePrivacy).toHaveBeenCalledTimes(1);
    });
});
