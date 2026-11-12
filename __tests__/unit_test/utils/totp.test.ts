import { describe, it, expect } from 'vitest';
import {
    base32Encode,
    base32Decode,
    generateTotpSecret,
    buildOtpAuthUrl,
    generateTotpCode,
    verifyTotpCode,
    encryptTotpSecret,
    decryptTotpSecret,
    generateBackupCodes,
    verifyBackupCode,
} from '@/app/utils/totp';
import { generateQrMatrix } from '@/app/utils/qrcode';

describe('TOTP & Backup Code Utilities', () => {
    it('encodes and decodes Base32 round-trip accurately', () => {
        const original = Buffer.from('Hello Jorbites 2FA Secret!', 'utf8');
        const encoded = base32Encode(original);
        expect(encoded).toMatch(/^[A-Z2-7]+$/);
        const decoded = base32Decode(encoded);
        expect(decoded.equals(original)).toBe(true);
    });

    it('throws on invalid Base32 characters', () => {
        expect(() => base32Decode('INVALID_CHAR_0189!')).toThrow(
            'Invalid Base32 character'
        );
    });

    it('generates a 32-character Base32 secret by default', () => {
        const secret = generateTotpSecret();
        expect(secret).toHaveLength(32);
        expect(secret).toMatch(/^[A-Z2-7]+$/);
    });

    it('builds a valid otpauth:// URL', () => {
        const secret = 'JBSWY3DPEHPK3PXP';
        const url = buildOtpAuthUrl({
            secret,
            email: 'chef@jorbites.com',
            issuer: 'Jorbites',
        });
        expect(url).toContain('otpauth://totp/Jorbites:chef%40jorbites.com?');
        expect(url).toContain(`secret=${secret}`);
        expect(url).toContain('issuer=Jorbites');
        expect(url).toContain('digits=6');
        expect(url).toContain('period=30');
    });

    it('generates and verifies 6-digit TOTP codes across adjacent time windows', () => {
        const secret = generateTotpSecret();
        const fixedTime = 1_700_000_000_000;
        const code = generateTotpCode(secret, fixedTime);

        expect(code).toMatch(/^\d{6}$/);
        // Exact timestamp
        expect(verifyTotpCode(code, secret, 1, fixedTime)).toBe(true);
        // +30s (within +1 window)
        expect(verifyTotpCode(code, secret, 1, fixedTime + 30_000)).toBe(true);
        // -30s (within -1 window)
        expect(verifyTotpCode(code, secret, 1, fixedTime - 30_000)).toBe(true);
        // +90s (outside window=1)
        expect(verifyTotpCode(code, secret, 1, fixedTime + 90_000)).toBe(false);
        // Wrong code
        expect(verifyTotpCode('000000', secret, 1, fixedTime)).toBe(
            code === '000000'
        );
        // Non-6-digit code
        expect(verifyTotpCode('12345', secret, 1, fixedTime)).toBe(false);
    });

    it('encrypts and decrypts TOTP secrets at rest with AES-256-GCM', () => {
        const secret = generateTotpSecret();
        const encrypted = encryptTotpSecret(secret);
        expect(encrypted.startsWith('enc:')).toBe(true);
        expect(encrypted).not.toContain(secret);
        expect(decryptTotpSecret(encrypted)).toBe(secret);
        // Rejects unencrypted plaintext
        expect(() => decryptTotpSecret(secret)).toThrow(
            'Invalid encrypted TOTP secret format'
        );
    });

    it('generates, verifies, and consumes one-time backup codes', () => {
        const { rawCodes, hashedCodes } = generateBackupCodes(8);
        expect(rawCodes).toHaveLength(8);
        expect(hashedCodes).toHaveLength(8);
        expect(rawCodes[0]).toMatch(/^[A-Z0-9]{4}-[A-Z0-9]{4}$/);

        // Verify first backup code (case-insensitive and hyphen-insensitive)
        const firstCodeLowerNoHyphen = rawCodes[0]
            .replace('-', '')
            .toLowerCase();
        const result1 = verifyBackupCode(firstCodeLowerNoHyphen, hashedCodes);
        expect(result1.valid).toBe(true);
        expect(result1.matchedHash).toBe(hashedCodes[0]);
        expect(result1.remainingHashes).toHaveLength(7);

        // Reusing the same code against remainingHashes fails
        const result2 = verifyBackupCode(rawCodes[0], result1.remainingHashes);
        expect(result2.valid).toBe(false);
        expect(result2.remainingHashes).toHaveLength(7);
    });

    it('generates a valid square QR code matrix for otpauth URLs', () => {
        const url = buildOtpAuthUrl({
            secret: 'JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP',
            email: 'chef@jorbites.com',
        });
        const matrix = generateQrMatrix(url);
        expect(matrix.length).toBeGreaterThanOrEqual(21);
        expect(matrix[0].length).toBe(matrix.length);
        // Top-left finder pattern corner (0,0) is always dark
        expect(matrix[0][0]).toBe(true);
    });
});
