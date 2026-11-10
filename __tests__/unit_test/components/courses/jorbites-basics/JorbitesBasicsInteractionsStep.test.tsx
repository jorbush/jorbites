import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import JorbitesBasicsInteractionsStep from '@/app/courses/jorbites-basics/steps/JorbitesBasicsInteractionsStep';
import React from 'react';

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
    }),
}));

describe('JorbitesBasicsInteractionsStep', () => {
    afterEach(() => {
        cleanup();
    });

    it('renders the interactions step title, descriptions, and calls onComplete when completed', () => {
        const onCompleteMock = vi.fn();
        render(<JorbitesBasicsInteractionsStep onComplete={onCompleteMock} />);

        expect(
            screen.getByText(
                'jorbites_basics_course_details.interactions_info_title'
            )
        ).toBeDefined();
        expect(
            screen.getByText('jorbites_basics_course_details.slots_desc1')
        ).toBeDefined();
        expect(
            screen.getByText('jorbites_basics_course_details.slots_desc2')
        ).toBeDefined();

        const completeBtn = screen.getByRole('button', {
            name: /contest_manager_course_details.mark_completed/i,
        });
        fireEvent.click(completeBtn);

        expect(onCompleteMock).toHaveBeenCalledTimes(1);
    });
});
