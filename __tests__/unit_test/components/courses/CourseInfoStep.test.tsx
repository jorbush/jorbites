import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import CourseInfoStep from '@/app/components/courses/CourseInfoStep';
import React from 'react';
import { FiCheck } from 'react-icons/fi';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

afterEach(() => {
    cleanup();
});

describe('CourseInfoStep', () => {
    it('renders title, icon, and paragraph texts correctly', () => {
        const paragraphs = ['Para 1 content', 'Para 2 content'];
        render(
            <CourseInfoStep
                title="Info Step Title"
                icon={FiCheck}
                paragraphs={paragraphs}
                onComplete={() => {}}
            />
        );

        expect(screen.getByText('Info Step Title')).toBeDefined();
        expect(screen.getByText('Para 1 content')).toBeDefined();
        expect(screen.getByText('Para 2 content')).toBeDefined();
    });

    it('renders custom children and fires callback on button click', () => {
        const onCompleteMock = vi.fn();
        render(
            <CourseInfoStep
                title="Info Step Title"
                icon={FiCheck}
                onComplete={onCompleteMock}
                buttonLabel="Mark Step Done"
            >
                <div data-testid="custom-child">Child view content</div>
            </CourseInfoStep>
        );

        // Child node is rendered
        expect(screen.getByTestId('custom-child')).toBeDefined();

        // Button is rendered and handles click
        const btn = screen.getByRole('button', { name: 'Mark Step Done' });
        expect(btn).toBeDefined();

        fireEvent.click(btn);
        expect(onCompleteMock).toHaveBeenCalled();
    });
});
