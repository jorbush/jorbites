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

type ChefRole = 'owner' | 'editor' | 'viewer';

interface RolePermissionSimulatorProps {
    onInteracted?: () => void;
}

export const RolePermissionSimulator: React.FC<
    RolePermissionSimulatorProps
> = ({ onInteracted }) => {
    const { t } = useTranslation();
    const [selectedRole, setSelectedRole] = useState<ChefRole>('owner');
    const [sampleIngredients, setSampleIngredients] = useState(
        '500g Bread flour, 350ml Warm water, 7g Active dry yeast, Fresh rosemary, Flaky sea salt'
    );

    const handleRoleChange = (role: ChefRole) => {
        setSelectedRole(role);
        onInteracted?.();
    };

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

            {/* Role Buttons */}
            <div className="mb-5 flex flex-wrap gap-2">
                <button
                    type="button"
                    aria-pressed={selectedRole === 'owner'}
                    onClick={() => handleRoleChange('owner')}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        selectedRole === 'owner'
                            ? 'bg-amber-500 text-white shadow-xs'
                            : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                >
                    <FiAward className="size-4" />
                    <span>
                        {t('drafts_course_details.role_owner') ||
                            'Recipe Owner'}
                    </span>
                </button>

                <button
                    type="button"
                    aria-pressed={selectedRole === 'editor'}
                    onClick={() => handleRoleChange('editor')}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        selectedRole === 'editor'
                            ? 'bg-green-600 text-white shadow-xs'
                            : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                >
                    <FiEdit3 className="size-4" />
                    <span>
                        {t('drafts_course_details.role_editor') ||
                            'Co-Cook (Editor)'}
                    </span>
                </button>

                <button
                    type="button"
                    aria-pressed={selectedRole === 'viewer'}
                    onClick={() => handleRoleChange('viewer')}
                    className={`inline-flex cursor-pointer items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold transition ${
                        selectedRole === 'viewer'
                            ? 'bg-blue-600 text-white shadow-xs'
                            : 'border border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-100 dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-300'
                    }`}
                >
                    <FiEye className="size-4" />
                    <span>
                        {t('drafts_course_details.role_viewer') ||
                            'Co-Cook (Viewer)'}
                    </span>
                </button>
            </div>

            {/* Simulated Recipe Studio Interface */}
            <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-xs dark:border-neutral-800 dark:bg-neutral-900">
                {/* Header with Title & Active Role Badge */}
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 border-b border-neutral-100 pb-3 dark:border-neutral-800">
                    <div>
                        <h5 className="text-sm font-bold text-neutral-900 dark:text-white">
                            {t('drafts_course_details.sample_recipe_title') ||
                                'Tuscan Herb Focaccia (Collaborative Draft)'}
                        </h5>
                        <p className="text-xs text-neutral-500">
                            {selectedRole === 'owner' &&
                                (t('drafts_course_details.owner_badge') ||
                                    'Full access: invite friends, change roles, remove collaborators, and publish.')}
                            {selectedRole === 'editor' &&
                                (t('drafts_course_details.editor_badge') ||
                                    'Can edit ingredients, instructions, and cooking details.')}
                            {selectedRole === 'viewer' &&
                                (t(
                                    'drafts_course_details.viewer_banner_text'
                                ) ||
                                    'Viewer Mode: You are viewing this recipe in read-only mode.')}
                        </p>
                    </div>

                    <span
                        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                            selectedRole === 'owner'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300'
                                : selectedRole === 'editor'
                                  ? 'bg-green-100 text-green-800 dark:bg-green-950/50 dark:text-green-300'
                                  : 'bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300'
                        }`}
                    >
                        {selectedRole === 'owner'
                            ? t('drafts_course_details.role_owner_badge') ||
                              '👑 Owner'
                            : selectedRole === 'editor'
                              ? t('drafts_course_details.role_editor_badge') ||
                                '✍️ Editor'
                              : t('drafts_course_details.role_viewer_badge') ||
                                '👀 Viewer'}
                    </span>
                </div>

                {/* Viewer Mode Alert Banner */}
                {selectedRole === 'viewer' && (
                    <div className="mb-4 flex items-center gap-2.5 rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/40 dark:text-blue-200">
                        <FiInfo className="size-4 shrink-0 text-blue-600 dark:text-blue-400" />
                        <span>
                            {t('drafts_course_details.viewer_banner_text') ||
                                'Viewer Mode: You are viewing this recipe in read-only mode.'}
                        </span>
                    </div>
                )}

                {/* Simulated Form Inputs */}
                <div
                    className={`space-y-3 ${
                        selectedRole === 'viewer'
                            ? 'pointer-events-none opacity-60'
                            : ''
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
                            readOnly={selectedRole === 'viewer'}
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
                            onChange={(e) =>
                                setSampleIngredients(e.target.value)
                            }
                            readOnly={selectedRole === 'viewer'}
                            className="w-full rounded-lg border border-neutral-200 px-3 py-2 text-xs focus:outline-hidden dark:border-neutral-800 dark:bg-neutral-800 dark:text-white"
                        />
                    </div>
                </div>

                {/* Simulated Action Buttons Bar */}
                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 dark:border-neutral-800">
                    <div className="flex items-center gap-2">
                        {selectedRole === 'owner' && (
                            <button
                                type="button"
                                onClick={() =>
                                    toast.success(
                                        t(
                                            'drafts_course_details.toast_opened_invite'
                                        ) ||
                                            'Opened Invite Collaborators Modal!'
                                    )
                                }
                                className="inline-flex cursor-pointer items-center gap-1.5 rounded-lg border border-neutral-300 px-3 py-1.5 text-xs font-semibold text-neutral-700 hover:bg-neutral-50 dark:border-neutral-700 dark:text-neutral-300 dark:hover:bg-neutral-800"
                            >
                                <FiUserPlus className="size-3.5" />
                                <span>
                                    {t(
                                        'drafts_course_details.invite_friends'
                                    ) || 'Invite Friends'}
                                </span>
                            </button>
                        )}
                        {(selectedRole === 'editor' ||
                            selectedRole === 'viewer') && (
                            <button
                                type="button"
                                onClick={() =>
                                    toast.success(
                                        t(
                                            'drafts_course_details.toast_left_draft'
                                        ) || 'Left collaborative draft.'
                                    )
                                }
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
                            disabled={selectedRole === 'viewer'}
                            onClick={() =>
                                toast.success(
                                    t(
                                        'drafts_course_details.toast_draft_saved'
                                    ) || 'Draft saved successfully!'
                                )
                            }
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                                selectedRole === 'viewer'
                                    ? 'cursor-not-allowed bg-neutral-200 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-500'
                                    : 'cursor-pointer bg-green-600 text-white hover:bg-green-700'
                            }`}
                        >
                            <FiCheck className="size-3.5" />
                            <span>
                                {selectedRole === 'viewer'
                                    ? t(
                                          'drafts_course_details.save_disabled'
                                      ) || 'Save (Disabled)'
                                    : t('drafts_course_details.save_draft') ||
                                      'Save Draft'}
                            </span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RolePermissionSimulator;
