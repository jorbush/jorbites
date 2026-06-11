'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import Heading from '@/app/components/navigation/Heading';
import { useTranslation } from 'react-i18next';
import useRegisterModal from '@/app/hooks/useRegisterModal';

import {
    WhatIsJorbitesSection,
    WhyJorbitesSection,
    FeaturesSection,
    ArchitectureSection,
    DocumentationSection,
    DeveloperSection,
    GetStartedSection,
} from './AboutSections';

interface AboutClientProps {
    currentUser?: SafeUser | null;
}

const AboutClient: React.FC<AboutClientProps> = ({ currentUser }) => {
    const { t } = useTranslation();
    const registerModal = useRegisterModal();

    return (
        <Container>
            <div className="mx-auto max-w-4xl">
                <div className="py-8">
                    <Heading
                        title={t('about') || 'About'}
                        subtitle={
                            t('about_subtitle') ||
                            'Learn more about Jorbites and our mission'
                        }
                        center
                    />
                </div>

                <div className="flex flex-col gap-8">
                    <WhatIsJorbitesSection t={t} />
                    <WhyJorbitesSection t={t} />
                    <FeaturesSection t={t} />
                    <ArchitectureSection t={t} />
                    <DocumentationSection t={t} />
                    <DeveloperSection t={t} />
                    <GetStartedSection
                        t={t}
                        currentUser={currentUser}
                        onRegisterOpen={registerModal.onOpen}
                    />
                </div>
            </div>
        </Container>
    );
};

export default AboutClient;
