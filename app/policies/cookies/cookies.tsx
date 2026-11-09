'use client';

import React from 'react';
import PolicyContent, {
    PolicyContentProps,
} from '@/app/components/policies/PolicyContent';

export type CookiesPolicyProps = PolicyContentProps;

const CookiesPolicy: React.FC<CookiesPolicyProps> = (props) => {
    return <PolicyContent {...props} />;
};

export default CookiesPolicy;
