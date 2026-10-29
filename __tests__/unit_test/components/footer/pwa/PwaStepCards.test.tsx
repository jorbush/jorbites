import React from 'react';
import { render, screen, cleanup } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import PwaStepCards from '@/app/components/footer/pwa/PwaStepCards';
import { FiShare, FiPlusSquare, FiCheckCircle } from 'react-icons/fi';
import { PwaStep } from '@/app/components/footer/pwa/types';

describe('PwaStepCards', () => {
    const mockSteps: PwaStep[] = [
        {
            number: 1,
            icon: FiShare,
            title: 'Share Tap',
            desc: 'Tap share in toolbar',
        },
        {
            number: 2,
            icon: FiPlusSquare,
            title: 'Add to Home',
            desc: 'Select Add to Home Screen',
        },
        {
            number: 3,
            icon: FiCheckCircle,
            title: 'Confirm',
            desc: 'Tap Add to confirm',
        },
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        cleanup();
    });

    it('renders the tabpanel with proper attributes and all steps', () => {
        render(
            <PwaStepCards
                platform="ios"
                steps={mockSteps}
            />
        );

        const container = screen.getByTestId('pwa-steps-container');
        expect(container).toBeDefined();
        expect(container.getAttribute('role')).toBe('tabpanel');
        expect(container.getAttribute('id')).toBe('pwa-panel-ios');

        expect(screen.getByText('Share Tap')).toBeDefined();
        expect(screen.getByText('Tap share in toolbar')).toBeDefined();
        expect(screen.getByText('Add to Home')).toBeDefined();
        expect(screen.getByText('Select Add to Home Screen')).toBeDefined();
        expect(screen.getByText('Confirm')).toBeDefined();
        expect(screen.getByText('Tap Add to confirm')).toBeDefined();

        expect(screen.getByText('1')).toBeDefined();
        expect(screen.getByText('2')).toBeDefined();
        expect(screen.getByText('3')).toBeDefined();
    });
});
