'use client';

import React from 'react';
import { Platform, PwaStep } from './types';

interface PwaStepCardsProps {
    platform: Platform;
    steps: PwaStep[];
}

const PwaStepCards: React.FC<PwaStepCardsProps> = ({ platform, steps }) => {
    return (
        <div
            id={`pwa-panel-${platform}`}
            role="tabpanel"
            aria-labelledby={`pwa-tab-${platform}`}
            data-testid="pwa-steps-container"
            className="flex flex-col gap-3 md:grid md:grid-cols-3"
        >
            {steps.map((step) => {
                const Icon = step.icon;
                return (
                    <div
                        key={step.number}
                        className="flex items-start gap-3.5 rounded-xl border border-neutral-200/80 bg-white p-3.5 shadow-2xs md:flex-col md:gap-2 dark:border-neutral-800 dark:bg-neutral-800/80"
                    >
                        <div className="flex shrink-0 items-center gap-2 md:w-full md:justify-between">
                            <span className="inline-flex size-6 items-center justify-center rounded-full bg-neutral-100 text-xs font-bold text-neutral-700 dark:bg-neutral-700 dark:text-neutral-200">
                                {step.number}
                            </span>
                            <div className="flex size-7 items-center justify-center rounded-lg bg-neutral-50 text-neutral-600 dark:bg-neutral-700/60 dark:text-neutral-300">
                                <Icon className="size-3.5" />
                            </div>
                        </div>
                        <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-semibold text-neutral-900 dark:text-neutral-100">
                                {step.title}
                            </h4>
                            <p className="mt-0.5 text-[11px] leading-relaxed text-neutral-500 dark:text-neutral-400">
                                {step.desc}
                            </p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default PwaStepCards;
