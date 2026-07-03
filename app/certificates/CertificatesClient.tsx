'use client';

import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import SectionHeader from '@/app/components/utils/SectionHeader';
import CertificateCard from '@/app/components/certificates/CertificateCard';
import { FcDiploma1 } from 'react-icons/fc';

import useIsMounted from '@/app/hooks/useIsMounted';

interface CertificatesClientProps {
    currentUser?: SafeUser | null;
}

const CertificatesClient: React.FC<CertificatesClientProps> = ({
    currentUser,
}) => {
    const { t } = useTranslation();
    const [progress, setProgress] = useState(0);
    const isMounted = useIsMounted();

    useEffect(() => {
        // Load progress from localStorage
        const stored = localStorage.getItem(
            'jorbites_cert_contest_manager_progress'
        );
        if (stored) {
            setProgress(parseInt(stored, 10));
        }
    }, []);

    if (!isMounted) {
        return null;
    }

    return (
        <Container>
            <div className="px-4 py-8">
                <SectionHeader
                    icon={FcDiploma1}
                    title={t('certificates')}
                    description={t('certificates_description')}
                />

                <div className="mx-auto max-w-4xl space-y-6">
                    <CertificateCard
                        id="contest-manager"
                        title={t('contest_manager_certificate')}
                        description={t('contest_manager_description')}
                        duration="2 hours"
                        progress={progress}
                        slug="contest-manager"
                        badgeSrc="/badges/contest_manager_badge.jpg"
                    />
                </div>
            </div>
        </Container>
    );
};

export default CertificatesClient;
