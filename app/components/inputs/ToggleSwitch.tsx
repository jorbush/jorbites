'use client';

interface ToggleSwitchProps {
    checked: boolean;
    onChange: () => void;
    label?: string;
    dataCy?: string;
    disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({
    checked,
    onChange,
    label,
    dataCy,
    disabled,
}) => {
    return (
        <div className="flex items-center gap-2">
            {label && (
                <span className="text-sm text-neutral-600 dark:text-neutral-400">
                    {label}
                </span>
            )}
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                onClick={onChange}
                data-cy={dataCy}
                disabled={disabled}
                className={`relative inline-flex h-6 w-11 cursor-pointer items-center rounded-full transition-colors focus:ring-2 focus:ring-neutral-400 focus:ring-offset-2 focus:outline-none disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-neutral-900 ${
                    checked
                        ? 'bg-green-450'
                        : 'bg-neutral-300 dark:bg-neutral-600'
                }`}
            >
                <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        checked ? 'translate-x-6' : 'translate-x-1'
                    }`}
                />
            </button>
        </div>
    );
};

export default ToggleSwitch;
