'use client';

import React from 'react';
import { FieldErrors, UseFormRegister, FieldValues } from 'react-hook-form';
import Input from '../../inputs/Input';

interface WorkshopInfoStepProps {
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    isLoading: boolean;
    isRecurrent: boolean;
    t: (key: string) => string;
}

export const WorkshopInfoStep: React.FC<WorkshopInfoStepProps> = ({
    register,
    errors,
    isLoading,
    isRecurrent,
    t,
}) => (
    <div className="flex flex-col gap-4">
        <Input
            id="title"
            label={t('title')}
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            dataCy="workshop-title"
        />
        <Input
            id="description"
            label={t('description')}
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            dataCy="workshop-description"
        />
        <Input
            id="date"
            label={t('date')}
            type="datetime-local"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            dataCy="workshop-date"
        />
        <Input
            id="location"
            label={t('location')}
            disabled={isLoading}
            register={register}
            errors={errors}
            required
            dataCy="workshop-location"
        />
        <div className="flex items-center gap-2">
            <input
                id="isRecurrent"
                type="checkbox"
                {...register('isRecurrent')}
                disabled={isLoading}
                className="accent-green-450 size-5"
            />
            <label
                htmlFor="isRecurrent"
                className="text-md font-semibold"
            >
                {t('is_recurrent')}
            </label>
        </div>
        {isRecurrent && (
            <select
                {...register('recurrencePattern')}
                disabled={isLoading}
                className="w-full appearance-none rounded-lg border-2 p-4 transition outline-none disabled:cursor-not-allowed disabled:opacity-70 dark:bg-neutral-800 dark:text-white"
            >
                <option value="">{t('recurrence_pattern')}</option>
                <option value="weekly">{t('weekly')}</option>
                <option value="monthly">{t('monthly')}</option>
            </select>
        )}
    </div>
);

export default WorkshopInfoStep;
