'use client';

import React from 'react';
import { useTranslation } from 'react-i18next';
import {
    FiCheck,
    FiThermometer,
    FiDroplet,
    FiScissors,
    FiRefreshCw,
    FiWind,
    FiAward,
    FiZap,
} from 'react-icons/fi';
import { TbCooker, TbSoup, TbSalad } from 'react-icons/tb';
import { CulinaryActionType } from '@/app/utils/stepGuideUtils';
import { IconType } from 'react-icons';

interface CulinaryActionVisualizerProps {
    action: CulinaryActionType;
    isCompleted: boolean;
    stepIndex: number;
}

const ACTION_CONFIG: Record<
    CulinaryActionType,
    {
        icon: IconType;
        labelKey: string;
        defaultLabel: string;
        motionClass: string;
        showSteam?: boolean;
        showOrbit?: boolean;
    }
> = {
    bake: {
        icon: TbCooker,
        labelKey: 'guide_action_bake',
        defaultLabel: 'Oven & Baking',
        motionClass: 'animate-pulse-scale',
        showSteam: true,
    },
    boil: {
        icon: TbSoup,
        labelKey: 'guide_action_boil',
        defaultLabel: 'Boil & Simmer',
        motionClass: 'animate-smooth-float',
        showSteam: true,
    },
    heat: {
        icon: FiThermometer,
        labelKey: 'guide_action_heat',
        defaultLabel: 'Heat & Sear',
        motionClass: 'animate-pulse-scale',
        showSteam: true,
    },
    chop: {
        icon: FiScissors,
        labelKey: 'guide_action_chop',
        defaultLabel: 'Prep & Slice',
        motionClass: 'animate-smooth-float',
    },
    mix: {
        icon: FiRefreshCw,
        labelKey: 'guide_action_mix',
        defaultLabel: 'Mix & Combine',
        motionClass: 'animate-spin',
        showOrbit: true,
    },
    chill: {
        icon: FiWind,
        labelKey: 'guide_action_chill',
        defaultLabel: 'Chill & Rest',
        motionClass: 'animate-smooth-float',
    },
    plate: {
        icon: TbSalad,
        labelKey: 'guide_action_plate',
        defaultLabel: 'Plate & Serve',
        motionClass: 'animate-smooth-float',
        showOrbit: true,
    },
    general: {
        icon: FiZap,
        labelKey: 'guide_action_general',
        defaultLabel: 'Cooking Step',
        motionClass: 'animate-smooth-float',
    },
};

export const CulinaryActionVisualizer: React.FC<
    CulinaryActionVisualizerProps
> = ({ action, isCompleted, stepIndex }) => {
    const { t } = useTranslation();
    const config = ACTION_CONFIG[action] || ACTION_CONFIG.general;
    const ActionIcon = isCompleted ? FiCheck : config.icon;
    const label = String(
        t(config.labelKey, { defaultValue: config.defaultLabel })
    );

    return (
        <div
            className="flex flex-col items-center gap-2 md:gap-3"
            data-testid="culinary-action-visualizer"
            data-action={action}
        >
            <div className="relative mt-1 flex items-center justify-center">
                {/* Ambient outer pulse ring */}
                <div
                    className={`border-green-450/30 bg-green-450/10 pointer-events-none absolute -inset-2 rounded-2xl border transition-opacity duration-500 md:-inset-3 md:rounded-3xl ${
                        isCompleted
                            ? 'scale-105 opacity-100'
                            : 'animate-pulse opacity-75'
                    }`}
                />

                {/* Orbiting dashed ring for mix / plate */}
                {config.showOrbit && !isCompleted && (
                    <div
                        className="border-green-450/40 pointer-events-none absolute -inset-3.5 animate-spin rounded-full border border-dashed md:-inset-5"
                        style={{ animationDuration: '10s' }}
                    />
                )}

                {/* Rising steam wisps for heat / boil / bake */}
                {config.showSteam && !isCompleted && (
                    <div
                        className="pointer-events-none absolute -top-4 flex items-end gap-1 md:-top-6 md:gap-1.5"
                        aria-hidden="true"
                    >
                        <span className="bg-green-450/50 h-2.5 w-1 animate-bounce rounded-full md:h-3" />
                        <span
                            className="bg-green-450/70 h-3 w-1 animate-bounce rounded-full md:h-4"
                            style={{ animationDelay: '150ms' }}
                        />
                        <span
                            className="bg-green-450/50 h-2.5 w-1 animate-bounce rounded-full md:h-3"
                            style={{ animationDelay: '300ms' }}
                        />
                    </div>
                )}

                {/* Main Squircle Icon Container */}
                <div
                    className={`relative z-10 flex size-13 items-center justify-center rounded-2xl border shadow-md transition-colors duration-300 md:size-20 ${
                        isCompleted
                            ? 'border-green-450 bg-green-450 text-neutral-950'
                            : 'border-neutral-200/80 bg-white/90 text-neutral-900 dark:border-neutral-700/80 dark:bg-neutral-800/90 dark:text-white'
                    }`}
                >
                    <ActionIcon
                        className={`size-6 md:size-8 ${
                            isCompleted
                                ? 'stroke-[3] text-neutral-950'
                                : `dark:text-green-450 text-neutral-900 ${
                                      action === 'mix' ? '' : config.motionClass
                                  }`
                        }`}
                    />
                    <span className="border-green-450/50 bg-green-450 absolute -right-1.5 -bottom-1.5 flex size-5 items-center justify-center rounded-full border text-[11px] font-bold text-neutral-950 shadow-2xs md:-right-2 md:-bottom-2 md:size-6 md:text-xs">
                        {stepIndex + 1}
                    </span>
                </div>
            </div>

            {/* Action Category Pill */}
            <span className="border-green-450/40 bg-green-450/15 dark:text-green-450 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold text-neutral-900 md:px-3 md:py-1 md:text-xs">
                {isCompleted ? (
                    <>
                        <FiAward size={12} />
                        {String(
                            t('guide_step_completed_badge', {
                                defaultValue: 'Step Completed',
                            })
                        )}
                    </>
                ) : (
                    <>
                        <FiDroplet
                            size={11}
                            className="opacity-70"
                        />
                        {label}
                    </>
                )}
            </span>
        </div>
    );
};

export default CulinaryActionVisualizer;
