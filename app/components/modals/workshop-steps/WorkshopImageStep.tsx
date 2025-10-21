'use client';

import { useTranslation } from 'react-i18next';
import Heading from '@/app/components/navigation/Heading';
import ImageUpload from '@/app/components/inputs/ImageUpload';

interface WorkshopImageStepProps {
    imageSrc: string;
    onImageChange: (value: string) => void;
}

const WorkshopImageStep: React.FC<WorkshopImageStepProps> = ({
    imageSrc,
    onImageChange,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-8">
            <Heading
                title={t('workshop_image')}
                subtitle={t('workshop_image_subtitle') ?? ''}
            />
            <ImageUpload
                value={imageSrc}
                onChange={onImageChange}
                text={t('workshop_image') ?? 'Workshop image'}
            />
        </div>
    );
};

export default WorkshopImageStep;
