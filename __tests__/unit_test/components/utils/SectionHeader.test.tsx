import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import SectionHeader from '@/app/components/utils/SectionHeader';
import { FcLike } from 'react-icons/fc';

describe('<SectionHeader />', () => {
    it('renders the title', () => {
        render(
            <SectionHeader
                icon={FcLike}
                title="Test Title"
            />
        );
        expect(screen.getByText('Test Title')).toBeDefined();
    });

    it('renders the description when provided', () => {
        render(
            <SectionHeader
                icon={FcLike}
                title="Test Title"
                description="Test Description"
            />
        );
        expect(screen.getByText('Test Description')).toBeDefined();
    });

    it('does not render description when not provided', () => {
        const { container } = render(
            <SectionHeader
                icon={FcLike}
                title="Test Title"
            />
        );
        const descriptionElement = container.querySelector('.text-sm');
        expect(descriptionElement).toBeNull();
    });

    it('renders the icon', () => {
        const { container } = render(
            <SectionHeader
                icon={FcLike}
                title="Test Title"
            />
        );
        const iconElement = container.querySelector('svg');
        expect(iconElement).toBeDefined();
    });

    it('applies correct classes to title', () => {
        const { container } = render(
            <SectionHeader
                icon={FcLike}
                title="Test Title"
            />
        );
        const titleElement = container.querySelector('h1');
        expect(titleElement).toBeDefined();
        expect(titleElement?.className).toContain('text-3xl');
        expect(titleElement?.className).toContain('font-bold');
        expect(titleElement?.className).toContain('dark:text-neutral-100');
    });

    it('applies correct classes to description', () => {
        const { container } = render(
            <SectionHeader
                icon={FcLike}
                title="Test Title"
                description="Test Description"
            />
        );
        const descriptionElement = container.querySelector('p');
        expect(descriptionElement).toBeDefined();
        expect(descriptionElement?.className).toContain('text-sm');
        expect(descriptionElement?.className).toContain('text-gray-600');
        expect(descriptionElement?.className).toContain('dark:text-gray-300');
    });

    it('applies correct classes to container', () => {
        const { container } = render(
            <SectionHeader
                icon={FcLike}
                title="Test Title"
            />
        );
        const containerElement = container.firstChild as HTMLElement;
        expect(containerElement).toBeDefined();
        expect(containerElement.className).toContain('mb-10');
        expect(containerElement.className).toContain('text-center');
    });

    it('applies custom className to the container', () => {
        const customClass = 'my-custom-class';
        const { container } = render(
            <SectionHeader
                icon={FcLike}
                title="Test Title"
                className={customClass}
            />
        );
        const containerElement = container.firstChild as HTMLElement;
        expect(containerElement).toBeDefined();
        expect(containerElement.className).toContain('mb-10');
        expect(containerElement.className).toContain('text-center');
        expect(containerElement.className).toContain(customClass);
    });
});
