import { NextResponse } from 'next/dist/server/web/spec-extension/response';
import getCertificateById from '@/app/actions/getCertificateById';
import { logger } from '@/app/lib/axiom/server';
import { notFoundResponse, internalServerError } from '@/app/utils/apiErrors';

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ certificateId: string }> }
) {
    try {
        const { certificateId } = await params;

        logger.info('GET /api/certificates/[certificateId] - start', {
            certificateId,
        });

        const certificate = await getCertificateById({ certificateId });

        if (!certificate) {
            return notFoundResponse('Certificate not found');
        }

        logger.info('GET /api/certificates/[certificateId] - success', {
            certificateId: certificate.id,
            certId: certificate.certId,
        });

        return NextResponse.json(certificate);
    } catch (error: any) {
        logger.error('GET /api/certificates/[certificateId] - error', {
            error: error.message,
        });
        return internalServerError('Internal Error');
    }
}
