import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import DraftsCoursePage, { metadata } from '@/app/courses/drafts/page';
import getCurrentUser from '@/app/actions/getCurrentUser';

vi.mock('@/app/actions/getCurrentUser');
vi.mock('@/app/courses/drafts/DraftsCourseClient', () => ({
    default: ({ currentUser }: { currentUser: any }) => (
        <div data-testid="drafts-course-client">
            Drafts Client for {currentUser ? currentUser.name : 'Guest'}
        </div>
    ),
}));

describe('DraftsCoursePage', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('exports metadata correctly', () => {
        expect(metadata.title).toBe(
            'Recipe Drafts & Collaboration Course | Jorbites'
        );
        expect(metadata.description).toBeDefined();
    });

    it('fetches current user and passes it to DraftsCourseClient', async () => {
        const mockUser = {
            id: 'u1',
            name: 'Chef Jordi',
            email: 'jordi@example.com',
        };
        vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any);

        const page = await DraftsCoursePage();
        render(page);

        expect(getCurrentUser).toHaveBeenCalledTimes(1);
        expect(screen.getByTestId('drafts-course-client')).toHaveTextContent(
            'Drafts Client for Chef Jordi'
        );
    });

    it('renders with null user when not authenticated', async () => {
        vi.mocked(getCurrentUser).mockResolvedValue(null);

        const page = await DraftsCoursePage();
        render(page);

        expect(screen.getByTestId('drafts-course-client')).toHaveTextContent(
            'Drafts Client for Guest'
        );
    });
});
