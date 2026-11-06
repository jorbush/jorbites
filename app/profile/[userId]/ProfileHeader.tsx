'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/utils/Container';
import ProfileBacklinks from '@/app/components/profile/ProfileBacklinks';
import ProfileBadges from '@/app/components/profile/ProfileBadges';
import ProfileHeaderNav from '@/app/components/profile/ProfileHeaderNav';
import ProfileIdentity from '@/app/components/profile/ProfileIdentity';

interface ProfileHeaderProps {
    user?: SafeUser | null;
    currentUser?: SafeUser | null;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({ user, currentUser }) => {
    return (
        <Container>
            <ProfileHeaderNav
                user={user}
                currentUser={currentUser}
            />

            <ProfileIdentity user={user} />

            <ProfileBacklinks
                bio={user?.bio}
                websiteUrl={user?.websiteUrl}
                instagram={user?.instagram}
                twitter={user?.twitter}
                youtube={user?.youtube}
                tiktok={user?.tiktok}
            />

            <ProfileBadges badges={user?.badges} />
        </Container>
    );
};

export default ProfileHeader;
