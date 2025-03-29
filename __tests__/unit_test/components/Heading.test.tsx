import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Heading from '@/app/components/navigation/Heading';

describe('<Heading />', () => {
    it('renders the title', () => {
        render(<Heading title="Test Title" />);
        expect(screen.getByText('Test Title')).toBeDefined();
    });

    it('renders the subtitle when provided', () => {
        render(
            <Heading
                title="Test Title"
                subtitle="Test Subtitle"
            />
        );
        expect(screen.getByText('Test Subtitle')).toBeDefined();
    });

    it('applies center class when center prop is true', () => {
        const { container } = render(
            <Heading
                title="Test Title"
                center
            />
        );
        expect(container.firstChild).toBeDefined();
        expect((container.firstChild as HTMLElement).className).toContain(
            'text-center'
        );
    });

    it('applies text-start class when center prop is false', () => {
        const { container } = render(
            <Heading
                title="Test Title"
                center={false}
            />
        );
        expect(container.firstChild).toBeDefined();
        expect((container.firstChild as HTMLElement).className).toContain(
            'text-start'
        );
    });

    it('applies break-words class for long words', () => {
        const longTitle =
            'ThisIsAVeryLongWordThatShouldTriggerTheBreakAllClass';
        const { container } = render(<Heading title={longTitle} />);
        const titleElement = container.querySelector('.text-2xl');
        expect(titleElement).toBeDefined();
        expect(titleElement?.className).toContain('break-words');
    });

    it('does not apply break-words class for normal words', () => {
        const { container } = render(<Heading title="Normal Title" />);
        const titleElement = container.querySelector('.text-2xl');
        expect(titleElement).toBeDefined();
        expect(titleElement?.className).not.toContain('break-words');
    });

    it('applies correct classes to title div', () => {
        const { container } = render(<Heading title="Test Title" />);
        const titleElement = container.querySelector('.text-2xl');
        expect(titleElement).toBeDefined();
        expect(titleElement?.className).toContain('whitespace-pre-wrap');
        expect(titleElement?.className).toContain('text-center');
        expect(titleElement?.className).toContain('font-bold');
        expect(titleElement?.className).toContain('dark:text-neutral-100');
    });

    it('applies correct classes to subtitle div', () => {
        const { container } = render(
            <Heading
                title="Test Title"
                subtitle="Test Subtitle"
            />
        );
        const subtitleElement = container.querySelector('.mt-2');
        expect(subtitleElement).toBeDefined();
        expect(subtitleElement?.className).toContain('font-light');
        expect(subtitleElement?.className).toContain('text-neutral-500');
    });
});
