import crypto from 'crypto';
import { SafeCertificate } from '@/app/types';

export const PUBLIC_CERTIFICATE_USER_SELECT_FIELDS = {
    id: true,
    name: true,
    image: true,
} as const;

export function generateSecureCertId(): string {
    const year = new Date().getFullYear();
    const entropy = crypto.randomBytes(4).toString('hex').toUpperCase();
    return `JRBT-${year}-${entropy}`;
}

export function toSafeCertificate(cert: any): SafeCertificate {
    return {
        ...cert,
        issuedAt:
            cert.issuedAt instanceof Date
                ? cert.issuedAt.toISOString()
                : String(cert.issuedAt),
        createdAt:
            cert.createdAt instanceof Date
                ? cert.createdAt.toISOString()
                : String(cert.createdAt),
        updatedAt:
            cert.updatedAt instanceof Date
                ? cert.updatedAt.toISOString()
                : String(cert.updatedAt),
        user: cert.user
            ? {
                  id: cert.user.id,
                  name: cert.user.name ?? null,
                  image: cert.user.image ?? null,
              }
            : undefined,
    };
}
