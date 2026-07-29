import CookiesPolicy from '@/app/policies/cookies/cookies';
import { getPoliciesBySlug, getPolicyBySlug } from '@/app/utils/policy-utils';
import PolicySkeleton from '@/app/components/policies/PolicySkeleton';
import { cookies } from 'next/headers';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const lang = cookieStore.get('i18next')?.value || 'en';
    const policy =
        (await getPolicyBySlug('cookies', lang)) ||
        (await getPolicyBySlug('cookies', 'es'));

    if (!policy) {
        return {
            title: 'Cookies Policy | Jorbites',
        };
    }

    return {
        title: `${policy.frontmatter.title} | Jorbites`,
        description: policy.frontmatter.description,
    };
}

const CookiesPolicyPage = async () => {
    const policies = await getPoliciesBySlug('cookies');

    if (!policies || (!policies.en && !policies.es && !policies.ca)) {
        return <PolicySkeleton />;
    }

    return <CookiesPolicy policies={policies} />;
};

export default CookiesPolicyPage;
