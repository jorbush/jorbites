import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ContestManagerClient from '@/app/courses/contest-manager/ContestManagerClient';
import React from 'react';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, options?: any) => {
            if (key === 'contest_manager_course_details.badge_prompt') {
                return `Create a vintage minimalist cartoon badge for a cooking contest. Topic: ${options?.topic || 'default'}. Format: webp.`;
            }
            return key;
        },
        i18n: {
            language: 'en',
        },
    }),
}));

// Mock next/navigation useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        refresh: vi.fn(),
    }),
}));

// Mock useIsMounted
vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

// Mock CertificateGenerator
vi.mock('@/app/components/courses/certificate/CertificateGenerator', () => ({
    default: (props: any) => (
        <div data-testid="mock-cert-generator">
            MockedCertGenerator: {props.courseTitle} | {props.currentUserNames}
        </div>
    ),
}));

// Mock navigator.clipboard.writeText
const mockWriteText = vi.fn().mockResolvedValue(undefined);
Object.defineProperty(navigator, 'clipboard', {
    value: {
        writeText: mockWriteText,
    },
    writable: true,
});

afterEach(() => {
    cleanup();
    vi.clearAllMocks();
    localStorage.clear();
});

describe('ContestManagerClient', () => {
    it('renders and progresses through all modules sequentially', async () => {
        render(<ContestManagerClient />);

        // --- Step 1: Requirements Module ---
        expect(
            screen.getByText(
                'contest_manager_course_details.requirements_title'
            )
        ).toBeDefined();

        // Check off all checkboxes in Requirements Module
        const checkboxes = screen.getAllByRole('checkbox');
        expect(checkboxes).toHaveLength(4);
        checkboxes.forEach((checkbox) => {
            fireEvent.click(checkbox);
        });

        // Click the sidebar button to transition to Workflow step
        const workflowStepBtn = screen
            .getAllByRole('button')
            .find((btn) => btn.textContent?.includes('workflow'));
        expect(workflowStepBtn).toBeDefined();
        fireEvent.click(workflowStepBtn!);
        expect(
            await screen.findByText(
                'contest_manager_course_details.workflow_title'
            )
        ).toBeDefined();

        // --- Step 2: Workflow Step (timeline) ---
        // Loop to advance through 5 steps of the timeline
        for (let i = 1; i <= 4; i++) {
            const nextStepBtn = screen.getByRole('button', {
                name: 'contest_manager_course_details.next_step',
            });
            fireEvent.click(nextStepBtn);
            // Force React to process render queues by waiting for the updated step counter (e.g. (2/5), (3/5)...)
            expect(
                await screen.findByText(new RegExp(`\\(${i + 1}/5\\)`))
            ).toBeDefined();
        }

        // Click the sidebar button to transition to Voting step
        const votingStepBtn = screen
            .getAllByRole('button')
            .find((btn) => btn.textContent?.includes('voting'));
        expect(votingStepBtn).toBeDefined();
        fireEvent.click(votingStepBtn!);
        expect(
            await screen.findByText(
                'contest_manager_course_details.voting_title'
            )
        ).toBeDefined();

        // --- Step 3: Voting Module ---
        // Fill out voting parameters
        const recipeUrlInput = await screen.findByLabelText(
            'contest_manager_course_details.voting_recipe_label'
        );
        const userIpInput = await screen.findByLabelText(
            'contest_manager_course_details.voting_user_label'
        );

        fireEvent.change(userIpInput, { target: { value: 'user-abc' } });
        fireEvent.change(recipeUrlInput, {
            target: { value: 'https://jorbites.com/recipes/pasta' },
        });

        // Copy form link
        const copyFormLinkBtn = await screen.findByRole('button', {
            name: 'Copy generated form link and complete module',
        });
        fireEvent.click(copyFormLinkBtn);
        expect(mockWriteText).toHaveBeenCalled();

        // Click the sidebar button to transition to Badge step
        const badgeStepBtn = screen
            .getAllByRole('button')
            .find((btn) => btn.textContent?.includes('generate_badge'));
        expect(badgeStepBtn).toBeDefined();
        fireEvent.click(badgeStepBtn!);
        expect(
            await screen.findByText(
                'contest_manager_course_details.badge_title'
            )
        ).toBeDefined();

        // --- Step 4: Badge Module ---
        const badgeTopicInput = await screen.findByLabelText(
            'contest_manager_course_details.badge_topic_label'
        );
        fireEvent.change(badgeTopicInput, { target: { value: 'Burgers' } });

        // Prompt should incorporate topic 'Burgers'
        expect(await screen.findByText(/Burgers/)).toBeDefined();

        // Copy AI prompt
        const copyPromptBtn = await screen.findByLabelText(
            'Copy AI badge prompt'
        );
        fireEvent.click(copyPromptBtn);
        expect(mockWriteText).toHaveBeenCalled();

        // Click the sidebar button to transition to Contact step
        const contactStepBtn = screen
            .getAllByRole('button')
            .find((btn) => btn.textContent?.includes('contact_admin'));
        expect(contactStepBtn).toBeDefined();
        fireEvent.click(contactStepBtn!);
        expect(
            await screen.findByText(
                'contest_manager_course_details.contact_title'
            )
        ).toBeDefined();

        // --- Step 5: Contact Module ---
        // Click the sidebar button to transition to Quiz/Test step
        const testStepBtn = screen
            .getAllByRole('button')
            .find((btn) => btn.textContent?.includes('final_test'));
        expect(testStepBtn).toBeDefined();
        fireEvent.click(testStepBtn!);
        expect(
            await screen.findByText(
                'contest_manager_course_details.final_test_description'
            )
        ).toBeDefined();
    });
});
