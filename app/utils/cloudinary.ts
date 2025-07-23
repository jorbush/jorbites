import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Checks if a URL is a Cloudinary resource
 * @param url - The URL to check
 * @returns boolean - true if it's a Cloudinary URL
 */
export function isCloudinaryUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    return url.includes('cloudinary.com');
}

/**
 * Extracts the public_id from a Cloudinary URL
 * @param cloudinaryUrl - The Cloudinary URL
 * @returns string | null - The public_id or null if extraction fails
 */
export function extractPublicId(cloudinaryUrl: string): string | null {
    if (!cloudinaryUrl || !isCloudinaryUrl(cloudinaryUrl)) {
        return null;
    }

    try {
        // Cloudinary URL pattern: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
        // or: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{version}/{public_id}.{format}

        // Extract the part after '/upload/'
        const uploadIndex = cloudinaryUrl.indexOf('/upload/');
        if (uploadIndex === -1) return null;

        const afterUpload = cloudinaryUrl.substring(uploadIndex + 8); // 8 = length of '/upload/'

        // Split by '/' to get path segments
        const segments = afterUpload.split('/');

        // Find the last segment which should contain the public_id and extension
        const lastSegment = segments[segments.length - 1];

        // Remove the file extension if present
        const publicId = lastSegment.split('.')[0];

        // If there are transformations or version, we need to reconstruct the full path
        if (segments.length > 1) {
            // Check if the first segment looks like transformations (contains parameters like w_, h_, etc.)
            // or if it's a version number (starts with 'v' followed by numbers)
            let pathIndex = 0;

            // Skip transformation parameters
            while (pathIndex < segments.length - 1) {
                const segment = segments[pathIndex];
                // If segment contains transformation parameters or is a version
                if (segment.includes('_') || /^v\d+$/.test(segment)) {
                    pathIndex++;
                } else {
                    break;
                }
            }

            // Join remaining segments (excluding the last one with extension)
            const pathSegments = segments.slice(pathIndex, -1);
            const filename = segments[segments.length - 1].split('.')[0];

            if (pathSegments.length > 0) {
                return [...pathSegments, filename].join('/');
            }
            return filename;
        }

        return publicId;
    } catch (error) {
        console.error('Error extracting public_id from Cloudinary URL:', error);
        return null;
    }
}

/**
 * Deletes an image from Cloudinary
 * @param imageUrl - The Cloudinary image URL or public_id
 * @returns Promise<boolean> - true if deletion was successful
 */
export async function deleteFromCloudinary(imageUrl: string): Promise<boolean> {
    if (!imageUrl) return false;

    try {
        let publicId: string | null;

        // If it's a full URL, extract the public_id
        if (isCloudinaryUrl(imageUrl)) {
            publicId = extractPublicId(imageUrl);
        } else {
            // If it's already a public_id
            publicId = imageUrl;
        }

        if (!publicId) {
            console.error('Could not extract public_id from:', imageUrl);
            return false;
        }

        console.log(
            `Attempting to delete Cloudinary image with public_id: ${publicId}`
        );

        const result = await cloudinary.uploader.destroy(publicId);

        if (result.result === 'ok') {
            console.log(`Successfully deleted Cloudinary image: ${publicId}`);
            return true;
        } else {
            console.warn(
                `Cloudinary deletion result: ${result.result} for public_id: ${publicId}`
            );
            return false;
        }
    } catch (error) {
        console.error('Error deleting image from Cloudinary:', error);
        return false;
    }
}

/**
 * Deletes multiple images from Cloudinary
 * @param imageUrls - Array of Cloudinary image URLs
 * @returns Promise<{ successful: string[], failed: string[] }> - Arrays of successful and failed deletions
 */
export async function deleteMultipleFromCloudinary(
    imageUrls: string[]
): Promise<{ successful: string[]; failed: string[] }> {
    const successful: string[] = [];
    const failed: string[] = [];

    // Filter out non-Cloudinary URLs and empty strings
    const cloudinaryUrls = imageUrls.filter(
        (url) => url && isCloudinaryUrl(url)
    );

    if (cloudinaryUrls.length === 0) {
        return { successful, failed };
    }

    // Process deletions in parallel but with some limitation to avoid rate limits
    const deletionPromises = cloudinaryUrls.map(async (url) => {
        try {
            const success = await deleteFromCloudinary(url);
            if (success) {
                successful.push(url);
            } else {
                failed.push(url);
            }
        } catch (error) {
            console.error(`Failed to delete ${url}:`, error);
            failed.push(url);
        }
    });

    await Promise.allSettled(deletionPromises);

    return { successful, failed };
}
