/**
 * YouTube URL validation regex
 * Matches:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - With additional query parameters
 */
export const YOUTUBE_URL_REGEX =
    /^https?:\/\/(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+((&[\w=-]*)*|(\?[\w=-]*)*)?$/;

/**
 * Validates YouTube URL format
 * @param url - The URL to validate
 * @returns true if valid, false if invalid
 */
export const isValidYouTubeUrl = (url: string): boolean => {
    if (!url || url.trim() === '') return true; // Allow empty URLs
    return YOUTUBE_URL_REGEX.test(url.trim());
};

/**
 * YouTube URL validation for react-hook-form
 * @param value - The input value to validate
 * @param errorMessage - Custom error message to return if validation fails
 * @returns true if valid, error message if invalid
 */
export const validateYouTubeUrl = (
    value: string,
    errorMessage?: string
): boolean | string => {
    if (!value || value.trim() === '') return true; // Allow empty

    if (!isValidYouTubeUrl(value)) {
        return (
            errorMessage ||
            'Please enter a valid YouTube URL (e.g., https://youtube.com/watch?v=... or https://youtu.be/...)'
        );
    }

    return true;
};

export const validateEmail = (email: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};
