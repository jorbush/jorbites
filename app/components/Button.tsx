import { IconType } from "react-icons";
import { useState, useEffect } from "react";

interface ButtonProps {
  label: string;
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
  disabled?: boolean;
  outline?: boolean;
  small?: boolean;
  icon?: IconType;
  withDelay?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  label,
  onClick,
  disabled,
  outline,
  small,
  icon: Icon,
  withDelay = false,
}) => {
  const [isDisabled, setIsDisabled] = useState(false);

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!disabled && !isDisabled) {
      onClick(e);
      if (withDelay) {
        setIsDisabled(true);
        setTimeout(() => {
          setIsDisabled(false);
        }, 2000);
      }
    }
  };

  return (
    <button
      disabled={disabled || isDisabled}
      onClick={handleButtonClick}
      className={`
        relative
        disabled:opacity-70
        disabled:cursor-not-allowed
        rounded-lg
        hover:opacity-80
        transition
        w-full
        ${outline ? "bg-white" : "bg-green-450"}
        ${outline ? "border-black" : "border-green-450"}
        ${outline ? "text-black" : "text-white"}
        ${small ? "text-sm" : "text-md"}
        ${small ? "py-1" : "py-3"}
        ${small ? "font-light" : "font-semibold"}
        ${small ? "border-[1px]" : "border-2"}
      `}
    >
      {Icon && (
        <Icon
          size={24}
          className="
            absolute
            left-4
            top-3
          "
        />
      )}
      {label}
    </button>
  );
};

export default Button;
