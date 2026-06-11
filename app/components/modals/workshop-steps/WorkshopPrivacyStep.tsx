'use client';

import React from 'react';
import { FieldValues, UseFormRegister } from 'react-hook-form';
import WhitelistUsersStep from './WhitelistUsersStep';

interface WorkshopPrivacyStepProps {
    register: UseFormRegister<FieldValues>;
    isLoading: boolean;
    isPrivate: boolean;
    selectedUsers: any[];
    onAddUser: (user: any) => void;
    onRemoveUser: (userId: string) => void;
    t: (key: string) => string;
}

export const WorkshopPrivacyStep: React.FC<WorkshopPrivacyStepProps> = ({
    register,
    isLoading,
    isPrivate,
    selectedUsers,
    onAddUser,
    onRemoveUser,
    t,
}) => (
    <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
            <input
                id="isPrivate"
                type="checkbox"
                {...register('isPrivate')}
                disabled={isLoading}
                className="accent-green-450 size-5"
            />
            <label
                htmlFor="isPrivate"
                className="text-md font-semibold"
            >
                {t('private_workshop')}
            </label>
        </div>
        {isPrivate && (
            <WhitelistUsersStep
                isLoading={isLoading}
                selectedUsers={selectedUsers}
                onAddUser={onAddUser}
                onRemoveUser={onRemoveUser}
            />
        )}
    </div>
);

export default WorkshopPrivacyStep;
