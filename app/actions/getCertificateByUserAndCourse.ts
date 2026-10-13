import prisma from '@/app/lib/prismadb';
import { SafeCertificate } from '@/app/types';
import { logger } from '@/app/lib/axiom/server';
import {
    PUBLIC_CERTIFICATE_USER_SELECT_FIELDS,
    toSafeCertificate,
} from '../utils/certificateUtils';

export default async function getCertificateByUserAndCourse(
    userId?: string,
    courseId?: string
): Promise<SafeCertificate | null> {
    try {
        if (!userId || !courseId) {
            return null;
        }

        const trimmedCourseId = courseId.trim();

        const certificate = await prisma.certificate.findUnique({
            where: {
                userId_courseId: {
                    userId,
                    courseId: trimmedCourseId,
                },
            },
            include: {
                user: {
                    select: PUBLIC_CERTIFICATE_USER_SELECT_FIELDS,
                },
            },
        });

        if (!certificate) {
            return null;
        }

        return toSafeCertificate(certificate);
    } catch (error: any) {
        logger.error('getCertificateByUserAndCourse error', {
            error: error.message,
        });
        throw error;
    }
}
