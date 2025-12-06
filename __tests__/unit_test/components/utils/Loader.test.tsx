import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loader from '@/app/components/utils/Loader';

describe('Loader', () => {
    it('renders the loading image', () => {
        render(<Loader />);
        const loadingImage = screen.getByAltText('Loading...');
        expect(loadingImage).toBeInTheDocument();
    });
});
