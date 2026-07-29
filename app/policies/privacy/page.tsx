import PrivacyPolicy from '@/app/policies/privacy/privacy';
import { getPoliciesBySlug, getPolicyBySlug } from '@/app/utils/policy-utils';
import PolicySkeleton from '@/app/components/policies/PolicySkeleton';
import { cookies } from 'next/headers';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const lang = cookieStore.get('i18next')?.value || 'en';
    const policy =
        (await getPolicyBySlug('privacy', lang)) ||
        (await getPolicyBySlug('privacy', 'es'));

    if (!policy) {
        return {
            title: 'Privacy Policy | Jorbites',
        };
    }

    return {
        title: `${policy.frontmatter.title} | Jorbites`,
        description: policy.frontmatter.description,
    };
}

const PrivacyPolicyPage = async () => {
    const policies = await getPoliciesBySlug('privacy');

    if (!policies || (!policies.en && !policies.es && !policies.ca)) {
        return <PolicySkeleton />;
    }

    return <PrivacyPolicy policies={policies} />;
};

export default PrivacyPolicyPage;
