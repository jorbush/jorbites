import React from 'react';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import RecipeBookConfigStep from '@/app/components/modals/recipe-book-steps/RecipeBookConfigStep';
import { RecipeBookConfig } from '@/app/utils/recipeBookUtils';

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

vi.mock('@/app/components/utils/Dropdown', () => ({
    default: ({ options, value, onChange, ariaLabel }: any) => (
        <div
            data-testid="dropdown"
            aria-label={ariaLabel}
        >
            <button
                type="button"
                data-testid="dropdown-button"
                aria-label={ariaLabel}
            >
                {value}
            </button>
            {options.map((opt: any) => (
                <button
                    key={opt.value}
                    type="button"
                    data-testid={`dropdown-option-${opt.value}`}
                    onClick={() => onChange(opt.value)}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    ),
}));

vi.mock('@/app/components/inputs/ToggleSwitch', () => ({
    default: ({ checked, onChange, dataCy }: any) => (
        <button
            type="button"
            role="switch"
            aria-checked={checked}
            onClick={onChange}
            data-testid={dataCy}
        />
    ),
}));

describe('RecipeBookConfigStep', () => {
    const defaultConfig: RecipeBookConfig = {
        imageDisplay: 'random',
        displayExtraImages: true,
        displayUserImage: true,
    };

    const mockDispatch = vi.fn();

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders all configuration options', () => {
        render(
            <RecipeBookConfigStep
                config={defaultConfig}
                dispatch={mockDispatch}
            />
        );

        expect(screen.getByText('recipe_image_display')).toBeDefined();
        expect(screen.getByText('display_extra_images')).toBeDefined();
        expect(screen.getByText('display_user_image_in_cover')).toBeDefined();
    });

    it('renders dropdown with current image display value', () => {
        render(
            <RecipeBookConfigStep
                config={{ ...defaultConfig, imageDisplay: 'left-top' }}
                dispatch={mockDispatch}
            />
        );

        const dropdownBtn = screen.getByTestId('dropdown-button');
        expect(dropdownBtn.textContent).toBe('left-top');
    });

    it('dispatches SET_IMAGE_DISPLAY when an option is selected', () => {
        render(
            <RecipeBookConfigStep
                config={defaultConfig}
                dispatch={mockDispatch}
            />
        );

        fireEvent.click(screen.getByTestId('dropdown-option-left-top'));
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'SET_IMAGE_DISPLAY',
            payload: 'left-top',
        });
    });

    it('renders extra images toggle as checked when enabled', () => {
        render(
            <RecipeBookConfigStep
                config={defaultConfig}
                dispatch={mockDispatch}
            />
        );

        const toggle = screen.getByTestId('extra-images-toggle');
        expect(toggle.getAttribute('aria-checked')).toBe('true');
    });

    it('dispatches TOGGLE_EXTRA_IMAGES when extra images toggle is clicked', () => {
        render(
            <RecipeBookConfigStep
                config={defaultConfig}
                dispatch={mockDispatch}
            />
        );

        fireEvent.click(screen.getByTestId('extra-images-toggle'));
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'TOGGLE_EXTRA_IMAGES',
        });
    });

    it('renders extra images toggle as unchecked when disabled', () => {
        render(
            <RecipeBookConfigStep
                config={{ ...defaultConfig, displayExtraImages: false }}
                dispatch={mockDispatch}
            />
        );

        const toggle = screen.getByTestId('extra-images-toggle');
        expect(toggle.getAttribute('aria-checked')).toBe('false');
    });

    it('renders user image toggle as checked when enabled', () => {
        render(
            <RecipeBookConfigStep
                config={defaultConfig}
                dispatch={mockDispatch}
            />
        );

        const toggle = screen.getByTestId('user-image-toggle');
        expect(toggle.getAttribute('aria-checked')).toBe('true');
    });

    it('dispatches TOGGLE_USER_IMAGE when user image toggle is clicked', () => {
        render(
            <RecipeBookConfigStep
                config={defaultConfig}
                dispatch={mockDispatch}
            />
        );

        fireEvent.click(screen.getByTestId('user-image-toggle'));
        expect(mockDispatch).toHaveBeenCalledWith({
            type: 'TOGGLE_USER_IMAGE',
        });
    });

    it('renders user image toggle as unchecked when disabled', () => {
        render(
            <RecipeBookConfigStep
                config={{ ...defaultConfig, displayUserImage: false }}
                dispatch={mockDispatch}
            />
        );

        const toggle = screen.getByTestId('user-image-toggle');
        expect(toggle.getAttribute('aria-checked')).toBe('false');
    });
});
