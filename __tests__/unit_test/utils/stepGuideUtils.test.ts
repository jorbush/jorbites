import { describe, it, expect } from 'vitest';
import {
    detectStepAction,
    extractStepTimers,
    formatTimerDisplay,
} from '@/app/utils/stepGuideUtils';

describe('stepGuideUtils', () => {
    describe('detectStepAction', () => {
        it('detects baking actions in English, Spanish, and Catalan', () => {
            expect(detectStepAction('Preheat oven to 180°C and bake')).toBe(
                'bake'
            );
            expect(detectStepAction('Hornear durante 20 minutos')).toBe('bake');
            expect(detectStepAction('Preescalfar el forn a 200 graus')).toBe(
                'bake'
            );
        });

        it('detects boiling and simmering actions', () => {
            expect(detectStepAction('Bring water to a boil and simmer')).toBe(
                'boil'
            );
            expect(detectStepAction('Hervir a fuego lento')).toBe('boil');
            expect(detectStepAction('Bullir la pasta en aigua')).toBe('boil');
        });

        it('detects heat/sauté actions', () => {
            expect(detectStepAction('Sauté onions in a hot pan')).toBe('heat');
            expect(detectStepAction('Saltear en la sartén')).toBe('heat');
        });

        it('detects chopping and prep actions', () => {
            expect(detectStepAction('Finely chop the garlic and slice')).toBe(
                'chop'
            );
            expect(detectStepAction('Cortar y picar la cebolla')).toBe('chop');
        });

        it('detects mixing and whisking actions', () => {
            expect(detectStepAction('Whisk eggs and fold in flour')).toBe(
                'mix'
            );
            expect(detectStepAction('Mezclar y batir bien')).toBe('mix');
        });

        it('detects chilling and resting actions', () => {
            expect(detectStepAction('Chill in the fridge for 2 hours')).toBe(
                'chill'
            );
            expect(detectStepAction('Dejar reposar en la nevera')).toBe(
                'chill'
            );
        });

        it('detects plating and serving actions', () => {
            expect(detectStepAction('Garnish with parsley and serve')).toBe(
                'plate'
            );
            expect(detectStepAction('Emplatar y servir caliente')).toBe(
                'plate'
            );
        });

        it('falls back to general when no specific verb is matched', () => {
            expect(detectStepAction('Check the seasoning carefully')).toBe(
                'general'
            );
            expect(detectStepAction('')).toBe('general');
        });
    });

    describe('extractStepTimers', () => {
        it('extracts minutes, seconds, and hours across EN, ES, CA', () => {
            const presets = extractStepTimers(
                'Bake for 25 minutes, then rest for 30 seconds'
            );
            expect(presets).toHaveLength(2);
            expect(presets[0]).toMatchObject({
                label: '25 min',
                seconds: 1500,
            });
            expect(presets[1]).toMatchObject({
                label: '30 s',
                seconds: 30,
            });
        });

        it('extracts time ranges and uses upper bound for countdown', () => {
            const presets = extractStepTimers('Simmer for 5-10 min until soft');
            expect(presets).toHaveLength(1);
            expect(presets[0]).toMatchObject({
                label: '5-10 min',
                seconds: 600,
            });
        });

        it('extracts Spanish and Catalan durations', () => {
            const esPresets = extractStepTimers(
                'Hornear durante 15 minutos y reposar 1 hora'
            );
            expect(esPresets).toHaveLength(2);
            expect(esPresets[0].seconds).toBe(900);
            expect(esPresets[1].seconds).toBe(3600);

            const caPresets = extractStepTimers('Coure durant 12 minuts');
            expect(caPresets).toHaveLength(1);
            expect(caPresets[0].seconds).toBe(720);
        });

        it('returns empty array when no durations are present', () => {
            expect(extractStepTimers('Mix flour and salt together')).toEqual(
                []
            );
            expect(extractStepTimers('')).toEqual([]);
        });
    });

    describe('formatTimerDisplay', () => {
        it('formats minutes and seconds as MM:SS', () => {
            expect(formatTimerDisplay(0)).toBe('00:00');
            expect(formatTimerDisplay(65)).toBe('01:05');
            expect(formatTimerDisplay(1500)).toBe('25:00');
        });

        it('formats hours as H:MM:SS', () => {
            expect(formatTimerDisplay(3661)).toBe('1:01:01');
        });
    });
});
