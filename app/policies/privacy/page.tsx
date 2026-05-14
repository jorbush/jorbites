import PrivacyPolicy from '@/app/policies/privacy/privacy';
import { getPolicyBySlug } from '@/app/utils/policy-utils';
import PolicySkeleton from '@/app/components/policies/PolicySkeleton';
import { cookies } from 'next/headers';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
    const cookieStore = await cookies();
    const lang = cookieStore.get('i18next')?.value || 'en';
    const policy = await getPolicyBySlug('privacy', lang);

    return {
        title: `${policy?.frontmatter.title} | Jorbites`,
        description: policy?.frontmatter.description,
    };
}

const PrivacyPolicyPage = async () => {
    const cookieStore = await cookies();
    const lang = cookieStore.get('i18next')?.value || 'en';
    const policy = await getPolicyBySlug('privacy', lang);

    if (!policy) {
        return <PolicySkeleton />;
    }

    return <PrivacyPolicy policy={policy} />;
};

export default PrivacyPolicyPage;
