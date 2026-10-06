import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import DraftsRolesStep from '@/app/components/courses/drafts/steps/DraftsRolesStep';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

// Mock RolePermissionSimulator to verify composition
vi.mock(
    '@/app/components/courses/drafts/simulators/RolePermissionSimulator',
    () => ({
        default: () => (
            <div data-testid="mock-roles-simulator">MockRolesSimulator</div>
        ),
    })
);

describe('DraftsRolesStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the roles step title, descriptions, and child simulator', () => {
        const onCompleteMock = vi.fn();
        render(<DraftsRolesStep onComplete={onCompleteMock} />);

        expect(
            screen.getByText('drafts_course_details.roles_title')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.roles_desc1')
        ).toBeDefined();
        expect(screen.getByTestId('mock-roles-simulator')).toBeDefined();

        const completeBtn = screen.getByRole('button', {
            name: /contest_manager_course_details.mark_completed/i,
        });
        fireEvent.click(completeBtn);
        expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
});
