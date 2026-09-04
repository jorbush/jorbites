import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import DraftTTLBadge from '@/app/components/drafts/DraftTTLBadge';
import { formatTTLText } from '@/app/lib/draftMetadata';
import { DraftTTLInfo } from '@/app/types/draft';

describe('DraftTTLBadge and formatTTLText', () => {
    describe('formatTTLText formatting', () => {
        it('formats expiration in English properly with count', () => {
            const t = (key: string, options?: any) => {
                if (key === 'draft_time_days') return `${options.count} days`;
                if (key === 'draft_expires_in')
                    return `Expires in ${options.time}`;
                if (key === 'draft_expired') return 'Expired';
                return key;
            };

            const info: DraftTTLInfo = {
                label: 'Expires in 5 days',
                isExpiringSoon: false,
                remainingSeconds: 432000,
                key: 'draft_time_days',
                count: 5,
            };

            expect(formatTTLText(info, t)).toBe('Expires in 5 days');
        });

        it('formats expiration in Spanish properly', () => {
            const t = (key: string, options?: any) => {
                if (key === 'draft_time_weeks')
                    return `${options.count} semanas`;
                if (key === 'draft_expires_in')
                    return `Expira en ${options.time}`;
                if (key === 'draft_expired') return 'Expirado';
                return key;
            };

            const info: DraftTTLInfo = {
                label: 'Expires in 50 weeks',
                isExpiringSoon: false,
                remainingSeconds: 30000000,
                key: 'draft_time_weeks',
                count: 50,
            };

            expect(formatTTLText(info, t)).toBe('Expira en 50 semanas');
        });

        it('formats Expired in Catalan properly', () => {
            const t = (key: string) => {
                if (key === 'draft_expired') return 'Expirat';
                return key;
            };

            const info: DraftTTLInfo = {
                label: 'Expired',
                isExpiringSoon: true,
                remainingSeconds: 0,
                key: 'draft_expired',
            };

            expect(formatTTLText(info, t)).toBe('Expirat');
        });
    });

    describe('DraftTTLBadge rendering', () => {
        it('renders normal safe TTL styling in green', () => {
            const mockTTLInfo: DraftTTLInfo = {
                label: 'Expires in 5 days',
                isExpiringSoon: false,
                remainingSeconds: 432000,
            };

            render(<DraftTTLBadge ttlInfo={mockTTLInfo} />);

            const badge = screen.getByTestId('draft-ttl-badge');
            expect(badge).toBeInTheDocument();
            expect(badge.className).toContain('text-green-600');
            expect(badge.className).toContain('bg-green-50');
        });

        it('renders expiring soon warning styling in amber', () => {
            const mockTTLInfo: DraftTTLInfo = {
                label: 'Expires in 12 hours',
                isExpiringSoon: true,
                remainingSeconds: 43200,
            };

            render(<DraftTTLBadge ttlInfo={mockTTLInfo} />);

            const badge = screen.getByTestId('draft-ttl-badge');
            expect(badge).toBeInTheDocument();
            expect(badge.className).toContain('text-amber-600');
            expect(badge.className).toContain('bg-amber-50');
        });

        it('renders Expired badge in amber', () => {
            const mockTTLInfo: DraftTTLInfo = {
                label: 'Expired',
                isExpiringSoon: true,
                remainingSeconds: 0,
            };

            render(<DraftTTLBadge ttlInfo={mockTTLInfo} />);

            const badge = screen.getByTestId('draft-ttl-badge');
            expect(badge).toBeInTheDocument();
            expect(badge.className).toContain('text-amber-600');
        });
    });
});
