import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import DraftCard from '@/app/components/drafts/DraftCard';
import { DraftSummary } from '@/app/types/draft';

describe('DraftCard', () => {
    const mockDraft: DraftSummary = {
        draftId: 'draft-123',
        type: 'solo',
        title: 'Authentic Carbonara',
        categories: ['pasta'],
        ingredients: ['Pancetta', 'Eggs', 'Pecorino'],
        steps: ['Fry pancetta', 'Mix eggs'],
        ownerId: 'user-1',
        coCooksIds: [],
        updatedAt: new Date().toISOString(),
    };

    it('renders draft title, solo badge, and progress', () => {
        const onOpen = vi.fn();
        const onDelete = vi.fn();
        const onDuplicate = vi.fn();

        render(
            <DraftCard
                draft={mockDraft}
                onOpen={onOpen}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />
        );

        expect(screen.getByTestId('draft-card-title').textContent).toBe(
            'Authentic Carbonara'
        );
        expect(screen.getByText('solo_draft')).toBeInTheDocument();
        expect(screen.getByTestId('draft-card-progress')).toBeInTheDocument();
        expect(screen.getByTestId('draft-card-ttl')).toBeInTheDocument();
    });

    it('renders shared badge and co-cook avatars for shared drafts', () => {
        const sharedDraft: DraftSummary = {
            ...mockDraft,
            type: 'shared',
            coCooksIds: ['alice', 'bob'],
        };

        render(
            <DraftCard
                draft={sharedDraft}
                onOpen={vi.fn()}
                onDelete={vi.fn()}
                onDuplicate={vi.fn()}
            />
        );

        expect(screen.getByText('shared_draft')).toBeInTheDocument();
        expect(screen.getByText('A')).toBeInTheDocument(); // Initial of alice
        expect(screen.getByText('B')).toBeInTheDocument(); // Initial of bob
    });

    it('triggers onOpen when the card is clicked', () => {
        const onOpen = vi.fn();
        const onDelete = vi.fn();
        const onDuplicate = vi.fn();

        render(
            <DraftCard
                draft={mockDraft}
                onOpen={onOpen}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />
        );

        fireEvent.click(screen.getByTestId('draft-card-title'));
        expect(onOpen).toHaveBeenCalledWith('draft-123');
        expect(onDelete).not.toHaveBeenCalled();
        expect(onDuplicate).not.toHaveBeenCalled();
    });

    it('triggers onDelete without firing onOpen when delete icon is clicked', () => {
        const onOpen = vi.fn();
        const onDelete = vi.fn();
        const onDuplicate = vi.fn();

        render(
            <DraftCard
                draft={mockDraft}
                onOpen={onOpen}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />
        );

        fireEvent.click(screen.getByTestId('draft-card-delete'));
        expect(onDelete).toHaveBeenCalledWith('draft-123');
        expect(onOpen).not.toHaveBeenCalled();
    });

    it('triggers onDuplicate without firing onOpen when duplicate icon is clicked', () => {
        const onOpen = vi.fn();
        const onDelete = vi.fn();
        const onDuplicate = vi.fn();

        render(
            <DraftCard
                draft={mockDraft}
                onOpen={onOpen}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
            />
        );

        fireEvent.click(screen.getByTestId('draft-card-duplicate'));
        expect(onDuplicate).toHaveBeenCalledWith('draft-123');
        expect(onOpen).not.toHaveBeenCalled();
    });

    it('triggers onShare without firing onOpen when share icon is clicked', () => {
        const onOpen = vi.fn();
        const onDelete = vi.fn();
        const onDuplicate = vi.fn();
        const onShare = vi.fn();

        render(
            <DraftCard
                draft={mockDraft}
                onOpen={onOpen}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onShare={onShare}
            />
        );

        fireEvent.click(screen.getByTestId('draft-card-share'));
        expect(onShare).toHaveBeenCalledWith('draft-123');
        expect(onOpen).not.toHaveBeenCalled();
    });

    it('safely handles missing or undefined updatedAt without displaying NaN', () => {
        const draftWithoutDate: DraftSummary = {
            ...mockDraft,
            updatedAt: undefined as any,
        };

        render(
            <DraftCard
                draft={draftWithoutDate}
                onOpen={vi.fn()}
                onDelete={vi.fn()}
                onDuplicate={vi.fn()}
            />
        );

        expect(screen.getByText('draft_just_now')).toBeInTheDocument();
        expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    });

    it('safely handles malformed updatedAt strings without displaying NaN', () => {
        const draftWithMalformedDate: DraftSummary = {
            ...mockDraft,
            updatedAt: 'not-a-valid-date-format',
        };

        render(
            <DraftCard
                draft={draftWithMalformedDate}
                onOpen={vi.fn()}
                onDelete={vi.fn()}
                onDuplicate={vi.fn()}
            />
        );

        expect(screen.getByText('draft_just_now')).toBeInTheDocument();
        expect(screen.queryByText(/NaN/)).not.toBeInTheDocument();
    });
});
