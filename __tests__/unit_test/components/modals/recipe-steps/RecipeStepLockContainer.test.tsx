import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import RecipeStepLockContainer from '@/app/components/modals/recipe-steps/RecipeStepLockContainer';

vi.mock('@/app/components/modals/recipe-steps/RecipeLockBanner', () => ({
    default: ({ isCurrentStepLocked, isViewer }: any) => (
        <div data-testid="mock-lock-banner">
            Banner: {isCurrentStepLocked ? 'locked' : 'unlocked'}, Viewer:{' '}
            {isViewer ? 'yes' : 'no'}
        </div>
    ),
}));

describe('RecipeStepLockContainer', () => {
    it('renders children normally when unlocked', () => {
        render(
            <RecipeStepLockContainer
                lockState={{
                    isCurrentStepLocked: false,
                    isViewer: false,
                }}
            >
                <div data-testid="step-child">Step Content</div>
            </RecipeStepLockContainer>
        );

        expect(screen.getByTestId('mock-lock-banner')).toBeInTheDocument();
        expect(screen.getByTestId('step-child')).toBeInTheDocument();
        const container = screen.getByTestId('locked-step-container');
        expect(container).not.toHaveClass('pointer-events-none');
        expect(container).not.toHaveAttribute('inert');
    });

    it('sets inert and disables pointer events when locked', () => {
        render(
            <RecipeStepLockContainer
                lockState={{
                    isCurrentStepLocked: true,
                    isViewer: false,
                }}
            >
                <div data-testid="step-child">Step Content</div>
            </RecipeStepLockContainer>
        );

        const container = screen.getByTestId('locked-step-container');
        expect(container).toHaveClass('pointer-events-none opacity-60');
        expect(container).toHaveAttribute('inert');
    });

    it('sets inert and disables pointer events when user is viewer', () => {
        render(
            <RecipeStepLockContainer
                lockState={{
                    isCurrentStepLocked: false,
                    isViewer: true,
                }}
            >
                <div data-testid="step-child">Step Content</div>
            </RecipeStepLockContainer>
        );

        const container = screen.getByTestId('locked-step-container');
        expect(container).toHaveClass('pointer-events-none opacity-60');
        expect(container).toHaveAttribute('inert');
    });
});
