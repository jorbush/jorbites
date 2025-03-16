'use client';
import { FaBan } from 'react-icons/fa';

export const BannedIcon = ({
    Icon,
    size,
}: {
    Icon: React.ElementType;
    size: number;
}) => (
    <div className="relative">
        <Icon size={size} />
        <div className="absolute inset-0 -translate-x-2 -translate-y-2 opacity-50">
            <FaBan size={size + 15} />
        </div>
    </div>
);
