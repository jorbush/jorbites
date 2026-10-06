import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest';
import DraftsCourseClient from '@/app/courses/drafts/DraftsCourseClient';
import React from 'react';

// Mock canvas-confetti
vi.mock('canvas-confetti', () => ({
    default: vi.fn(),
}));

// Mock react-i18next
vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string) => key,
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

// Mock CertificateGenerator
vi.mock('@/app/components/courses/certificate/CertificateGenerator', () => ({
    default: (props: any) => (
        <div data-testid="mock-cert-generator">
            MockedCertGenerator: {props.courseTitle}
        </div>
    ),
}));

// Mock navigator.clipboard.writeText
const mockWriteText = vi.fn().mockResolvedValue(undefined);

describe('DraftsCourseClient', () => {
    beforeEach(() => {
        localStorage.clear();
        vi.clearAllMocks();
        vi.stubGlobal('navigator', {
            ...navigator,
            clipboard: {
                writeText: mockWriteText,
            },
        });
    });

    afterEach(() => {
        cleanup();
        localStorage.clear();
        vi.unstubAllGlobals();
    });

    it('renders the course layout and initial overview step', () => {
        render(<DraftsCourseClient currentUser={null} />);

        // Header & description
        expect(screen.getByText('course_drafts')).toBeDefined();
        expect(screen.getByText('course_drafts_desc')).toBeDefined();

        // 7 Steps exist in navigation
        expect(screen.getAllByText('requirements').length).toBeGreaterThan(0);
        expect(screen.getAllByText('workflow').length).toBeGreaterThan(0);
        expect(
            screen.getAllByText('drafts_course_details.step_invites').length
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText('drafts_course_details.step_roles').length
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText('drafts_course_details.step_locking').length
        ).toBeGreaterThan(0);
        expect(
            screen.getAllByText('drafts_course_details.step_sync').length
        ).toBeGreaterThan(0);
        expect(screen.getAllByText('final_test').length).toBeGreaterThan(0);

        // Requirements checklist initially rendered
        expect(
            screen.getByText('drafts_course_details.requirements_title')
        ).toBeDefined();
    });

    it('progresses sequentially through modules and interactive simulators', async () => {
        render(<DraftsCourseClient currentUser={null} />);

        // 1. Requirements Module -> Check all 4 boxes
        const checkSolo = screen.getByLabelText(
            'drafts_course_details.checklist_solo'
        );
        const checkRetention = screen.getByLabelText(
            'drafts_course_details.checklist_retention'
        );
        const checkCoCooks = screen.getByLabelText(
            'drafts_course_details.checklist_cocooks'
        );
        const checkNavigation = screen.getByLabelText(
            'drafts_course_details.checklist_navigation'
        );

        fireEvent.click(checkSolo);
        fireEvent.click(checkRetention);
        fireEvent.click(checkCoCooks);
        fireEvent.click(checkNavigation);

        // Next button is now enabled
        const nextBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.next_step',
        });
        fireEvent.click(nextBtn);

        // 2. Workflow Timeline Step
        expect(
            await screen.findByText('drafts_course_details.workflow_title')
        ).toBeDefined();

        // Advance through 5 steps of the timeline
        for (let i = 1; i <= 4; i++) {
            const workflowNextBtn = screen.getByRole('button', {
                name: 'contest_manager_course_details.next_step',
            });
            fireEvent.click(workflowNextBtn);
            expect(
                await screen.findByText(new RegExp(`\\(${i + 1}/5\\)`))
            ).toBeDefined();
        }

        // Complete workflow step
        const workflowCompleteBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.mark_completed',
        });
        fireEvent.click(workflowCompleteBtn);

        // 3. Inviting Friends & Co-Cooks Module (with DraftQuotaSimulator)
        expect(
            await screen.findByText('drafts_course_details.invites_title')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.simulator_title')
        ).toBeDefined();

        // Interact with DraftQuotaSimulator (Add draft, copy link)
        const addDraftBtn = screen.getByText(
            'drafts_course_details.add_draft_btn'
        );
        fireEvent.click(addDraftBtn);

        const copyLinkBtn = screen.getByText(
            'drafts_course_details.copy_link_btn'
        );
        fireEvent.click(copyLinkBtn);
        expect(mockWriteText).toHaveBeenCalled();

        // Complete invites module
        const completeInvitesBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.mark_completed',
        });
        fireEvent.click(completeInvitesBtn);

        // 4. Chef Roles: Editor vs Viewer Module (with RolePermissionSimulator)
        expect(
            await screen.findByText('drafts_course_details.roles_title')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.roles_simulator_title')
        ).toBeDefined();

        // Switch to Viewer role
        const viewerRoleBtn = screen.getByRole('button', {
            name: 'drafts_course_details.role_viewer',
        });
        fireEvent.click(viewerRoleBtn);

        // Viewer banner appears
        expect(
            screen.getAllByText('drafts_course_details.viewer_banner_text')
                .length
        ).toBeGreaterThan(0);

        // Complete roles module
        const completeRolesBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.mark_completed',
        });
        fireEvent.click(completeRolesBtn);

        // 5. Live Co-Cooking & Step Locking Module (with LockSimulator)
        expect(
            await screen.findByText('drafts_course_details.locking_title')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.lock_simulator_title')
        ).toBeDefined();

        // Toggle lock release
        const toggleLockBtn = screen.getByRole('button', {
            name: 'drafts_course_details.release_lock_btn',
        });
        fireEvent.click(toggleLockBtn);

        // Complete locking module
        const completeLockingBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.mark_completed',
        });
        fireEvent.click(completeLockingBtn);

        // 6. Live Updates & Publishing Together (Sync)
        expect(
            await screen.findByText('drafts_course_details.sync_title')
        ).toBeDefined();

        // Complete sync module
        const completeSyncBtn = screen.getByRole('button', {
            name: 'contest_manager_course_details.mark_completed',
        });
        fireEvent.click(completeSyncBtn);

        // 7. Final Exam & Certification
        expect(
            await screen.findByText(
                'drafts_course_details.final_test_description'
            )
        ).toBeDefined();
    });

    it('renders certificate when the test module is completed', () => {
        localStorage.setItem(
            'jorbites_course_drafts_modules:v2',
            JSON.stringify({
                requirements: true,
                workflow: true,
                invites: true,
                roles: true,
                locking: true,
                sync: true,
                test: true,
            })
        );

        render(
            <DraftsCourseClient currentUser={{ name: 'Chef Alex' } as any} />
        );

        // Click final test step in navigation
        const testNavBtn = screen.getAllByText('final_test')[0];
        fireEvent.click(testNavBtn);

        expect(
            screen.getByText(
                /MockedCertGenerator: drafts_course_details.certificate_title/
            )
        ).toBeDefined();
    });

    it('navigates directly to invites step when prior modules are completed', async () => {
        localStorage.setItem(
            'jorbites_course_drafts_modules:v2',
            JSON.stringify({
                requirements: true,
                workflow: true,
            })
        );

        render(<DraftsCourseClient currentUser={null} />);

        const invitesNavBtn = screen.getAllByText(
            'drafts_course_details.step_invites'
        )[0];
        fireEvent.click(invitesNavBtn);

        expect(
            await screen.findByText('drafts_course_details.invites_title')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.simulator_title')
        ).toBeDefined();
    });

    it('navigates directly to roles step when prior modules are completed', async () => {
        localStorage.setItem(
            'jorbites_course_drafts_modules:v2',
            JSON.stringify({
                requirements: true,
                workflow: true,
                invites: true,
            })
        );

        render(<DraftsCourseClient currentUser={null} />);

        const rolesNavBtn = screen.getAllByText(
            'drafts_course_details.step_roles'
        )[0];
        fireEvent.click(rolesNavBtn);

        expect(
            await screen.findByText('drafts_course_details.roles_title')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.roles_simulator_title')
        ).toBeDefined();
    });

    it('navigates directly to locking step when prior modules are completed', async () => {
        localStorage.setItem(
            'jorbites_course_drafts_modules:v2',
            JSON.stringify({
                requirements: true,
                workflow: true,
                invites: true,
                roles: true,
            })
        );

        render(<DraftsCourseClient currentUser={null} />);

        const lockingNavBtn = screen.getAllByText(
            'drafts_course_details.step_locking'
        )[0];
        fireEvent.click(lockingNavBtn);

        expect(
            await screen.findByText('drafts_course_details.locking_title')
        ).toBeDefined();
        expect(
            screen.getByText('drafts_course_details.lock_simulator_title')
        ).toBeDefined();
    });
});
