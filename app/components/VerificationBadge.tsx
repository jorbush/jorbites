'use client';

import React from 'react';
import { MdVerified } from 'react-icons/md';
import Tooltip from './Tooltip';
import { useTranslation } from 'react-i18next';

interface VerificationBadgeProps {
    className?: string;
    size?: number;
    tooltipPosition?: 'top' | 'right' | 'bottom' | 'left';
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
    className = '',
    size,
    tooltipPosition = 'top',
}) => {
    const { t } = useTranslation();
    const tooltipText = t('verification_tooltip', 'This is a nice Jorbiter');

    return (
        <Tooltip
            text={tooltipText}
            position={tooltipPosition}
        >
            <MdVerified
                className={`text-green-450 ${className}`}
                size={size}
                data-testid="verified-icon"
            />
        </Tooltip>
    );
};

export default VerificationBadge;
