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
                className={`truncate whitespace-normal text-justify text-2xl font-bold dark:text-neutral-100 ${
                    isLongWord ? 'break-all' : ''
                }`}
            >
                {title}
            </div>
            <div className="mt-2 font-light text-neutral-500">{subtitle}</div>
        </div>
    );
};

export default Heading;
