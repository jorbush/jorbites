import TermsPolicy from '@/app/policies/terms/terms';
import { getPoliciesBySlug, getPolicyBySlug } from '@/app/utils/policy-utils';
import PolicySkeleton from '@/app/components/policies/PolicySkeleton';
import { cookies } from 'next/headers';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const lang = cookieStore.get('i18next')?.value || 'en';
    const policy =
        (await getPolicyBySlug('terms', lang)) ||
        (await getPolicyBySlug('terms', 'es'));

    if (!policy) {
        return {
            title: 'Terms of Service | Jorbites',
        };
    }

    return {
        title: `${policy.frontmatter.title} | Jorbites`,
        description: policy.frontmatter.description,
    };
}

const TermsPolicyPage = async () => {
    const policies = await getPoliciesBySlug('terms');

    if (!policies || (!policies.en && !policies.es && !policies.ca)) {
        return <PolicySkeleton />;
    }

    return <TermsPolicy policies={policies} />;
};

export default TermsPolicyPage;
