
import { render } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Loader from '@/app/components/utils/Loader';

describe('Loader', () => {
    it('renders without crashing', () => {
        const { container } = render(<Loader />);
        expect(container).toBeDefined();
    });
});
