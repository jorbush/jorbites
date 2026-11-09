'use client';

import React from 'react';
import Image from 'next/image';
import { FiAward } from 'react-icons/fi';

export interface CertificateBadgeProps {
    badgeSrc?: string;
    title: string;
    comingSoon?: boolean;
}

const CertificateBadge: React.FC<CertificateBadgeProps> = ({
    badgeSrc,
    title,
    comingSoon = false,
}) => {
    const grayscaleClass = comingSoon ? 'opacity-50 grayscale' : '';

    if (badgeSrc) {
        return (
            <Image
                src={badgeSrc}
                alt={title}
                width={96}
                height={96}
                className={`object-cover ${grayscaleClass}`}
            />
        );
    }

    return (
        <div
            className={`bg-green-450 flex size-full items-center justify-center text-green-950 ${grayscaleClass}`}
        >
            <FiAward
                className={`size-10 ${comingSoon ? '' : 'animate-pulse'}`}
            />
        </div>
    );
};

export default CertificateBadge;
