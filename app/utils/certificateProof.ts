import crypto from 'crypto';
import { safeCompareSecret } from '@/app/utils/cryptoUtils';

const COMPLETION_TOKEN_TTL_SECONDS = 60 * 60; // 1 hour

interface CompletionTokenPayload {
    sub: string;
    cid: string;
    exp: number;
}

function getSigningSecret(): string | null {
    const configured =
        process.env.CERTIFICATE_SIGNING_SECRET || process.env.NEXTAUTH_SECRET;
    if (configured) {
        return configured;
    }
    if (process.env.NODE_ENV === 'production') {
        return null;
    }
    return 'dev-certificate-signing-secret';
}

function signPayload(encodedPayload: string, secret: string): string {
    return crypto
        .createHmac('sha256', secret)
        .update(`course-completion:${encodedPayload}`)
        .digest('base64url');
}

/**
 * Mints a short-lived HMAC-SHA256 proof binding a passing quiz result
 * to a specific userId and courseId.
 */
export function createCompletionToken(
    userId: string,
    courseId: string
): string | null {
    if (!userId || !courseId) {
        return null;
    }

    const secret = getSigningSecret();
    if (!secret) {
        return null;
    }

    const payload: CompletionTokenPayload = {
        sub: userId,
        cid: courseId.trim(),
        exp: Math.floor(Date.now() / 1000) + COMPLETION_TOKEN_TTL_SECONDS,
    };

    const encodedPayload = Buffer.from(
        JSON.stringify(payload),
        'utf8'
    ).toString('base64url');
    const signature = signPayload(encodedPayload, secret);

    return `${encodedPayload}.${signature}`;
}

/**
 * Verifies a course completion proof token against the authenticated user
 * and target courseId using constant-time signature comparison.
 */
export function verifyCompletionToken(
    token: unknown,
    expectedUserId: string,
    expectedCourseId: string
): boolean {
    if (
        typeof token !== 'string' ||
        !token ||
        !expectedUserId ||
        !expectedCourseId
    ) {
        return false;
    }

    const secret = getSigningSecret();
    if (!secret) {
        return false;
    }

    const parts = token.split('.');
    if (parts.length !== 2 || !parts[0] || !parts[1]) {
        return false;
    }

    const [encodedPayload, providedSignature] = parts;
    const expectedSignature = signPayload(encodedPayload, secret);

    if (!safeCompareSecret(providedSignature, expectedSignature)) {
        return false;
    }

    try {
        const decoded = JSON.parse(
            Buffer.from(encodedPayload, 'base64url').toString('utf8')
        ) as Partial<CompletionTokenPayload>;

        if (
            decoded.sub !== expectedUserId ||
            decoded.cid !== expectedCourseId.trim() ||
            typeof decoded.exp !== 'number'
        ) {
            return false;
        }

        const nowSeconds = Math.floor(Date.now() / 1000);
        return decoded.exp > nowSeconds;
    } catch {
        return false;
    }
}
