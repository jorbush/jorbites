import { cache } from 'react';
import prisma from '@/app/lib/prismadb';
import { SafeCertificate } from '@/app/types';
import { logger } from '@/app/lib/axiom/server';
import {
    PUBLIC_CERTIFICATE_USER_SELECT_FIELDS,
    toSafeCertificate,
} from '../utils/certificateUtils';

interface IParams {
    certificateId?: string;
}

const getCertificateById = cache(async function getCertificateById(
    params: IParams
): Promise<SafeCertificate | null> {
    try {
        const { certificateId } = params;

        if (!certificateId || typeof certificateId !== 'string') {
            return null;
        }

        const trimmedId = certificateId.trim();
        if (!trimmedId) {
            return null;
        }

        const isObjectId = /^[0-9a-fA-F]{24}$/.test(trimmedId);

        let certificate = null;

        if (isObjectId) {
            certificate = await prisma.certificate.findUnique({
                where: { id: trimmedId },
                include: {
                    user: {
                        select: PUBLIC_CERTIFICATE_USER_SELECT_FIELDS,
                    },
                },
            });
        }

        if (!certificate) {
            certificate = await prisma.certificate.findUnique({
                where: { certId: trimmedId },
                include: {
                    user: {
                        select: PUBLIC_CERTIFICATE_USER_SELECT_FIELDS,
                    },
                },
            });
        }

        if (!certificate) {
            return null;
        }

        return toSafeCertificate(certificate);
    } catch (error: any) {
        logger.error('getCertificateById error', { error: error.message });
        throw error;
    }
});

export default getCertificateById;
