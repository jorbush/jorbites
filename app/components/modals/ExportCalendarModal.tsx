'use client';

import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-hot-toast';
import Modal from '@/app/components/modals/Modal';
import { generateIcsContent } from '@/app/utils/calendar-utils';
import { SafePlanningMeal } from '@/app/types';

interface ExportCalendarModalProps {
    isOpen: boolean;
    onClose: () => void;
    planningName: string;
    meals: SafePlanningMeal[];
}

const ExportCalendarModal: React.FC<ExportCalendarModalProps> = ({
    isOpen,
    onClose,
    planningName,
    meals,
}) => {
    const { t } = useTranslation();
    const [calendarStartDate, setCalendarStartDate] = useState(
        '2024-01-01' // Stable initial date
    );

    useEffect(() => {
        // Default to next Monday
        const d = new Date();
        const day = d.getDay();
        const diff = d.getDate() - day + (day === 0 ? -6 : 1) + 7; // Next Monday date
        d.setDate(diff);
        setCalendarStartDate(d.toISOString().split('T')[0]);
    }, []);

    const handleCalendarDownload = () => {
        const startMonday = new Date(calendarStartDate);
        const icsContent = generateIcsContent(planningName, meals, startMonday);

        const blob = new Blob([icsContent], {
            type: 'text/calendar;charset=utf-8;',
        });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute(
            'download',
            `${planningName.replace(/\s+/g, '_')}_calendar.ics`
        );
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        onClose();
        toast.success(
            t('calendar_exported_success') || 'Calendar file downloaded!'
        );
    };

    const bodyContent = (
        <div className="flex flex-col gap-4 text-black dark:text-white">
            <p className="text-sm font-light text-neutral-500 dark:text-neutral-400">
                {t('calendar_export_description') ||
                    'Export this weekly plan to a .ics file that can be imported directly into Google Calendar, Apple Calendar, or Microsoft Outlook.'}
            </p>
            <div className="flex flex-col gap-1">
                <label
                    htmlFor="export-calendar-start-date"
                    className="text-sm font-semibold text-neutral-700 dark:text-neutral-300"
                >
                    {t('select_week_start') ||
                        'Select week start date (Monday):'}
                </label>
                <input
                    id="export-calendar-start-date"
                    type="date"
                    value={calendarStartDate}
                    onChange={(e) => setCalendarStartDate(e.target.value)}
                    className="w-full rounded-md border border-neutral-300 bg-white p-3 font-light text-neutral-900 outline-hidden transition focus:border-black dark:border-neutral-700 dark:bg-neutral-800 dark:text-neutral-100 dark:focus:border-white"
                />
            </div>
        </div>
    );

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            onSubmit={handleCalendarDownload}
            title={t('export_calendar') || 'Export to Calendar'}
            actionLabel={t('download_ics') || 'Download iCal File'}
            body={bodyContent}
        />
    );
};

export default ExportCalendarModal;
