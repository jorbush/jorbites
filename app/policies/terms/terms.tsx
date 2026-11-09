'use client';

import React from 'react';
import PolicyContent, {
    PolicyContentProps,
} from '@/app/components/policies/PolicyContent';

export type TermsPolicyProps = PolicyContentProps;

const TermsPolicy: React.FC<TermsPolicyProps> = (props) => {
    return <PolicyContent {...props} />;
};

export default TermsPolicy;
