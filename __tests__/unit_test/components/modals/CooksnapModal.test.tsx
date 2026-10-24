import React from 'react';
import {
    render,
    screen,
    fireEvent,
    waitFor,
    cleanup,
} from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import confetti from 'canvas-confetti';

import CooksnapModal from '@/app/components/modals/CooksnapModal';
import useCooksnapModal from '@/app/hooks/useCooksnapModal';

vi.mock('axios');
vi.mock('react-hot-toast');
vi.mock('canvas-confetti');

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        refresh: vi.fn(),
    }),
}));

vi.mock('react-i18next', () => ({
    useTranslation: () => ({
        t: (key: string, opts?: any) => {
            if (opts?.defaultValue) return opts.defaultValue;
            return key;
        },
    }),
}));

vi.mock('@/app/hooks/useIsMounted', () => ({
    default: () => true,
}));

vi.mock('@/app/utils/compressImage', () => ({
    compressImage: vi.fn((file) => Promise.resolve(file)),
}));

vi.mock('@/app/components/optimization/CustomProxyImage', () => ({
    default: ({ src, alt }: any) => (
        <img
            src={src}
            alt={alt}
            data-testid="custom-proxy-image"
        />
    ),
}));

describe('CooksnapModal', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        window.URL.createObjectURL = vi.fn(
            () => 'blob:http://localhost/dish-photo'
        );
        window.URL.revokeObjectURL = vi.fn();
        useCooksnapModal.setState({
            isOpen: true,
            recipeId: 'test-recipe-123',
            recipeTitle: 'Tacos de Birria',
        });
    });

    afterEach(() => {
        cleanup();
    });

    it('renders modal with upload dropzone when open and no file is selected', () => {
        render(<CooksnapModal />);

        expect(screen.getByText('Share your dish')).toBeDefined();
        expect(screen.getByTestId('cooksnap-dropzone')).toBeDefined();
        expect(screen.getByTestId('cooksnap-note-input')).toBeDefined();
        expect(screen.getByText('Post Cooksnap')).toBeDefined();
    });

    it('disables submit button when no file is selected', () => {
        render(<CooksnapModal />);

        const submitBtn = screen.getByText('Post Cooksnap').closest('button');
        expect(submitBtn).toBeDisabled();
    });

    it('closes modal when close button is clicked even if no file is selected', async () => {
        const onCloseSpy = vi.spyOn(useCooksnapModal.getState(), 'onClose');
        render(<CooksnapModal />);

        const closeBtn = screen.getByTestId('close-modal-button');
        fireEvent.click(closeBtn);

        await waitFor(() => {
            expect(onCloseSpy).toHaveBeenCalled();
        });
    });

    it('selects photo and shows preview with remove button', async () => {
        render(<CooksnapModal />);

        const fileInput = screen.getByTestId('cooksnap-file-input');
        const file = new File(['dummy photo'], 'dish.jpg', {
            type: 'image/jpeg',
        });

        fireEvent.change(fileInput, { target: { files: [file] } });

        await waitFor(() => {
            expect(screen.getByTestId('custom-proxy-image')).toBeDefined();
            expect(screen.getByTestId('remove-cooksnap-photo')).toBeDefined();
        });

        // Submit button should now be enabled
        const submitBtn = screen.getByText('Post Cooksnap').closest('button');
        expect(submitBtn).not.toBeDisabled();

        // Clicking remove photo clears preview
        fireEvent.click(screen.getByTestId('remove-cooksnap-photo'));
        expect(screen.queryByTestId('custom-proxy-image')).toBeNull();
        expect(screen.getByTestId('cooksnap-dropzone')).toBeDefined();
    });

    it('rejects invalid non-image file selection', () => {
        render(<CooksnapModal />);

        const fileInput = screen.getByTestId('cooksnap-file-input');
        const textFile = new File(['plain text'], 'doc.txt', {
            type: 'text/plain',
        });

        fireEvent.change(fileInput, { target: { files: [textFile] } });

        expect(toast.error).toHaveBeenCalledWith(
            'Please select a valid image file'
        );
        expect(screen.queryByTestId('custom-proxy-image')).toBeNull();
    });

    it('submits cooksnap with compressed photo, rating, and note', async () => {
        vi.mocked(axios.post).mockImplementation((url: string) => {
            if (url === '/api/upload/r2') {
                return Promise.resolve({
                    data: {
                        uploadUrl: 'https://r2.example.com/upload',
                        publicUrl: 'https://images.jorbites.com/cooksnap.webp',
                    },
                });
            }
            if (url === '/api/cooksnaps') {
                return Promise.resolve({ data: { id: 'cooksnap-1' } });
            }
            return Promise.reject(new Error('Unknown url'));
        });
        vi.mocked(axios.put).mockResolvedValue({ data: {} });

        render(<CooksnapModal />);

        // Attach file
        const fileInput = screen.getByTestId('cooksnap-file-input');
        const file = new File(['photo-bytes'], 'tacos.png', {
            type: 'image/png',
        });
        fireEvent.change(fileInput, { target: { files: [file] } });

        // Add note
        const noteInput = screen.getByTestId('cooksnap-note-input');
        fireEvent.change(noteInput, {
            target: { value: 'Added extra lime, delicious!' },
        });

        // Click 5th star
        const star5 = screen.getByTestId('star-5');
        fireEvent.click(star5);

        // Click submit
        const submitBtn = screen.getByText('Post Cooksnap');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                '/api/upload/r2',
                expect.any(Object)
            );
            expect(axios.put).toHaveBeenCalledWith(
                'https://r2.example.com/upload',
                expect.any(Object),
                expect.any(Object)
            );
            expect(axios.post).toHaveBeenCalledWith('/api/cooksnaps', {
                recipeId: 'test-recipe-123',
                comment: 'Added extra lime, delicious!',
                rating: 5,
                imageSrc: 'https://images.jorbites.com/cooksnap.webp',
            });
            expect(toast.success).toHaveBeenCalledWith(
                'Cooksnap shared! Author was notified.'
            );
            expect(confetti).toHaveBeenCalled();
            expect(useCooksnapModal.getState().isOpen).toBe(false);
        });
    });

    it('submits with null note if note is left empty', async () => {
        vi.mocked(axios.post).mockImplementation((url: string) => {
            if (url === '/api/upload/r2') {
                return Promise.resolve({
                    data: {
                        uploadUrl: 'https://r2.example.com/upload',
                        publicUrl: 'https://images.jorbites.com/cooksnap.webp',
                    },
                });
            }
            if (url === '/api/cooksnaps') {
                return Promise.resolve({ data: { id: 'cooksnap-1' } });
            }
            return Promise.reject(new Error('Unknown url'));
        });
        vi.mocked(axios.put).mockResolvedValue({ data: {} });

        render(<CooksnapModal />);

        const fileInput = screen.getByTestId('cooksnap-file-input');
        const file = new File(['photo-bytes'], 'tacos.png', {
            type: 'image/png',
        });
        fireEvent.change(fileInput, { target: { files: [file] } });

        const submitBtn = screen.getByText('Post Cooksnap');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledWith(
                '/api/cooksnaps',
                expect.objectContaining({
                    comment: null,
                    imageSrc: 'https://images.jorbites.com/cooksnap.webp',
                })
            );
        });
    });
});
