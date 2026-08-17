import React from 'react';
import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import ToasterProvider from '@/app/providers/ToasterProvider';
import * as ReactHotToast from 'react-hot-toast';

vi.mock('react-hot-toast', () => ({
    Toaster: vi.fn((props) => (
        <div
            data-testid="mock-toaster"
            data-props={JSON.stringify(props)}
        />
    )),
}));

describe('ToasterProvider', () => {
    it('renders Toaster with containerStyle including safe-area insets', () => {
        const { getByTestId } = render(<ToasterProvider />);
        const toaster = getByTestId('mock-toaster');

        expect(toaster).toBeDefined();
        expect(ReactHotToast.Toaster).toHaveBeenCalledWith(
            expect.objectContaining({
                containerStyle: {
                    top: 'calc(1rem + env(safe-area-inset-top, 0px))',
                    bottom: 'calc(1rem + env(safe-area-inset-bottom, 0px))',
                    left: 'calc(1rem + env(safe-area-inset-left, 0px))',
                    right: 'calc(1rem + env(safe-area-inset-right, 0px))',
                },
            }),
            undefined
        );
    });
});
