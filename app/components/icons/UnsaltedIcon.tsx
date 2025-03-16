'use client';
import { TbSalt } from 'react-icons/tb';
import { BannedIcon } from '@/app/components/icons/BannedIcon';

export const UnsaltedIcon = (props: any) => (
    <BannedIcon
        Icon={TbSalt}
        size={props.size}
    />
);
