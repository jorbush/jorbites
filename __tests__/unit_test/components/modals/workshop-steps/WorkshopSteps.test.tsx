import React from 'react';
import { cleanup, render, screen } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import WorkshopInfoStep from '@/app/components/modals/workshop-steps/WorkshopInfoStep';
import WorkshopRequirementsStep from '@/app/components/modals/workshop-steps/WorkshopRequirementsStep';
import WorkshopPrivacyStep from '@/app/components/modals/workshop-steps/WorkshopPrivacyStep';

vi.mock('@/app/components/inputs/Input', () => ({
    default: ({ label, id }: any) => (
        <div data-testid={`input-${id}`}>{label}</div>
    ),
}));

vi.mock('@/app/components/inputs/CurrencySelect', () => ({
    default: () => <div data-testid="currency-select">Currency</div>,
}));

vi.mock('@/app/components/utils/CollapsibleSection', () => ({
    default: ({ children, title }: any) => (
        <div data-testid="collapsible">
            <h3>{title}</h3>
            {children}
        </div>
    ),
}));

vi.mock(
    '@/app/components/modals/workshop-steps/WorkshopIngredientsStep',
    () => ({
        default: () => <div data-testid="ingredients-step">Ingredients</div>,
    })
);

vi.mock(
    '@/app/components/modals/workshop-steps/WorkshopPreviousStepsStep',
    () => ({
        default: () => (
            <div data-testid="previous-steps-step">Previous Steps</div>
        ),
    })
);

vi.mock('@/app/components/modals/workshop-steps/WhitelistUsersStep', () => ({
    default: () => (
        <div data-testid="whitelist-users-step">Whitelist Users</div>
    ),
}));

const mockT = (key: string) => key;

describe('WorkshopModal Steps', () => {
    afterEach(() => {
        cleanup();
    });

    const mockRegister = vi.fn().mockReturnValue({});
    const mockErrors = {};

    describe('WorkshopInfoStep', () => {
        it('renders step 0 form fields correctly', () => {
            render(
                <WorkshopInfoStep
                    register={mockRegister}
                    errors={mockErrors}
                    isLoading={false}
                    isRecurrent={false}
                    t={mockT}
                />
            );
            expect(screen.getByTestId('input-title')).toBeDefined();
            expect(screen.getByTestId('input-description')).toBeDefined();
            expect(screen.getByTestId('input-date')).toBeDefined();
            expect(screen.getByTestId('input-location')).toBeDefined();
            expect(screen.queryByRole('combobox')).toBeNull(); // Recurrence pattern select should not render when isRecurrent is false
        });

        it('renders recurrence pattern select when isRecurrent is true', () => {
            render(
                <WorkshopInfoStep
                    register={mockRegister}
                    errors={mockErrors}
                    isLoading={false}
                    isRecurrent={true}
                    t={mockT}
                />
            );
            expect(screen.getByRole('combobox')).toBeDefined();
        });
    });

    describe('WorkshopRequirementsStep', () => {
        it('renders price, ingredients, and previous steps controls', () => {
            render(
                <WorkshopRequirementsStep
                    register={mockRegister}
                    errors={mockErrors}
                    isLoading={false}
                    numIngredients={1}
                    numPreviousSteps={1}
                    onAddIngredient={vi.fn()}
                    onRemoveIngredient={vi.fn()}
                    onAddPreviousStep={vi.fn()}
                    onRemovePreviousStep={vi.fn()}
                    t={mockT}
                />
            );
            expect(screen.getByTestId('input-price')).toBeDefined();
            expect(screen.getByTestId('currency-select')).toBeDefined();
            expect(screen.getByTestId('ingredients-step')).toBeDefined();
            expect(screen.getByTestId('previous-steps-step')).toBeDefined();
        });
    });

    describe('WorkshopPrivacyStep', () => {
        it('renders privacy checkbox but not WhitelistUsersStep if isPrivate is false', () => {
            render(
                <WorkshopPrivacyStep
                    register={mockRegister}
                    isLoading={false}
                    isPrivate={false}
                    selectedUsers={[]}
                    onAddUser={vi.fn()}
                    onRemoveUser={vi.fn()}
                    t={mockT}
                />
            );
            expect(screen.getByLabelText('private_workshop')).toBeDefined();
            expect(screen.queryByTestId('whitelist-users-step')).toBeNull();
        });

        it('renders WhitelistUsersStep if isPrivate is true', () => {
            render(
                <WorkshopPrivacyStep
                    register={mockRegister}
                    isLoading={false}
                    isPrivate={true}
                    selectedUsers={[]}
                    onAddUser={vi.fn()}
                    onRemoveUser={vi.fn()}
                    t={mockT}
                />
            );
            expect(screen.getByTestId('whitelist-users-step')).toBeDefined();
        });
    });
});
