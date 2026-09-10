'use client';

import React from 'react';
import Modal from '@/app/components/modals/Modal';
import Loader from '@/app/components/shared/Loader';
import { SafeUser } from '@/app/types';
import { useDraftInvite } from './draft-invite/useDraftInvite';
import DraftOwnerInviteSection from './draft-invite/DraftOwnerInviteSection';
import DraftViewerInviteSection from './draft-invite/DraftViewerInviteSection';
import DraftDirectSearchSection from './draft-invite/DraftDirectSearchSection';
import DraftCollaboratorsList from './draft-invite/DraftCollaboratorsList';

interface DraftInviteModalProps {
    currentUser?: SafeUser | null;
}

const DraftInviteModal: React.FC<DraftInviteModalProps> = ({ currentUser }) => {
    const {
        isOpen,
        onClose,
        draft,
        isDraftLoading,
        usersMap,
        isOwner,
        inviteUrl,
        isRegenerating,
        handleRegenerate,
        mutatingUserId,
        handleRoleChange,
        handleRemoveCollaborator,
        isAddingUser,
        handleAddCollaborator,
        t,
    } = useDraftInvite(currentUser);

    const bodyContent = (
        <div
            data-testid="draft-invite-modal"
            className="flex flex-col gap-6"
        >
            {isDraftLoading && !draft ? (
                <div className="flex h-48 items-center justify-center">
                    <Loader height="80px" />
                </div>
            ) : (
                <>
                    {/* Owner section: Invite Link & Direct User Search */}
                    {isOwner ? (
                        <div className="flex flex-col gap-5">
                            <DraftOwnerInviteSection
                                inviteUrl={inviteUrl}
                                isRegenerating={isRegenerating}
                                onRegenerate={handleRegenerate}
                            />
                            <DraftDirectSearchSection
                                coCooksCount={draft?.coCooksIds?.length || 0}
                                ownerId={draft?.ownerId}
                                coCooksIds={draft?.coCooksIds}
                                isAddingUser={isAddingUser}
                                onAddCollaborator={handleAddCollaborator}
                            />
                        </div>
                    ) : (
                        <DraftViewerInviteSection inviteUrl={inviteUrl} />
                    )}

                    {/* Section: Collaborators */}
                    <DraftCollaboratorsList
                        ownerId={draft?.ownerId}
                        ownerName={draft?.ownerName}
                        coCooksIds={draft?.coCooksIds}
                        coCookRoles={draft?.coCookRoles}
                        usersMap={usersMap}
                        currentUser={currentUser}
                        isOwner={isOwner}
                        mutatingUserId={mutatingUserId}
                        onRoleChange={handleRoleChange}
                        onRemoveCollaborator={handleRemoveCollaborator}
                    />
                </>
            )}
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={onClose}
            actionLabel={t('close', { defaultValue: 'Close' }) as string}
            title={
                t('manage_co_cooks_invite', {
                    defaultValue: 'Manage Co-Cooks & Invites',
                }) as string
            }
            body={bodyContent}
        />
    );
};

export default DraftInviteModal;
