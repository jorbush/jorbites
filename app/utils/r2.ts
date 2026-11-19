import {
    S3Client,
    DeleteObjectCommand,
    DeleteObjectsCommand,
} from '@aws-sdk/client-s3';
import { logger } from '@/app/lib/axiom/server';

const accountId = process.env.R2_ACCOUNT_ID || 'mock-account-id';
const accessKeyId = process.env.R2_ACCESS_KEY_ID || 'mock-access-key';
const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY || 'mock-secret-key';
const bucketName = process.env.R2_BUCKET_NAME || 'jorbites-remakes';
const publicDomain = (
    process.env.R2_PUBLIC_DOMAIN || 'images.jorbites.com'
).toLowerCase();

let s3ClientInstance: S3Client | null = null;

function getS3Client(): S3Client {
    if (!s3ClientInstance) {
        s3ClientInstance = new S3Client({
            region: 'auto',
            endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
            credentials: {
                accessKeyId,
                secretAccessKey,
            },
        });
    }
    return s3ClientInstance;
}

/**
 * Returns the normalized hostname for the configured R2 public domain.
 */
function getNormalizedR2Domain(): string {
    return (process.env.R2_PUBLIC_DOMAIN || publicDomain)
        .toLowerCase()
        .replace(/^https?:\/\//, '')
        .replace(/\/.*$/, '');
}

/**
 * Checks whether a hostname belongs strictly to this application's R2 bucket.
 */
function isOwnedR2Hostname(host: string): boolean {
    const normalizedHost = host.toLowerCase();
    const r2Domain = getNormalizedR2Domain();
    if (normalizedHost === r2Domain) {
        return true;
    }
    const configuredAccountId = process.env.R2_ACCOUNT_ID?.toLowerCase();
    if (
        configuredAccountId &&
        normalizedHost === `${configuredAccountId}.r2.cloudflarestorage.com`
    ) {
        return true;
    }
    return false;
}

/**
 * Validates whether an image URL is from an allowed trusted host (owned R2 domain or Cloudinary).
 * @param urlStr - The candidate URL
 * @returns string | null - Cleaned URL if valid, null otherwise
 */
export function isValidR2Url(urlStr: unknown): string | null {
    if (!urlStr || typeof urlStr !== 'string') return null;
    try {
        const parsed = new URL(urlStr);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:')
            return null;
        const host = parsed.hostname.toLowerCase();
        const isAllowed =
            isOwnedR2Hostname(host) || host === 'res.cloudinary.com';
        return isAllowed ? urlStr : null;
    } catch {
        return null;
    }
}

/**
 * Checks if a URL is an owned R2 resource
 * @param url - The URL to check
 * @returns boolean - true if it's an owned R2 URL
 */
export function isR2Url(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    try {
        const parsed = new URL(url);
        if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
            return false;
        }
        return isOwnedR2Hostname(parsed.hostname);
    } catch {
        return url.startsWith('remakes/');
    }
}

/**
 * Extracts the owner userId from a user-namespaced R2 key (`remakes/<userId>/<filename>`).
 * Returns null for legacy keys (`remakes/<filename>`) or non-matching keys.
 */
export function extractR2KeyOwner(imageUrlOrKey: string): string | null {
    const key = extractR2Key(imageUrlOrKey);
    if (!key) return null;
    const parts = key.split('/');
    if (parts.length === 3 && parts[0] === 'remakes' && parts[1]) {
        return parts[1];
    }
    return null;
}

/**
 * Extracts the storage key from an R2 URL or key
 * @param r2Url - The R2 URL or key
 * @returns string | null - The R2 object key
 */
export function extractR2Key(r2Url: string): string | null {
    if (!r2Url || typeof r2Url !== 'string') return null;

    try {
        if (r2Url.startsWith('http://') || r2Url.startsWith('https://')) {
            const parsed = new URL(r2Url);
            const pathname = parsed.pathname.replace(/^\/+/, '');
            return pathname || null;
        }
        return r2Url.replace(/^\/+/, '');
    } catch {
        return null;
    }
}

/**
 * Deletes an object from Cloudflare R2
 * @param imageUrlOrKey - The R2 URL or object key
 * @returns Promise<boolean> - true if deletion was successful
 */
export async function deleteFromR2(imageUrlOrKey: string): Promise<boolean> {
    if (!imageUrlOrKey || !isR2Url(imageUrlOrKey)) return false;

    const key = extractR2Key(imageUrlOrKey);
    if (!key) return false;

    // In non-production without credentials, log and return true
    if (
        !process.env.R2_ACCOUNT_ID ||
        !process.env.R2_ACCESS_KEY_ID ||
        !process.env.R2_SECRET_ACCESS_KEY
    ) {
        logger.info(
            'deleteFromR2 - skipped deletion (no R2 credentials in environment)',
            {
                key,
            }
        );
        return true;
    }

    try {
        const client = getS3Client();
        const command = new DeleteObjectCommand({
            Bucket: bucketName,
            Key: key,
        });

        await client.send(command);
        logger.info('deleteFromR2 - success', { key, bucket: bucketName });
        return true;
    } catch (error: any) {
        logger.error('deleteFromR2 - error', {
            key,
            error: error?.message || String(error),
        });
        return false;
    }
}

/**
 * Deletes multiple objects from Cloudflare R2
 * @param imageUrlsOrKeys - Array of R2 URLs or object keys
 * @returns Promise<boolean>
 */
export async function deleteMultipleFromR2(
    imageUrlsOrKeys: string[]
): Promise<boolean> {
    if (!Array.isArray(imageUrlsOrKeys) || imageUrlsOrKeys.length === 0) {
        return true;
    }

    const keys = imageUrlsOrKeys
        .filter((item) => isR2Url(item))
        .map(extractR2Key)
        .filter((k): k is string => Boolean(k));

    if (keys.length === 0) return true;

    if (
        !process.env.R2_ACCOUNT_ID ||
        !process.env.R2_ACCESS_KEY_ID ||
        !process.env.R2_SECRET_ACCESS_KEY
    ) {
        logger.info(
            'deleteMultipleFromR2 - skipped deletion (no R2 credentials in environment)',
            { count: keys.length }
        );
        return true;
    }

    try {
        const client = getS3Client();
        const command = new DeleteObjectsCommand({
            Bucket: bucketName,
            Delete: {
                Objects: keys.map((Key) => ({ Key })),
            },
        });

        await client.send(command);
        logger.info('deleteMultipleFromR2 - success', {
            count: keys.length,
            bucket: bucketName,
        });
        return true;
    } catch (error: any) {
        logger.error('deleteMultipleFromR2 - error', {
            error: error?.message || String(error),
        });
        return false;
    }
}
