import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, afterEach } from 'vitest';
import WorkshopsHeader from '@/app/components/workshops/WorkshopsHeader';
import { FcConferenceCall } from 'react-icons/fc';

describe('<WorkshopsHeader />', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders with title and icon', () => {
        render(
            <WorkshopsHeader
                icon={FcConferenceCall}
                title="Workshops"
            />
        );

        expect(screen.getByText('Workshops')).toBeDefined();
    });

    it('renders with title, icon, and description', () => {
        render(
            <WorkshopsHeader
                icon={FcConferenceCall}
                title="Workshops"
                description="Learn new cooking skills"
            />
        );

        expect(screen.getByText('Workshops')).toBeDefined();
        expect(screen.getByText('Learn new cooking skills')).toBeDefined();
    });

    it('does not render description when not provided', () => {
        const { container } = render(
            <WorkshopsHeader
                icon={FcConferenceCall}
                title="Workshops"
            />
        );

        const descriptions = container.querySelectorAll('p');
        expect(descriptions.length).toBe(0);
    });

    it('renders null description correctly', () => {
        const { container } = render(
            <WorkshopsHeader
                icon={FcConferenceCall}
                title="Workshops"
                description={null}
            />
        );

        const descriptions = container.querySelectorAll('p');
        expect(descriptions.length).toBe(0);
    });

    it('renders undefined description correctly', () => {
        const { container } = render(
            <WorkshopsHeader
                icon={FcConferenceCall}
                title="Workshops"
                description={undefined}
            />
        );

        const descriptions = container.querySelectorAll('p');
        expect(descriptions.length).toBe(0);
    });

    it('applies correct styling classes', () => {
        const { container } = render(
            <WorkshopsHeader
                icon={FcConferenceCall}
                title="Workshops"
                description="Test description"
            />
        );

        const heading = container.querySelector('h1');
        expect(heading).toBeDefined();
        expect(heading?.className).toContain('mb-3');
        expect(heading?.className).toContain('font-bold');
    });

    it('renders icon with correct accessibility attribute', () => {
        const { container } = render(
            <WorkshopsHeader
                icon={FcConferenceCall}
                title="Workshops"
            />
        );

        const icon = container.querySelector('[aria-hidden="true"]');
        expect(icon).toBeDefined();
    });
});
