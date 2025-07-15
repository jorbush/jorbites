'use client';

import { useTranslation } from 'react-i18next';
import Heading from '@/app/components/navigation/Heading';
import ImageUpload from '@/app/components/inputs/ImageUpload';

interface ImagesStepProps {
    imageSrc: string;
    imageSrc1: string;
    imageSrc2: string;
    imageSrc3: string;
    onImageChange: (field: string, value: string) => void;
}

const ImagesStep: React.FC<ImagesStepProps> = ({
    imageSrc,
    imageSrc1,
    imageSrc2,
    imageSrc3,
    onImageChange,
}) => {
    const { t } = useTranslation();

    return (
        <div className="flex flex-col gap-8">
            <Heading
                title={t('images')}
                subtitle={t('images_subtitle') ?? ''}
            />
            <div className="grid grid-cols-2 gap-4">
                <ImageUpload
                    data-testid="image-upload"
                    value={imageSrc}
                    onChange={(value) => onImageChange('imageSrc', value)}
                    canRemove={imageSrc1 === ''}
                    text={t('finished_recipe') ?? 'Finished recipe'}
                />
                <ImageUpload
                    data-testid="image-upload-2"
                    value={imageSrc1}
                    onChange={(value) => onImageChange('imageSrc1', value)}
                    disabled={imageSrc === ''}
                    canRemove={imageSrc2 === ''}
                    text={t('first_steps') ?? 'First steps'}
                />
                <ImageUpload
                    data-testid="image-upload-3"
                    value={imageSrc2}
                    onChange={(value) => onImageChange('imageSrc2', value)}
                    disabled={imageSrc1 === ''}
                    canRemove={imageSrc3 === ''}
                    text={t('next_steps') ?? 'Next steps'}
                />
                <ImageUpload
                    data-testid="image-upload-4"
                    value={imageSrc3}
                    onChange={(value) => onImageChange('imageSrc3', value)}
                    disabled={imageSrc2 === ''}
                    text={t('final_steps') ?? 'Final steps'}
                />
            </div>
        </div>
    );
};

export default ImagesStep;
