'use client';

import React from 'react';
import PolicyContent, {
    PolicyContentProps,
} from '@/app/components/policies/PolicyContent';

export type PrivacyPolicyProps = PolicyContentProps;

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = (props) => {
    return <PolicyContent {...props} />;
};

export default PrivacyPolicy;
