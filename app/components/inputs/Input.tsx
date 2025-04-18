'use client';

import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form';
import { BiDollar } from 'react-icons/bi';

interface InputProps {
    id: string;
    label: string;
    type?: string;
    disabled?: boolean;
    formatPrice?: boolean;
    required?: boolean;
    register: UseFormRegister<FieldValues>;
    errors: FieldErrors;
    dataCy?: string;
}

const Input: React.FC<InputProps> = ({
    id,
    label,
    type = 'text',
    disabled,
    formatPrice,
    register,
    required,
    errors,
    dataCy,
}) => {
    return (
        <div className="relative w-full">
            {formatPrice && (
                <BiDollar
                    size={24}
                    className="absolute top-5 left-2 text-neutral-700 dark:text-neutral-300"
                    data-testid="BiDollar"
                />
            )}
            <input
                id={id}
                disabled={disabled}
                {...register(id, { required })}
                placeholder=" "
                type={type}
                className={`peer w-full rounded-md border-2 bg-white p-4 pt-6 font-light text-zinc-900 outline-hidden transition disabled:cursor-not-allowed disabled:opacity-70 dark:bg-zinc-800 dark:text-zinc-100 ${formatPrice ? 'pl-9' : 'pl-4'} ${
                    errors[id]
                        ? 'border-rose-500'
                        : 'border-neutral-300 dark:border-neutral-600'
                } ${
                    errors[id]
                        ? 'focus:border-rose-500'
                        : 'focus:border-black dark:focus:border-white'
                } `}
                data-cy={dataCy}
            />
            <label
                htmlFor={id}
                className={`text-md absolute top-5 z-10 origin-[0] -translate-y-3 transform duration-150 ${formatPrice ? 'left-9' : 'left-4'} peer-placeholder-shown:translate-y-0 peer-placeholder-shown:scale-100 peer-focus:-translate-y-4 peer-focus:scale-75 ${
                    errors[id]
                        ? 'text-rose-500'
                        : 'text-zinc-400 dark:text-zinc-500'
                } `}
            >
                {label}
            </label>
        </div>
    );
};

export default Input;
