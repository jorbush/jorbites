import { renderHook, act } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { useContestManagerForm } from '@/app/hooks/useContestManagerForm';

describe('useContestManagerForm', () => {
    it('should initialize with default state', () => {
        const { result } = renderHook(() => useContestManagerForm());

        expect(result.current.activeModuleId).toBe('requirements');
        expect(result.current.reqs.recipes).toBe(false);
        expect(result.current.badgeXTopic).toBe('Italian Pasta');
    });

    it('should update activeModuleId', () => {
        const { result } = renderHook(() => useContestManagerForm());

        act(() => {
            result.current.setActiveModuleId('voting');
        });

        expect(result.current.activeModuleId).toBe('voting');
    });

    it('should update reqs partialy', () => {
        const { result } = renderHook(() => useContestManagerForm());

        act(() => {
            result.current.setReqs({ recipes: true });
        });

        expect(result.current.reqs.recipes).toBe(true);
        expect(result.current.reqs.theme).toBe(false);

        act(() => {
            result.current.setReqs({ theme: true });
        });

        expect(result.current.reqs.recipes).toBe(true);
        expect(result.current.reqs.theme).toBe(true);
    });

    it('should update participant info', () => {
        const { result } = renderHook(() => useContestManagerForm());

        act(() => {
            result.current.setParticipantUserId('user123');
            result.current.setParticipantRecipeUrl('http://recipe.com');
        });

        expect(result.current.participantUserId).toBe('user123');
        expect(result.current.participantRecipeUrl).toBe('http://recipe.com');
    });

    it('should update badge topic', () => {
        const { result } = renderHook(() => useContestManagerForm());

        act(() => {
            result.current.setBadgeXTopic('Mexican Tacos');
        });

        expect(result.current.badgeXTopic).toBe('Mexican Tacos');
    });

    it('should update copiedBadgePrompt state', () => {
        const { result } = renderHook(() => useContestManagerForm());

        act(() => {
            result.current.setCopiedBadgePrompt(true);
        });

        expect(result.current.copiedBadgePrompt).toBe(true);
    });
});
