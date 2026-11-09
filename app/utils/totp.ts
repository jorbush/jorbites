import crypto from 'crypto';

const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const TOTP_STEP_SECONDS = 30;
const TOTP_DIGITS = 6;
const BACKUP_CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'; // Avoids ambiguous 0/O, 1/I

export function base32Encode(buffer: ArrayLike<number>): string {
    let bits = 0;
    let value = 0;
    let output = '';

    for (let i = 0; i < buffer.length; i++) {
        value = (value << 8) | buffer[i];
        bits += 8;

        while (bits >= 5) {
            output += BASE32_ALPHABET[(value >>> (bits - 5)) & 31];
            bits -= 5;
        }
    }

    if (bits > 0) {
        output += BASE32_ALPHABET[(value << (5 - bits)) & 31];
    }

    return output;
}

export function base32Decode(encoded: string): Buffer {
    const cleaned = encoded
        .toUpperCase()
        .replace(/=+$/, '')
        .replace(/[\s-]/g, '');
    let bits = 0;
    let value = 0;
    const bytes: number[] = [];

    for (let i = 0; i < cleaned.length; i++) {
        const idx = BASE32_ALPHABET.indexOf(cleaned[i]);
        if (idx === -1) {
            throw new Error('Invalid Base32 character');
        }
        value = (value << 5) | idx;
        bits += 5;

        if (bits >= 8) {
            bytes.push((value >>> (bits - 8)) & 0xff);
            bits -= 8;
        }
    }

    return Buffer.from(bytes);
}

export function generateTotpSecret(byteLength = 20): string {
    return base32Encode(crypto.randomBytes(byteLength));
}

export function buildOtpAuthUrl({
    secret,
    email,
    issuer = 'Jorbites',
}: {
    secret: string;
    email: string;
    issuer?: string;
}): string {
    const encodedIssuer = encodeURIComponent(issuer);
    const encodedAccount = encodeURIComponent(email);
    const params = new URLSearchParams({
        secret,
        issuer,
        algorithm: 'SHA1',
        digits: String(TOTP_DIGITS),
        period: String(TOTP_STEP_SECONDS),
    });
    return `otpauth://totp/${encodedIssuer}:${encodedAccount}?${params.toString()}`;
}

function generateHotp(secretBuffer: Buffer, counter: bigint): string {
    const counterBuffer = Buffer.alloc(8);
    counterBuffer.writeBigUInt64BE(counter, 0);

    const hmac = crypto
        .createHmac('sha1', new Uint8Array(secretBuffer))
        .update(new Uint8Array(counterBuffer))
        .digest();

    const offset = hmac[hmac.length - 1] & 0x0f;
    const binaryCode =
        ((hmac[offset] & 0x7f) << 24) |
        ((hmac[offset + 1] & 0xff) << 16) |
        ((hmac[offset + 2] & 0xff) << 8) |
        (hmac[offset + 3] & 0xff);

    const otp = binaryCode % 10 ** TOTP_DIGITS;
    return otp.toString().padStart(TOTP_DIGITS, '0');
}

export function generateTotpCode(
    secret: string,
    timestampMs = Date.now()
): string {
    const secretBuffer = base32Decode(secret);
    const counter = BigInt(Math.floor(timestampMs / 1000 / TOTP_STEP_SECONDS));
    return generateHotp(secretBuffer, counter);
}

export function verifyTotpCode(
    code: string,
    secret: string,
    window = 1,
    timestampMs = Date.now()
): boolean {
    const normalized = code.trim().replace(/\s+/g, '');
    if (!/^\d{6}$/.test(normalized)) {
        return false;
    }

    try {
        const secretBuffer = base32Decode(secret);
        const currentCounter = BigInt(
            Math.floor(timestampMs / 1000 / TOTP_STEP_SECONDS)
        );
        const inputBytes = new TextEncoder().encode(normalized);

        for (let offset = -window; offset <= window; offset++) {
            const counter = currentCounter + BigInt(offset);
            if (counter < BigInt(0)) continue;
            const candidate = generateHotp(secretBuffer, counter);
            const candidateBytes = new TextEncoder().encode(candidate);
            if (
                inputBytes.length === candidateBytes.length &&
                crypto.timingSafeEqual(inputBytes, candidateBytes)
            ) {
                return true;
            }
        }
        return false;
    } catch {
        return false;
    }
}

function getEncryptionKey(): Uint8Array {
    const rawKey =
        process.env.NEXTAUTH_SECRET || 'jorbites-default-totp-secret-key';
    const digest = crypto.createHash('sha256').update(rawKey).digest();
    return new Uint8Array(digest);
}

export function encryptTotpSecret(secret: string): string {
    const iv = crypto.randomBytes(12);
    const key = getEncryptionKey();
    const cipher = crypto.createCipheriv(
        'aes-256-gcm',
        key,
        new Uint8Array(iv)
    );
    const encryptedHex =
        cipher.update(secret, 'utf8', 'hex') + cipher.final('hex');
    const authTagHex = cipher.getAuthTag().toString('hex');
    return `enc:${iv.toString('hex')}:${authTagHex}:${encryptedHex}`;
}

export function decryptTotpSecret(stored: string): string {
    if (!stored.startsWith('enc:')) {
        return stored;
    }
    const parts = stored.split(':');
    if (parts.length !== 4) {
        throw new Error('Invalid encrypted TOTP secret format');
    }
    const [, ivHex, authTagHex, encryptedHex] = parts;
    const iv = new Uint8Array(Buffer.from(ivHex, 'hex'));
    const authTag = new Uint8Array(Buffer.from(authTagHex, 'hex'));
    const key = getEncryptionKey();

    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAuthTag(authTag);
    return (
        decipher.update(encryptedHex, 'hex', 'utf8') + decipher.final('utf8')
    );
}

export function normalizeBackupCode(code: string): string {
    return code.toUpperCase().replace(/[\s-]/g, '').trim();
}

export function hashBackupCode(code: string): string {
    const normalized = normalizeBackupCode(code);
    return crypto.createHash('sha256').update(normalized).digest('hex');
}

export function generateBackupCodes(count = 8): {
    rawCodes: string[];
    hashedCodes: string[];
} {
    const rawCodes: string[] = [];
    const hashedCodes: string[] = [];

    for (let i = 0; i < count; i++) {
        const bytes = crypto.randomBytes(8);
        let chars = '';
        for (let j = 0; j < 8; j++) {
            chars +=
                BACKUP_CODE_ALPHABET[bytes[j] % BACKUP_CODE_ALPHABET.length];
        }
        const formatted = `${chars.slice(0, 4)}-${chars.slice(4, 8)}`;
        rawCodes.push(formatted);
        hashedCodes.push(hashBackupCode(formatted));
    }

    return { rawCodes, hashedCodes };
}

export function verifyBackupCode(
    inputCode: string,
    hashedCodes: string[]
): { valid: boolean; remainingHashes: string[] } {
    const normalized = normalizeBackupCode(inputCode);
    if (normalized.length < 6) {
        return { valid: false, remainingHashes: hashedCodes };
    }

    const inputHash = hashBackupCode(normalized);
    const inputHashBytes = new TextEncoder().encode(inputHash);

    let matchedIndex = -1;
    for (let i = 0; i < hashedCodes.length; i++) {
        const storedBytes = new TextEncoder().encode(hashedCodes[i]);
        if (
            storedBytes.length === inputHashBytes.length &&
            crypto.timingSafeEqual(storedBytes, inputHashBytes)
        ) {
            matchedIndex = i;
            break;
        }
    }

    if (matchedIndex === -1) {
        return { valid: false, remainingHashes: hashedCodes };
    }

    const remainingHashes = hashedCodes.filter(
        (_, idx) => idx !== matchedIndex
    );
    return { valid: true, remainingHashes };
}
