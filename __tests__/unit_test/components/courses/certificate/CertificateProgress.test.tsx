import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import CertificateProgress from '@/app/components/courses/certificate/CertificateProgress';
import React from 'react';

describe('<CertificateProgress />', () => {
    it('renders the progress label and percentage text', () => {
        render(<CertificateProgress progress={45} />);

        expect(screen.getByText('Progress')).toBeDefined();
        expect(screen.getByText('45%')).toBeDefined();
    });

    it('sets the progress bar width style to matching percentage', () => {
        render(<CertificateProgress progress={75} />);

        const progressBar = screen.getByTestId('certificate-progress-bar');
        expect(progressBar.style.width).toBe('75%');
    });
});
