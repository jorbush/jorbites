import { describe, it, expect, vi } from 'vitest';
import { compressImage } from '@/app/utils/compressImage';

describe('compressImage utility', () => {
    it('should throw an error if non-image file is passed', async () => {
        const textFile = new File(['hello world'], 'test.txt', {
            type: 'text/plain',
        });
        await expect(compressImage(textFile)).rejects.toThrow(
            'Only image files are allowed'
        );
    });

    it('should throw an error if invalid file with no type is passed', async () => {
        const invalidFile = new File(['data'], 'test.bin', { type: '' });
        await expect(compressImage(invalidFile)).rejects.toThrow(
            'Only image files are allowed'
        );
    });

    it('should return a file or compressed output for valid image input in test env', async () => {
        const imageFile = new File(['dummy image content'], 'photo.png', {
            type: 'image/png',
        });
        const result = await compressImage(imageFile, {
            maxWidth: 1080,
            maxHeight: 1080,
            quality: 0.82,
        });

        expect(result).toBeDefined();
        expect(result.name).toBeDefined();
    });

    it('should create and revoke object URL during compression in browser simulation', async () => {
        const originalEnv = process.env.NODE_ENV;
        try {
            process.env.NODE_ENV = 'development';
            const mockCreateObjectURL = vi.fn(() => 'blob:mock-url');
            const mockRevokeObjectURL = vi.fn();
            global.URL.createObjectURL = mockCreateObjectURL;
            global.URL.revokeObjectURL = mockRevokeObjectURL;

            const originalImage = global.Image;
            class MockImage {
                width = 2000;
                height = 1000;
                onload: (() => void) | null = null;
                onerror: (() => void) | null = null;
                set src(_url: string) {
                    setTimeout(() => {
                        this.onload?.();
                    }, 0);
                }
            }
            global.Image = MockImage as unknown as typeof Image;

            const originalCreateElement = document.createElement.bind(document);
            vi.spyOn(document, 'createElement').mockImplementation(
                (tagName: string) => {
                    if (tagName === 'canvas') {
                        const canvas = originalCreateElement('canvas');
                        canvas.getContext = vi.fn().mockReturnValue({
                            drawImage: vi.fn(),
                        } as unknown as CanvasRenderingContext2D);
                        canvas.toBlob = vi.fn((callback: BlobCallback) => {
                            callback(
                                new Blob(['compressed'], { type: 'image/webp' })
                            );
                        });
                        return canvas;
                    }
                    return originalCreateElement(tagName);
                }
            );

            const imageFile = new File(['image bytes'], 'sample.jpg', {
                type: 'image/jpeg',
            });
            const result = await compressImage(imageFile, {
                maxWidth: 1080,
                maxHeight: 1080,
            });

            expect(result.name).toBe('sample.webp');
            expect(mockCreateObjectURL).toHaveBeenCalledWith(imageFile);
            expect(mockRevokeObjectURL).toHaveBeenCalledWith('blob:mock-url');

            global.Image = originalImage;
        } finally {
            process.env.NODE_ENV = originalEnv;
        }
    });

    it('should revoke object URL and fallback to original file if image fails to load', async () => {
        const originalEnv = process.env.NODE_ENV;
        try {
            process.env.NODE_ENV = 'development';
            const mockCreateObjectURL = vi.fn(() => 'blob:mock-error-url');
            const mockRevokeObjectURL = vi.fn();
            global.URL.createObjectURL = mockCreateObjectURL;
            global.URL.revokeObjectURL = mockRevokeObjectURL;

            const originalImage = global.Image;
            class MockErrorImage {
                onload: (() => void) | null = null;
                onerror: (() => void) | null = null;
                set src(_url: string) {
                    setTimeout(() => {
                        this.onerror?.();
                    }, 0);
                }
            }
            global.Image = MockErrorImage as unknown as typeof Image;

            const imageFile = new File(['corrupt data'], 'corrupt.jpg', {
                type: 'image/jpeg',
            });
            const result = await compressImage(imageFile);

            expect(result).toBe(imageFile);
            expect(mockCreateObjectURL).toHaveBeenCalledWith(imageFile);
            expect(mockRevokeObjectURL).toHaveBeenCalledWith(
                'blob:mock-error-url'
            );

            global.Image = originalImage;
        } finally {
            process.env.NODE_ENV = originalEnv;
        }
    });
});
