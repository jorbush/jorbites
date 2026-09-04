import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { getVapidEmail, STEPS, STEPS_LENGTH } from '@/app/utils/constants';

describe('STEPS and STEPS_LENGTH', () => {
    it('STEPS_LENGTH should evaluate to exactly 7 and match distinct wizard steps', () => {
        expect(STEPS_LENGTH).toBe(7);
        expect(STEPS.CATEGORY).toBe(0);
        expect(STEPS.DESCRIPTION).toBe(1);
        expect(STEPS.INGREDIENTS).toBe(2);
        expect(STEPS.METHODS).toBe(3);
        expect(STEPS.STEPS).toBe(4);
        expect(STEPS.RELATED_CONTENT).toBe(5);
        expect(STEPS.IMAGES).toBe(6);
    });
});

describe('VAPID Contact Email Resolution', () => {
    let originalVapidEmail: string | undefined;

    beforeEach(() => {
        originalVapidEmail = process.env.VAPID_EMAIL;
    });

    afterEach(() => {
        if (originalVapidEmail === undefined) {
            delete process.env.VAPID_EMAIL;
        } else {
            process.env.VAPID_EMAIL = originalVapidEmail;
        }
    });

    it('should fallback to default jorbites.app@gmail.com with mailto prefix when VAPID_EMAIL is not set', () => {
        delete process.env.VAPID_EMAIL;
        expect(getVapidEmail()).toBe('mailto:jorbites.app@gmail.com');
    });

    it('should prepend mailto: when VAPID_EMAIL is set to a raw email address without mailto prefix', () => {
        process.env.VAPID_EMAIL = 'test-contact@example.com';
        expect(getVapidEmail()).toBe('mailto:test-contact@example.com');
    });

    it('should retain mailto: prefix when VAPID_EMAIL already starts with mailto:', () => {
        process.env.VAPID_EMAIL = 'mailto:another-contact@example.com';
        expect(getVapidEmail()).toBe('mailto:another-contact@example.com');
    });

    it('should retain website URLs starting with http or https as is', () => {
        process.env.VAPID_EMAIL = 'https://example.com/contact';
        expect(getVapidEmail()).toBe('https://example.com/contact');

        process.env.VAPID_EMAIL = 'http://example.com/contact';
        expect(getVapidEmail()).toBe('http://example.com/contact');
    });
});
