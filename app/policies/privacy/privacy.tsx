'use client';

import Container from '@/app/components/utils/Container';
import { useRouter } from 'next/navigation';
import { FiChevronLeft } from 'react-icons/fi';
import { Policy } from '@/app/utils/policy-utils';
import ReactMarkdown from 'react-markdown';
import { PolicyStyles } from '@/app/components/policies/PolicyStyles';
import { useTranslation } from 'react-i18next';

interface PrivacyPolicyProps {
    policy?: Policy | null;
    policies?: Record<string, Policy | null>;
}

const PrivacyPolicy: React.FC<PrivacyPolicyProps> = ({
    policy: initialPolicy,
    policies,
}) => {
    const { back } = useRouter() || {};
    const { i18n } = useTranslation();

    const activeLang = (i18n.language || 'es').slice(0, 2).toLowerCase();
    const policy = policies
        ? policies[activeLang] ||
          policies['es'] ||
          policies['en'] ||
          initialPolicy
        : initialPolicy;

    if (!policy) return null;

    return (
        <Container>
            <div className="mx-auto max-w-(--breakpoint-md) dark:text-neutral-100">
                <div className="mx-auto max-w-[700px] gap-10 px-1 py-0 md:px-4 md:py-6">
                    <div className="mb-5 flex items-center justify-between">
                        <button
                            type="button"
                            className="flex items-center gap-2 text-neutral-600 focus:outline-hidden dark:text-neutral-100"
                            onClick={() => back()}
                            aria-label="Go back"
                        >
                            <FiChevronLeft className="text-xl" />
                        </button>
                        <h1 className="text-3xl font-semibold">
                            {policy.frontmatter.title}
                        </h1>
                        <div className="w-8"></div>
                    </div>
                    <ReactMarkdown components={PolicyStyles}>
                        {policy.content}
                    </ReactMarkdown>
                </div>
            </div>
        </Container>
    );
};

export default PrivacyPolicy;
