import { GiBarbecue, GiCookingPot, GiPressureCooker } from 'react-icons/gi';
import { PiCookingPotFill, PiBowlFood } from 'react-icons/pi';
import { MdMicrowave } from 'react-icons/md';
import { TbCooker } from 'react-icons/tb';
import { CgSmartHomeCooker } from 'react-icons/cg';
import { PanIcon } from '@/app/components/icons/PanIcon';

export const preparationMethods = [
    {
        label: 'Frying pan',
        icon: PanIcon,
    },
    {
        label: 'Microwave',
        icon: MdMicrowave,
    },
    {
        label: 'Air fryer',
        icon: GiPressureCooker,
    },
    {
        label: 'Deep fryer',
        icon: CgSmartHomeCooker,
    },
    {
        label: 'Oven',
        icon: TbCooker,
    },
    {
        label: 'Pot',
        icon: GiCookingPot,
    },
    {
        label: 'Quick Pot',
        icon: PiCookingPotFill,
    },
    {
        label: 'No-cook',
        icon: PiBowlFood,
    },
    {
        label: 'Grilled',
        icon: GiBarbecue,
    },
];
