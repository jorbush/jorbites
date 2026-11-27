import prisma from '@/app/lib/prismadb';
import {
    decryptTotpSecret,
    verifyTotpCodeWithStep,
    verifyBackupCode,
} from '@/app/utils/totp';

export interface TwoFactorUserRecord {
    id: string;
    twoFactorSecret: string | null;
    twoFactorBackupCodes?: string[] | null;
    twoFactorLastUsedStep?: number | null;
}

export interface TwoFactorStepUpResult {
    valid: boolean;
    method?: 'totp' | 'backup';
    step?: number;
}

/**
 * Verifies a submitted 6-digit TOTP code or one-time backup recovery code and
 * atomically consumes it to prevent replay attacks:
 * - TOTP codes: enforces strictly monotonic `twoFactorLastUsedStep` via
 *   atomic `prisma.user.updateMany` so a code cannot be reused within its
 *   90-second acceptance window (or across concurrent requests).
 * - Backup codes: consumes the matched hash via optimistic concurrency
 *   `prisma.user.updateMany`.
 */
export async function verifyAndConsumeTwoFactorCode({
    user,
    code,
    timestampMs = Date.now(),
}: {
    user: TwoFactorUserRecord;
    code: string;
    timestampMs?: number;
}): Promise<TwoFactorStepUpResult> {
    const submittedCode = typeof code === 'string' ? code.trim() : '';
    if (!submittedCode || !user.twoFactorSecret) {
        return { valid: false };
    }

    let secret: string;
    try {
        secret = decryptTotpSecret(user.twoFactorSecret);
    } catch {
        return { valid: false };
    }

    const totpResult = verifyTotpCodeWithStep(
        submittedCode,
        secret,
        1,
        timestampMs
    );

    if (totpResult.valid && typeof totpResult.step === 'number') {
        const matchedStep = totpResult.step;

        // Fast-path replay rejection if step is not strictly newer than last accepted step
        if (
            typeof user.twoFactorLastUsedStep === 'number' &&
            matchedStep <= user.twoFactorLastUsedStep
        ) {
            return { valid: false };
        }

        // Atomic monotonic update to prevent concurrent replay of the same TOTP step.
        // Matches documents where twoFactorLastUsedStep is unset, null, or < matchedStep.
        const updateResult = await prisma.user.updateMany({
            where: {
                id: user.id,
                OR: [
                    { twoFactorLastUsedStep: { isSet: false } },
                    { twoFactorLastUsedStep: null },
                    { twoFactorLastUsedStep: { lt: matchedStep } },
                ],
            },
            data: {
                twoFactorLastUsedStep: matchedStep,
            },
        });

        if (updateResult.count === 0) {
            return { valid: false };
        }

        return { valid: true, method: 'totp', step: matchedStep };
    }

    // Fallback to one-time backup recovery codes
    const existingBackupCodes = user.twoFactorBackupCodes || [];
    const {
        valid: isValidBackup,
        matchedHash,
        remainingHashes,
    } = verifyBackupCode(submittedCode, existingBackupCodes);

    if (!isValidBackup || !matchedHash) {
        return { valid: false };
    }

    const updateResult = await prisma.user.updateMany({
        where: {
            id: user.id,
            twoFactorBackupCodes: {
                equals: existingBackupCodes,
            },
        },
        data: {
            twoFactorBackupCodes: remainingHashes,
        },
    });

    if (updateResult.count === 0) {
        return { valid: false };
    }

    return { valid: true, method: 'backup' };
}
