import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useRecipeTranslation } from '@/app/hooks/useRecipeTranslation';
import { toast } from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
    toast: {
        error: vi.fn(),
        success: vi.fn(),
    },
}));

vi.mock('@/app/i18n', () => ({
    default: {
        language: 'es',
        resolvedLanguage: 'es',
    },
}));

vi.mock('react-i18next', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react-i18next')>();
    return {
        ...actual,
        useTranslation: () => ({
            t: (key: string) => key,
        }),
    };
});

describe('useRecipeTranslation', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        delete (window as any).Translator;
        delete (window as any).LanguageDetector;
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('returns original content and false showTranslateButton when translator API is unavailable', () => {
        const { result } = renderHook(() =>
            useRecipeTranslation({
                description: 'Delicious chocolate cake recipe.',
                descriptionText: 'Delicious chocolate cake recipe.',
                ingredientsText: ['Flour', 'Sugar', 'Cocoa'],
                stepsText: ['Mix ingredients', 'Bake at 180C'],
            })
        );

        expect(result.current.isTranslated).toBe(false);
        expect(result.current.isTranslating).toBe(false);
        expect(result.current.showTranslateButton).toBe(false);
        expect(result.current.displayDescription).toBe(
            'Delicious chocolate cake recipe.'
        );
        expect(result.current.displayIngredients).toEqual([
            'Flour',
            'Sugar',
            'Cocoa',
        ]);
        expect(result.current.displaySteps).toEqual([
            'Mix ingredients',
            'Bake at 180C',
        ]);
        expect(result.current.displayGanttTable).toBeNull();
    });

    it('detects language and shows translate button when API is available', async () => {
        const mockDetect = vi
            .fn()
            .mockResolvedValue([{ detectedLanguage: 'en', confidence: 0.9 }]);

        (window as any).LanguageDetector = {
            create: vi.fn().mockResolvedValue({
                detect: mockDetect,
            }),
        };

        (window as any).Translator = {
            availability: vi.fn().mockResolvedValue('available'),
            create: vi.fn(),
        };

        const { result } = renderHook(() =>
            useRecipeTranslation({
                description: 'Delicious chocolate cake recipe with rich cream.',
                descriptionText:
                    'Delicious chocolate cake recipe with rich cream.',
                ingredientsText: ['Flour', 'Sugar'],
            })
        );

        await act(async () => {
            await Promise.resolve();
        });

        expect(mockDetect).toHaveBeenCalledWith(
            'Delicious chocolate cake recipe with rich cream.'
        );
        expect(result.current.showTranslateButton).toBe(true);
    });

    it('translates description, ingredients, steps, and gantt table on handleTranslate', async () => {
        const mockTranslate = vi.fn((text: string) =>
            Promise.resolve(`[ES] ${text}`)
        );

        (window as any).LanguageDetector = {
            create: vi.fn().mockResolvedValue({
                detect: vi
                    .fn()
                    .mockResolvedValue([
                        { detectedLanguage: 'en', confidence: 0.9 },
                    ]),
            }),
        };

        (window as any).Translator = {
            availability: vi.fn().mockResolvedValue('available'),
            create: vi.fn().mockResolvedValue({
                translate: mockTranslate,
            }),
        };

        const gantt = {
            id: 'gantt-1',
            recipeId: 'rec-1',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            preSteps: ['Preheat oven'],
            rows: [{ ingredient: 'Butter' }],
            columns: [{ action: 'Melt' }],
        };

        const { result } = renderHook(() =>
            useRecipeTranslation({
                description: 'Original description text here.',
                descriptionText: 'Original description text here.',
                ingredientsText: ['Eggs', 'Flour'],
                stepsText: ['Mix well', 'Bake it'],
                ganttTable: gantt as any,
            })
        );

        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            await result.current.handleTranslate();
        });

        expect(result.current.isTranslated).toBe(true);
        expect(result.current.isTranslating).toBe(false);
        expect(result.current.displayDescription).toBe(
            '[ES] Original description text here.'
        );
        expect(result.current.displayIngredients).toEqual([
            '[ES] Eggs',
            '[ES] Flour',
        ]);
        expect(result.current.displaySteps).toEqual([
            '[ES] Mix well',
            '[ES] Bake it',
        ]);
        expect(result.current.displayGanttTable?.preSteps).toEqual([
            '[ES] Preheat oven',
        ]);
        expect(result.current.displayGanttTable?.rows?.[0].ingredient).toBe(
            '[ES] Butter'
        );
        expect(result.current.displayGanttTable?.columns?.[0].action).toBe(
            '[ES] Melt'
        );

        // Test handleShowOriginal
        act(() => {
            result.current.handleShowOriginal();
        });

        expect(result.current.isTranslated).toBe(false);
        expect(result.current.displayDescription).toBe(
            'Original description text here.'
        );
        expect(result.current.displayIngredients).toEqual(['Eggs', 'Flour']);
    });

    it('handles translation error gracefully and displays a toast message', async () => {
        (window as any).LanguageDetector = {
            create: vi.fn().mockResolvedValue({
                detect: vi
                    .fn()
                    .mockResolvedValue([
                        { detectedLanguage: 'en', confidence: 0.9 },
                    ]),
            }),
        };

        (window as any).Translator = {
            availability: vi.fn().mockResolvedValue('available'),
            create: vi.fn().mockRejectedValue(new Error('Translator error')),
        };

        const { result } = renderHook(() =>
            useRecipeTranslation({
                description: 'Original description text here.',
                descriptionText: 'Original description text here.',
            })
        );

        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            await result.current.handleTranslate();
        });

        expect(result.current.isTranslated).toBe(false);
        expect(result.current.isTranslating).toBe(false);
        expect(toast.error).toHaveBeenCalledWith('translation_failed');
    });

    it('resets translation when contentKey changes', async () => {
        const mockTranslate = vi.fn((text: string) =>
            Promise.resolve(`[ES] ${text}`)
        );

        (window as any).LanguageDetector = {
            create: vi.fn().mockResolvedValue({
                detect: vi
                    .fn()
                    .mockResolvedValue([
                        { detectedLanguage: 'en', confidence: 0.9 },
                    ]),
            }),
        };

        (window as any).Translator = {
            availability: vi.fn().mockResolvedValue('available'),
            create: vi.fn().mockResolvedValue({
                translate: mockTranslate,
            }),
        };

        let desc = 'First recipe description that is long enough.';
        const { result, rerender } = renderHook(() =>
            useRecipeTranslation({
                description: desc,
                descriptionText: desc,
            })
        );

        await act(async () => {
            await Promise.resolve();
        });

        await act(async () => {
            await result.current.handleTranslate();
        });

        expect(result.current.isTranslated).toBe(true);

        // Change description and re-render wrapped in act
        desc = 'Second recipe description updated completely.';
        act(() => {
            rerender();
        });

        expect(result.current.isTranslated).toBe(false);
        expect(result.current.displayDescription).toBe(
            'Second recipe description updated completely.'
        );
    });
});
