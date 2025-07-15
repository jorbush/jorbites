'use client';

import { useTranslation } from 'react-i18next';
import { GiCookingPot, GiPressureCooker } from 'react-icons/gi';
import { MdMicrowave } from 'react-icons/md';
import { TbCooker } from 'react-icons/tb';
import { CgSmartHomeCooker } from 'react-icons/cg';
import Heading from '@/app/components/navigation/Heading';
import CategoryInput from '@/app/components/inputs/CategoryInput';

export const preparationMethods = [
    {
        label: 'Frying pan',
        icon: GiCookingPot,
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
];

interface MethodsStepProps {
    selectedMethod: string;
    onMethodSelect: (method: string) => void;
}

const MethodsStep: React.FC<MethodsStepProps> = ({
    selectedMethod,
    onMethodSelect,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-8">
            <Heading
                title={t('methods_title')}
                subtitle={t('methods_subtitle') ?? ''}
            />
            <div className="grid max-h-[50vh] grid-cols-2 gap-3 overflow-y-auto">
                {preparationMethods.map((item) => (
                    <div
                        key={item.label}
                        className="col-span-1"
                    >
                        <CategoryInput
                            onClick={(method) => onMethodSelect(method)}
                            selected={selectedMethod === item.label}
                            label={item.label}
                            icon={item.icon}
                            dataCy={`method-box-${item.label}`}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MethodsStep;
