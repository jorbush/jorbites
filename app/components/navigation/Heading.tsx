'use client';

interface HeadingProps {
    title: string;
    subtitle?: string;
    center?: boolean;
}

const Heading: React.FC<HeadingProps> = ({ title, subtitle, center }) => {
    const words = title.split(' ');
    const isLongWord = words.some((word) => word.length > 20);
    return (
        <div className={center ? 'text-center' : 'text-start'}>
            <div
                className={`text-center text-2xl font-bold whitespace-pre-wrap dark:text-neutral-100 ${
                    isLongWord ? 'break-words' : ''
                }`}
                data-cy="recipe-title-display"
            >
                {title}
            </div>
            <div className="mt-2 font-light text-neutral-500">{subtitle}</div>
        </div>
    );
};

export default Heading;
