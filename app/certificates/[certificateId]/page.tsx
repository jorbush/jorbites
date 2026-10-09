import { Metadata } from 'next';
import getCertificateById from '@/app/actions/getCertificateById';
import ClientOnly from '@/app/components/utils/ClientOnly';
import EmptyState from '@/app/components/utils/EmptyState';
import CertificateViewClient from './CertificateViewClient';

interface IParams {
    certificateId?: string;
}

export async function generateMetadata(props: {
    params: Promise<IParams>;
}): Promise<Metadata> {
    try {
        const params = await props.params;
        const certificate = await getCertificateById(params);

        if (!certificate) {
            return {
                title: 'Certificate Not Found | Jorbites',
                description: 'The requested certificate could not be found.',
            };
        }

        const title = `${certificate.userName}'s ${certificate.courseTitle} | Jorbites Certificate`;
        const description = `Verified certificate of completion for "${certificate.courseTitle}" awarded to ${certificate.userName} by Jorbites. Certificate ID: ${certificate.certId}`;

        return {
            title,
            description,
            openGraph: {
                title,
                description,
                type: 'website',
                url: `/certificates/${certificate.certId}`,
                images: certificate.badgeUrl
                    ? [certificate.badgeUrl]
                    : ['/images/logo-nobg.png'],
                siteName: 'Jorbites',
            },
            twitter: {
                card: 'summary_large_image',
                title,
                description,
                images: certificate.badgeUrl
                    ? [certificate.badgeUrl]
                    : ['/images/logo-nobg.png'],
            },
            alternates: {
                canonical: `/certificates/${certificate.certId}`,
            },
        };
    } catch {
        return {
            title: 'Certificate | Jorbites',
            description: 'Jorbites Certificate of Completion',
        };
    }
}

const CertificatePage = async (props: { params: Promise<IParams> }) => {
    let certificate = null;
    try {
        const params = await props.params;
        certificate = await getCertificateById(params);
    } catch {
        return (
            <ClientOnly>
                <EmptyState
                    title="Service temporarily unavailable"
                    subtitle="Unable to verify certificate at this time. Please try again later."
                />
            </ClientOnly>
        );
    }

    if (!certificate) {
        return (
            <ClientOnly>
                <EmptyState
                    title="Certificate not found"
                    subtitle="Sorry, we couldn't find this certificate. It may not exist or the link might be incorrect."
                />
            </ClientOnly>
        );
    }

    return (
        <ClientOnly>
            <CertificateViewClient certificate={certificate} />
        </ClientOnly>
    );
};

export default CertificatePage;
