export interface CompressImageOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
}

/**
 * Downscales an image to max width/height (default 1080px) and converts to WebP format (quality 0.82).
 * Rejects non-image files.
 */
export async function compressImage(
    file: File,
    options: CompressImageOptions = {}
): Promise<File> {
    if (!file || !file.type || !file.type.startsWith('image/')) {
        throw new Error('Only image files are allowed');
    }

    const maxWidth = options.maxWidth || 1080;
    const maxHeight = options.maxHeight || 1080;
    const quality = options.quality ?? 0.82;

    if (
        typeof window === 'undefined' ||
        typeof document === 'undefined' ||
        typeof Image === 'undefined' ||
        typeof HTMLCanvasElement === 'undefined' ||
        process.env.NODE_ENV === 'test'
    ) {
        return file;
    }

    let objectUrl = '';
    try {
        objectUrl = URL.createObjectURL(file);
        return await new Promise<File>((resolve, reject) => {
            const image = new Image();

            image.onload = () => {
                let width = image.width || 800;
                let height = image.height || 600;

                if (width > maxWidth || height > maxHeight) {
                    if (width / height > maxWidth / maxHeight) {
                        height = Math.round((height * maxWidth) / width);
                        width = maxWidth;
                    } else {
                        width = Math.round((width * maxHeight) / height);
                        height = maxHeight;
                    }
                }

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    return resolve(file);
                }

                ctx.drawImage(image, 0, 0, width, height);

                if (typeof canvas.toBlob !== 'function') {
                    return resolve(file);
                }

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            return resolve(file);
                        }
                        const baseName = file.name.includes('.')
                            ? file.name.substring(0, file.name.lastIndexOf('.'))
                            : file.name;
                        const newFileName = `${baseName}.webp`;
                        const compressedFile = new File([blob], newFileName, {
                            type: 'image/webp',
                            lastModified: Date.now(),
                        });
                        resolve(compressedFile);
                    },
                    'image/webp',
                    quality
                );
            };

            image.onerror = () => {
                reject(new Error('Failed to load image for compression'));
            };

            image.src = objectUrl;
        });
    } catch {
        return file;
    } finally {
        if (objectUrl) {
            try {
                URL.revokeObjectURL(objectUrl);
            } catch {
                // Ignore
            }
        }
    }
}

export default compressImage;
