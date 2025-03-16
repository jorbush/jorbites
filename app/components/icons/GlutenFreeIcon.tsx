'use client';
import { GiWheat } from 'react-icons/gi';
import { BannedIcon } from '@/app/components/icons/BannedIcon';

export const GlutenFreeIcon = (props: any) => (
    <BannedIcon
        Icon={GiWheat}
        size={props.size}
    />
);
