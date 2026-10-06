'use client';

import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiEye,
    FiEdit3,
    FiAward,
    FiInfo,
    FiCheck,
    FiLogOut,
    FiUserPlus,
} from 'react-icons/fi';
import toast from 'react-hot-toast';

export type ChefRole = 'owner' | 'editor' | 'viewer';

export interface RolePermissionSimulatorProps {
    onInteracted?: () => void;
}

export function useRolePermissionState(onInteracted?: () => void) {
    const [selectedRole, setSelectedRole] = useState<ChefRole>('owner');
    const [sampleIngredients, setSampleIngredients] = useState(
        '500g Bread flour, 350ml Warm water, 7g Active dry yeast, Fresh rosemary, Flaky sea salt'
    );

    const handleRoleChange = (role: ChefRole) => {
        setSelectedRole(role);
        onInteracted?.();
    };

    return {
        selectedRole,
        sampleIngredients,
        setSampleIngredients,
        handleRoleChange,
    };
}

interface RoleSelectorButtonsProps {
    selectedRole: ChefRole;
    onSelectRole: (role: ChefRole) => void;
}

const RoleSelectorButtons: React.FC<RoleSelectorButtonsProps> = ({
    selectedRole,
    onSelectRole,
}) => {
    const { t } = useTranslation();

    const roles: Array<{
        id: ChefRole;
        label: string;
        icon: React.ComponentType<{ className?: string }>;
        activeClass: string;
    }> = [
        {
            id: 'owner',
            label: t('drafts_course_details.role_owner') || 'Recipe Owner',
            icon: FiAward,
            activeClass: 'bg-amber-500 text-white shadow-xs',
        },
        {
            id: 'editor',
            label: t('drafts_course_details.role_editor') || 'Co-Cook (Editor)',
            icon: FiEdit3,
            activeClass: 'bg-green-600 text-white shadow-xs',
        },
        {
            id: 'viewer',
            label: t('drafts_course_details.role_viewer') || 'Co-Cook (Viewer)',
            icon: FiEye,
            activeClass: 'bg-blue-600 text-white shadow-xs',
        },
    ];

    const inactiveClass =
        'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300';

    return (
        <div className="mb-5 flex flex-wrap gap-2">
            {roles.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRole === role.id;
                return (
                    <button
                        key={role.id}
                        type="button"
                        aria-pressed={isSelected}
                        onClick={() => onSelectRole(role.id)}
                        className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                            isSelected ? role.activeClass : inactiveClass
                        }`}
                    >
                        <Icon className="size-4" />
                        <span>{role.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

interface StudioHeaderProps {
    selectedRole: ChefRole;
}

const StudioHeader: React.FC<StudioHeaderProps> = ({ selectedRole }) => {
    const { t } = useTranslation();

    const roleConfig = {
        owner: {
            description:
                t('drafts_course_details.owner_badge') ||
                'Full access: invite friends, change roles, remove collaborators, and publish.',
            badge: t('drafts_course_details.role_owner_badge') || '👑 Owner',
            badgeClass:
                'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300',
        },
        editor: {
            description:
                t('drafts_course_details.editor_badge') ||
                'Can edit ingredients, instructions, and cooking details.',
            badge: t('drafts_course_details.role_editor_badge') || '✍️ Editor',
            badgeClass:
                'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300',
        },
        viewer: {
            description:
                t('drafts_course_details.viewer_banner_text') ||
                'Viewer Mode: You are viewing this recipe in read-only mode.',
            badge: t('drafts_course_details.role_viewer_badge') || '👀 Viewer',
            badgeClass:
                'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300',
        },
    };

    const currentConfig = roleConfig[selectedRole];

    return (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800">
            <div>
                <h5 className="text-sm font-bold text-neutral-900 dark:text-white">
                    {t('drafts_course_details.sample_recipe_title') ||
                        'Tuscan Herb Focaccia (Collaborative Draft)'}
                </h5>
                <p className="text-xs text-neutral-500">
                    {currentConfig.description}
                </p>
            </div>

            <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${currentConfig.badgeClass}`}
            >
                {currentConfig.badge}
            </span>
        </div>
    );
};

interface StudioFormInputsProps {
    isViewer: boolean;
    sampleIngredients: string;
    onIngredientsChange: (val: string) => void;
}

const StudioFormInputs: React.FC<StudioFormInputsProps> = ({
    isViewer,
    sampleIngredients,
    onIngredientsChange,
}) => {
    const { t } = useTranslation();

    return (
        <div
            className={`space-y-3 ${
                isViewer ? 'pointer-events-none opacity-60' : ''
            }`}
        >
            <div>
                <label
                    htmlFor="role-prep-time-input"
                    className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                    {t('drafts_course_details.prep_time_label') ||
                        'Prep Time (Minutes)'}
                </label>
                <input
                    id="role-prep-time-input"
                    type="text"
                    defaultValue="45"
                    readOnly={isViewer}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
                />
            </div>

            <div>
                <label
                    htmlFor="role-ingredients-input"
                    className="mb-1 block text-xs font-semibold text-neutral-700 dark:text-neutral-300"
                >
                    {t('drafts_course_details.ingredients_label') ||
                        'Ingredients'}
                </label>
                <textarea
                    id="role-ingredients-input"
                    rows={3}
                    value={sampleIngredients}
                    onChange={(e) => onIngredientsChange(e.target.value)}
                    readOnly={isViewer}
                    className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
                />
            </div>
        </div>
    );
};

interface StudioActionButtonsProps {
    selectedRole: ChefRole;
}

const StudioActionButtons: React.FC<StudioActionButtonsProps> = ({
    selectedRole,
}) => {
    const { t } = useTranslation();

    const isViewer = selectedRole === 'viewer';
    const isOwner = selectedRole === 'owner';

    const handleInviteFriends = () => {
        toast.success(
            t('drafts_course_details.toast_opened_invite') ||
                'Opened Invite Collaborators Modal!'
        );
    };

    const handleLeaveDraft = () => {
        toast.success(
            t('drafts_course_details.toast_left_draft') ||
                'Left collaborative draft.'
        );
    };

    const handleSaveDraft = () => {
        toast.success(
            t('drafts_course_details.toast_draft_saved') ||
                'Draft saved successfully!'
        );
    };

    return (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
            <div className="flex items-center gap-2">
                {isOwner && (
                    <button
                        type="button"
                        onClick={handleInviteFriends}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                        <FiUserPlus className="size-3.5" />
                        <span>
                            {t('drafts_course_details.invite_friends') ||
                                'Invite Friends'}
                        </span>
                    </button>
                )}
                {!isOwner && (
                    <button
                        type="button"
                        onClick={handleLeaveDraft}
                        className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                    >
                        <FiLogOut className="size-3.5 text-red-500" />
                        <span>
                            {t('drafts_course_details.leave_draft') ||
                                'Leave Draft'}
                        </span>
                    </button>
                )}
            </div>

            <div className="flex items-center gap-2">
                <button
                    type="button"
                    disabled={isViewer}
                    onClick={handleSaveDraft}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                        isViewer
                            ? 'cursor-not-allowed bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
                            : 'bg-green-450 cursor-pointer text-neutral-900 hover:bg-[#b0e88b] dark:text-neutral-900'
                    }`}
                >
                    <FiCheck className="size-3.5" />
                    <span>
                        {isViewer
                            ? t('drafts_course_details.save_disabled') ||
                              'Save (Disabled)'
                            : t('drafts_course_details.save_draft') ||
                              'Save Draft'}
                    </span>
                </button>
            </div>
        </div>
    );
};

export const RolePermissionSimulator: React.FC<
    RolePermissionSimulatorProps
> = ({ onInteracted }) => {
    const { t } = useTranslation();
    const {
        selectedRole,
        sampleIngredients,
        setSampleIngredients,
        handleRoleChange,
    } = useRolePermissionState(onInteracted);

    const isViewer = selectedRole === 'viewer';

    return (
        <div className="rounded-2xl border border-neutral-200 bg-neutral-50/50 p-5 dark:border-neutral-800 dark:bg-neutral-900/40">
            <div className="mb-4">
                <h4 className="text-base font-semibold text-neutral-900 dark:text-white">
                    {t('drafts_course_details.roles_simulator_title') ||
                        'Role Switcher Preview'}
                </h4>
                <p className="text-xs text-neutral-600 dark:text-neutral-400">
                    {t('drafts_course_details.roles_simulator_desc') ||
                        'Select a role to preview how the recipe studio changes for different chefs:'}
                </p>
            </div>

            <RoleSelectorButtons
                selectedRole={selectedRole}
                onSelectRole={handleRoleChange}
            />

            {/* Simulated Recipe Studio Interface */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                <StudioHeader selectedRole={selectedRole} />

                {/* Viewer Mode Alert Banner */}
                {isViewer && (
                    <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200">
                        <FiInfo className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>
                            {t('drafts_course_details.viewer_banner_text') ||
                                'Viewer Mode: You are viewing this recipe in read-only mode.'}
                        </span>
                    </div>
                )}

                <StudioFormInputs
                    isViewer={isViewer}
                    sampleIngredients={sampleIngredients}
                    onIngredientsChange={setSampleIngredients}
                />

                <StudioActionButtons selectedRole={selectedRole} />
            </div>
        </div>
    );
};

export default RolePermissionSimulator;
