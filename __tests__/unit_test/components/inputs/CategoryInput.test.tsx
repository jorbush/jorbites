import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CategoryBox from '@/app/components/inputs/CategoryInput';
import { FaHome } from 'react-icons/fa';

// Mock the react-i18next hook
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('CategoryBox', () => {
    const mockOnClick = vi.fn();

    afterEach(() => {
        cleanup();
    });

    it('renders correctly with provided props', () => {
        render(
            <CategoryBox
                icon={FaHome}
                label="Home"
                onClick={mockOnClick}
            />
        );

        expect(screen.getByText('home')).toBeDefined();
    });

    it('applies correct styling when selected', () => {
        const { container } = render(
            <CategoryBox
                icon={FaHome}
                label="Home"
                selected={true}
                onClick={mockOnClick}
            />
        );

        const categoryBox = container.firstChild as HTMLElement;
        expect(categoryBox.className).toContain('border-black');
        expect(categoryBox.className).toContain('selected');
    });

    it('applies correct styling when not selected', () => {
        const { container } = render(
            <CategoryBox
                icon={FaHome}
                label="Home"
                selected={false}
                onClick={mockOnClick}
            />
        );

        const categoryBox = container.firstChild as HTMLElement;
        expect(categoryBox.className).toContain('border-neutral-200');
        expect(categoryBox.className).not.toContain('selected');
    });

    it('calls onClick with the correct label when clicked', () => {
        render(
            <CategoryBox
                icon={FaHome}
                label="Home"
                onClick={mockOnClick}
            />
        );

        const categoryBox = screen.getByText('home').parentElement;
        fireEvent.click(categoryBox!);

        expect(mockOnClick).toHaveBeenCalledWith('Home');
    });

    it('translates the label correctly', () => {
        render(
            <CategoryBox
                icon={FaHome}
                label="Home"
                onClick={mockOnClick}
            />
        );

        expect(screen.getByText('home')).toBeDefined();
    });
});
