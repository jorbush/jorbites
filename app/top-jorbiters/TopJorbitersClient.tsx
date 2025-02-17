'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/Container';

interface TopJorbitersClientProps {
    currentUser?: SafeUser | null;
    topJorbiters?: SafeUser[];
}

const TopJorbitersClient: React.FC<TopJorbitersClientProps> = ({
    currentUser,
    topJorbiters,
}) => {
    console.log(currentUser, topJorbiters);
    return (
        <Container>
            <div className="mx-auto max-w-screen-lg">
                <h1>Top Jorbiters</h1>
                {topJorbiters?.map((jorbiter) => (
                    <div className="flex w-full flex-row justify-between">
                        <div> {jorbiter.name} </div>
                        <div> {jorbiter.level} </div>
                    </div>
                ))}
            </div>
        </Container>
    );
};

export default TopJorbitersClient;
