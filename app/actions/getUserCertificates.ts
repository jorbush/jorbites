import prisma from '@/app/lib/prismadb';
import { SafeCertificate } from '@/app/types';
import { logger } from '@/app/lib/axiom/server';
import {
    PUBLIC_CERTIFICATE_USER_SELECT_FIELDS,
    toSafeCertificate,
} from '../utils/certificateUtils';

export default async function getUserCertificates(
    userId?: string
): Promise<SafeCertificate[]> {
    try {
        if (!userId) {
            return [];
        }

        const certificates = await prisma.certificate.findMany({
            where: { userId },
            include: {
                user: {
                    select: PUBLIC_CERTIFICATE_USER_SELECT_FIELDS,
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        return certificates.map((cert) => toSafeCertificate(cert));
    } catch (error: any) {
        logger.error('getUserCertificates error', { error: error.message });
        throw error;
    }
}
