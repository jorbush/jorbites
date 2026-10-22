import React from 'react';
import { SafeUser } from '@/app/types';
import { getCreatorSameAsLinks } from '@/app/utils/profile-utils';

interface ProfileJsonLdProps {
    user?: SafeUser | null;
}

const ProfileJsonLd: React.FC<ProfileJsonLdProps> = ({ user }) => {
    if (!user) return null;

    const sameAsLinks = getCreatorSameAsLinks(user);
    const profileJsonLd = {
        '@context': 'https://schema.org',
        '@type': 'ProfilePage',
        mainEntity: {
            '@type': 'Person',
            name: user.name || 'User',
            description: user.bio || undefined,
            image: user.image || undefined,
            ...(sameAsLinks.length > 0 ? { sameAs: sameAsLinks } : {}),
        },
    };

    return (
        <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
                __html: JSON.stringify(profileJsonLd)
                    .replace(/</g, '\\u003c')
                    .replace(/>/g, '\\u003e'),
            }}
        />
    );
};

export default ProfileJsonLd;
