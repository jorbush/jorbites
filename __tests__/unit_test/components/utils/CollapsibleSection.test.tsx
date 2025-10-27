import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CollapsibleSection from '@/app/components/utils/CollapsibleSection';

describe('<CollapsibleSection />', () => {
    const mockTitle = 'Test Title';
    const mockDescription = 'Test Description';
    const mockChildren = <div>Test Content</div>;

    it('renders the title', () => {
        const { container } = render(
            <CollapsibleSection
                title={mockTitle}
                description={mockDescription}
            >
                {mockChildren}
            </CollapsibleSection>
        );
        const titleElement = container.querySelector('h3');
        expect(titleElement).toBeDefined();
        expect(titleElement?.textContent).toBe(mockTitle);
    });

    it('renders the description', () => {
        const { container } = render(
            <CollapsibleSection
                title={mockTitle}
                description={mockDescription}
            >
                {mockChildren}
            </CollapsibleSection>
        );
        const descriptionElement = container.querySelector('p');
        expect(descriptionElement).toBeDefined();
        expect(descriptionElement?.textContent).toBe(mockDescription);
    });

    it('starts in a collapsed state', () => {
        const { container } = render(
            <CollapsibleSection
                title={mockTitle}
                description={mockDescription}
            >
                {mockChildren}
            </CollapsibleSection>
        );
        // The content div should not exist when collapsed
        const outerDiv = container.firstChild as HTMLElement;
        expect(outerDiv.children.length).toBe(1); // Only the header div should exist
    });

    it('expands when clicked', () => {
        const { container } = render(
            <CollapsibleSection
                title={mockTitle}
                description={mockDescription}
            >
                {mockChildren}
            </CollapsibleSection>
        );
        const header = container.querySelector('.flex.cursor-pointer');
        fireEvent.click(header!);

        // After clicking, the content div should be rendered
        const outerDiv = container.firstChild as HTMLElement;
        expect(outerDiv.children.length).toBe(2); // Header div + content div
        const contentDiv = outerDiv.children[1] as HTMLElement;
        expect(contentDiv.textContent).toContain('Test Content');
    });

    it('collapses when clicked again', () => {
        const { container } = render(
            <CollapsibleSection
                title={mockTitle}
                description={mockDescription}
            >
                {mockChildren}
            </CollapsibleSection>
        );
        const header = container.querySelector('.flex.cursor-pointer');
        const outerDiv = container.firstChild as HTMLElement;

        // First click - expand
        fireEvent.click(header!);
        expect(outerDiv.children.length).toBe(2); // Header + content

        // Second click - collapse
        fireEvent.click(header!);
        expect(outerDiv.children.length).toBe(1); // Only header
    });

    it('displays chevron down icon when collapsed', () => {
        const { container } = render(
            <CollapsibleSection
                title={mockTitle}
                description={mockDescription}
            >
                {mockChildren}
            </CollapsibleSection>
        );
        const chevronDownIcon = container.querySelector('svg');
        expect(chevronDownIcon).toBeDefined();
    });

    it('displays chevron up icon when expanded', () => {
        const { container } = render(
            <CollapsibleSection
                title={mockTitle}
                description={mockDescription}
            >
                {mockChildren}
            </CollapsibleSection>
        );
        const header = container.querySelector('.flex.cursor-pointer');
        fireEvent.click(header!);

        const chevronUpIcon = container.querySelector('svg');
        expect(chevronUpIcon).toBeDefined();
    });

    it('applies correct classes to the container', () => {
        const { container } = render(
            <CollapsibleSection
                title={mockTitle}
                description={mockDescription}
            >
                {mockChildren}
            </CollapsibleSection>
        );
        const containerElement = container.firstChild as HTMLElement;
        expect(containerElement).toBeDefined();
        expect(containerElement.className).toContain('rounded-lg');
        expect(containerElement.className).toContain('border');
        expect(containerElement.className).toContain('dark:border-neutral-700');
    });

    it('applies correct classes to the header', () => {
        const { container } = render(
            <CollapsibleSection
                title={mockTitle}
                description={mockDescription}
            >
                {mockChildren}
            </CollapsibleSection>
        );
        const headerElement = container.querySelector('.flex');
        expect(headerElement).toBeDefined();
        expect(headerElement?.className).toContain('cursor-pointer');
        expect(headerElement?.className).toContain('items-center');
        expect(headerElement?.className).toContain('justify-between');
        expect(headerElement?.className).toContain('p-4');
    });

    it('applies correct classes to the title', () => {
        const { container } = render(
            <CollapsibleSection
                title={mockTitle}
                description={mockDescription}
            >
                {mockChildren}
            </CollapsibleSection>
        );
        const titleElement = container.querySelector('h3');
        expect(titleElement).toBeDefined();
        expect(titleElement?.className).toContain('font-semibold');
    });

    it('applies correct classes to the description', () => {
        const { container } = render(
            <CollapsibleSection
                title={mockTitle}
                description={mockDescription}
            >
                {mockChildren}
            </CollapsibleSection>
        );
        const descriptionElement = container.querySelector('p');
        expect(descriptionElement).toBeDefined();
        expect(descriptionElement?.className).toContain('text-sm');
        expect(descriptionElement?.className).toContain('text-neutral-500');
        expect(descriptionElement?.className).toContain(
            'dark:text-neutral-400'
        );
    });

    it('applies correct classes to the content when expanded', () => {
        const { container } = render(
            <CollapsibleSection
                title={mockTitle}
                description={mockDescription}
            >
                {mockChildren}
            </CollapsibleSection>
        );
        const header = container.querySelector('.flex.cursor-pointer');
        fireEvent.click(header!);

        const outerDiv = container.firstChild as HTMLElement;
        const contentElement = outerDiv.children[1] as HTMLElement;
        expect(contentElement).toBeDefined();
        expect(contentElement?.className).toContain('p-4');
    });
});
