'use client';

import { UseFormRegister, FieldValues, FieldErrors } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

interface CurrencySelectProps {
    id: string;
    disabled?: boolean;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
}

const CurrencySelect: React.FC<CurrencySelectProps> = ({
    id,
    disabled,
    register,
    errors,
}) => {
    const { t } = useTranslation();
    return (
        <div className="relative w-24 flex-shrink-0">
            <select
                id={id}
                {...register(id)}
                disabled={disabled}
                className={`peer w-full cursor-pointer appearance-none rounded-md border-2 bg-white p-4 pt-6 font-light text-zinc-900 outline-hidden transition disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-800 dark:text-zinc-100 ${
                    errors[id]
                        ? 'border-rose-500 focus:border-rose-500'
                        : 'border-neutral-300 focus:border-black dark:border-neutral-600 dark:focus:border-white'
                }`}
            >
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
            </select>
            <label
                htmlFor={id}
                className={`text-md absolute top-5 left-4 z-10 origin-[0] -translate-y-3 scale-75 transform duration-150 ${
                    errors[id]
                        ? 'text-rose-500'
                        : 'text-zinc-400 dark:text-zinc-500'
                }`}
            >
                {t('currency')}
            </label>
            {/* Dropdown arrow */}
            <div className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-zinc-400 dark:text-zinc-500">
                <svg
                    width="12"
                    height="8"
                    viewBox="0 0 12 8"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path
                        d="M1 1.5L6 6.5L11 1.5"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </div>
        </div>
    );
};

export default CurrencySelect;
