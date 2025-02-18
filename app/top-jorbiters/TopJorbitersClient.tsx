'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/Container';
import Avatar from '@/app/components/Avatar';
import { useRouter } from 'next/navigation';
import { MdVerified } from 'react-icons/md';

interface TopJorbitersClientProps {
    currentUser?: SafeUser | null;
    topJorbiters?: SafeUser[];
}

const TopJorbitersClient: React.FC<TopJorbitersClientProps> = ({
    currentUser,
    topJorbiters,
}) => {
    const router = useRouter();

    console.log(currentUser, topJorbiters);
    return (
        <Container>
            <div className="mx-auto max-w-screen-lg px-5">
                <div className="mb-5 flex items-center justify-center">
                <h1>Top Jorbiters</h1>
                </div>
                {topJorbiters?.map((jorbiter) => (
                    <div key={jorbiter.id} className="flex w-full flex-row justify-between p-4 border-b">
                        <div className="flex flex-row items-center gap-4">
                            <Avatar
                                src={jorbiter.image}
                                size={60}
                                onClick={() => router.push('/profile/' + jorbiter.id)}
                            />
                            <div className="flex flex-col">
                                <div className="flex flex-row items-center gap-2">
                                    <div
                                        className="cursor-pointer text-xl"
                                        onClick={() => router.push('/profile/' + jorbiter.id)}
                                    >
                                        {jorbiter.name}
                                    </div>
                                    {jorbiter.verified && (
                                        <MdVerified className="text-green-450" />
                                    )}
                                </div>
                                <div className="text-gray-400">
                                    Level {jorbiter.level}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </Container>
    );
};

export default TopJorbitersClient;
