import { describe, it, expect } from 'vitest';
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

    it('should return a file or compressed output for valid image input', async () => {
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
});
