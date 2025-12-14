import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { FaBeer } from 'react-icons/fa';

import SectionHeader from '@/app/components/utils/SectionHeader';

describe('SectionHeader', () => {
    it('should merge and override classes correctly', () => {
        render(
            <SectionHeader
                icon={FaBeer}
                title="Test Title"
                className="mb-4"
            />,
        );
        const headerElement = screen.getByText('Test Title').parentElement;
        expect(headerElement).toHaveClass('mb-4');
        expect(headerElement).not.toHaveClass('mb-10');
    });
});
