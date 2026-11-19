import crypto from 'crypto';

/**
 * Performs a timing-safe comparison of two secret strings.
 * Returns false if either value is missing or empty.
 */
export function safeCompareSecret(
    provided: string | null | undefined,
    expected: string | null | undefined
): boolean {
    if (!provided || !expected) {
        return false;
    }

    const encoder = new TextEncoder();
    const providedBytes = encoder.encode(provided);
    const expectedBytes = encoder.encode(expected);

    if (providedBytes.length !== expectedBytes.length) {
        // Perform a dummy comparison of equal lengths to avoid early-exit timing leaks
        crypto.timingSafeEqual(expectedBytes, expectedBytes);
        return false;
    }

    return crypto.timingSafeEqual(providedBytes, expectedBytes);
}
