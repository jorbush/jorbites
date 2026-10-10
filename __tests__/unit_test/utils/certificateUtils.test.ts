import { describe, it, expect } from 'vitest';
import {
    generateSecureCertId,
    toSafeCertificate,
    PUBLIC_CERTIFICATE_USER_SELECT_FIELDS,
} from '@/app/utils/certificateUtils';

describe('certificateUtils', () => {
    it('defines minimized user select fields', () => {
        expect(PUBLIC_CERTIFICATE_USER_SELECT_FIELDS).toEqual({
            id: true,
            name: true,
            image: true,
        });
    });

    it('generateSecureCertId produces correctly formatted, unique IDs', () => {
        const id1 = generateSecureCertId();
        const id2 = generateSecureCertId();
        const currentYear = new Date().getFullYear();

        expect(id1).toMatch(new RegExp(`^JRBT-${currentYear}-[0-9A-F]{8}$`));
        expect(id2).toMatch(new RegExp(`^JRBT-${currentYear}-[0-9A-F]{8}$`));
        expect(id1).not.toBe(id2);
    });

    it('toSafeCertificate converts dates to ISO strings and formats public user profile', () => {
        const rawCert = {
            id: 'c1',
            certId: 'JRBT-2026-ABCDEF12',
            userId: 'u1',
            courseId: 'jorbites-basics',
            courseTitle: 'Jorbites Basics',
            userName: 'Test User',
            badgeUrl: '/badges/basics.webp',
            issuedAt: new Date('2026-06-01T10:00:00.000Z'),
            createdAt: new Date('2026-06-01T10:00:00.000Z'),
            updatedAt: new Date('2026-06-01T10:00:00.000Z'),
            user: {
                id: 'u1',
                name: 'Test User',
                image: '/avatar.png',
                email: 'secret@email.com',
                level: 99,
            },
        };

        const safe = toSafeCertificate(rawCert);

        expect(safe.issuedAt).toBe('2026-06-01T10:00:00.000Z');
        expect(safe.createdAt).toBe('2026-06-01T10:00:00.000Z');
        expect(safe.updatedAt).toBe('2026-06-01T10:00:00.000Z');
        expect(safe.user).toEqual({
            id: 'u1',
            name: 'Test User',
            image: '/avatar.png',
        });
        expect((safe.user as any).email).toBeUndefined();
        expect((safe.user as any).level).toBeUndefined();
    });

    it('toSafeCertificate handles cert without user and handles string dates gracefully', () => {
        const rawCert = {
            id: 'c2',
            certId: 'JRBT-2026-ABCDEF34',
            userId: 'u2',
            courseId: 'quests',
            courseTitle: 'Recipe Quests',
            userName: 'Solo User',
            issuedAt: '2026-07-01T00:00:00.000Z',
            createdAt: '2026-07-01T00:00:00.000Z',
            updatedAt: '2026-07-01T00:00:00.000Z',
            user: null,
        };

        const safe = toSafeCertificate(rawCert);

        expect(safe.issuedAt).toBe('2026-07-01T00:00:00.000Z');
        expect(safe.user).toBeUndefined();
    });
});
