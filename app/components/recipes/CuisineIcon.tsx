'use client';

import React from 'react';

interface CuisineIconProps {
    cuisine: string;
    size?: number;
    className?: string;
}

export const CuisineIcon: React.FC<CuisineIconProps> = ({
    cuisine,
    size = 20,
    className = '',
}) => {
    const normalized = cuisine.trim();
    const id = `clip-${normalized.toLowerCase().replace(/\s+/g, '-')}`;

    // Helper wrapper for circular clip
    const renderCircularFlag = (content: React.ReactNode) => (
        <svg
            width={size}
            height={size}
            viewBox="0 0 100 100"
            className={`inline-block shrink-0 rounded-full shadow-xs ${className}`}
            xmlns="http://www.w3.org/2000/svg"
        >
            <defs>
                <clipPath id={id}>
                    <circle
                        cx="50"
                        cy="50"
                        r="50"
                    />
                </clipPath>
            </defs>
            <g clipPath={`url(#${id})`}>{content}</g>
        </svg>
    );

    switch (normalized) {
        case 'Spanish':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="25"
                        fill="#C60B1E"
                    />
                    <rect
                        y="25"
                        width="100"
                        height="50"
                        fill="#FBE122"
                    />
                    <rect
                        y="75"
                        width="100"
                        height="25"
                        fill="#C60B1E"
                    />
                </>
            );
        case 'Catalan':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#FBE122"
                    />
                    <rect
                        y="11"
                        width="100"
                        height="11"
                        fill="#C60B1E"
                    />
                    <rect
                        y="33"
                        width="100"
                        height="11"
                        fill="#C60B1E"
                    />
                    <rect
                        y="55"
                        width="100"
                        height="11"
                        fill="#C60B1E"
                    />
                    <rect
                        y="77"
                        width="100"
                        height="11"
                        fill="#C60B1E"
                    />
                </>
            );
        case 'Italian':
            return renderCircularFlag(
                <>
                    <rect
                        width="33.3"
                        height="100"
                        fill="#008C45"
                    />
                    <rect
                        x="33.3"
                        width="33.4"
                        height="100"
                        fill="#F4F9FF"
                    />
                    <rect
                        x="66.7"
                        width="33.3"
                        height="100"
                        fill="#CD212A"
                    />
                </>
            );
        case 'Mexican':
            return renderCircularFlag(
                <>
                    <rect
                        width="33.3"
                        height="100"
                        fill="#006847"
                    />
                    <rect
                        x="33.3"
                        width="33.4"
                        height="100"
                        fill="#FFFFFF"
                    />
                    <rect
                        x="66.7"
                        width="33.3"
                        height="100"
                        fill="#C8102E"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="8"
                        fill="#C69214"
                    />
                </>
            );
        case 'Japanese':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#FFFFFF"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="25"
                        fill="#BC002D"
                    />
                </>
            );
        case 'Chinese':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#DE2910"
                    />
                    <polygon
                        points="25,15 28,24 37,24 30,30 33,39 25,33 17,39 20,30 13,24 22,24"
                        fill="#FFDE00"
                    />
                </>
            );
        case 'Indian':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="33.3"
                        fill="#FF9933"
                    />
                    <rect
                        y="33.3"
                        width="100"
                        height="33.4"
                        fill="#FFFFFF"
                    />
                    <rect
                        y="66.7"
                        width="100"
                        height="33.3"
                        fill="#138808"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="8"
                        fill="none"
                        stroke="#000080"
                        strokeWidth="2"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="2"
                        fill="#000080"
                    />
                </>
            );
        case 'French':
            return renderCircularFlag(
                <>
                    <rect
                        width="33.3"
                        height="100"
                        fill="#002395"
                    />
                    <rect
                        x="33.3"
                        width="33.4"
                        height="100"
                        fill="#FFFFFF"
                    />
                    <rect
                        x="66.7"
                        width="33.3"
                        height="100"
                        fill="#ED2939"
                    />
                </>
            );
        case 'American':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#FFFFFF"
                    />
                    <rect
                        y="0"
                        width="100"
                        height="7.7"
                        fill="#B22234"
                    />
                    <rect
                        y="15.4"
                        width="100"
                        height="7.7"
                        fill="#B22234"
                    />
                    <rect
                        y="30.8"
                        width="100"
                        height="7.7"
                        fill="#B22234"
                    />
                    <rect
                        y="46.2"
                        width="100"
                        height="7.7"
                        fill="#B22234"
                    />
                    <rect
                        y="61.5"
                        width="100"
                        height="7.7"
                        fill="#B22234"
                    />
                    <rect
                        y="76.9"
                        width="100"
                        height="7.7"
                        fill="#B22234"
                    />
                    <rect
                        y="92.3"
                        width="100"
                        height="7.7"
                        fill="#B22234"
                    />
                    <rect
                        width="50"
                        height="53.8"
                        fill="#3C3B6E"
                    />
                    <polygon
                        points="12,15 14,20 19,20 15,23 17,28 12,25 7,28 9,23 5,20 10,20"
                        fill="#FFFFFF"
                    />
                    <polygon
                        points="25,15 27,20 32,20 28,23 30,28 25,25 20,28 22,23 18,20 23,20"
                        fill="#FFFFFF"
                    />
                    <polygon
                        points="38,15 40,20 45,20 41,23 43,28 38,25 33,28 35,23 31,20 36,20"
                        fill="#FFFFFF"
                    />
                    <polygon
                        points="18,30 20,35 25,35 21,38 23,43 18,40 13,43 15,38 11,35 16,35"
                        fill="#FFFFFF"
                    />
                    <polygon
                        points="31,30 33,35 38,35 34,38 36,43 31,40 26,43 28,38 24,35 29,35"
                        fill="#FFFFFF"
                    />
                </>
            );
        case 'Mediterranean':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#38BDF8"
                    />
                    <path
                        d="M0,70 Q25,60 50,70 T100,70 L100,100 L0,100 Z"
                        fill="#0284C7"
                    />
                    <path
                        d="M0,80 Q25,75 50,80 T100,80 L100,100 L0,100 Z"
                        fill="#0369A1"
                    />
                    <circle
                        cx="50"
                        cy="40"
                        r="15"
                        fill="#FBA919"
                    />
                </>
            );
        case 'Middle Eastern':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#F97316"
                    />
                    <circle
                        cx="55"
                        cy="50"
                        r="25"
                        fill="#FEF08A"
                    />
                    <circle
                        cx="63"
                        cy="47"
                        r="23"
                        fill="#F97316"
                    />
                </>
            );
        case 'Greek':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#0D5EAF"
                    />
                    <rect
                        y="11.1"
                        width="100"
                        height="11.1"
                        fill="#FFFFFF"
                    />
                    <rect
                        y="33.3"
                        width="100"
                        height="11.1"
                        fill="#FFFFFF"
                    />
                    <rect
                        y="55.6"
                        width="100"
                        height="11.1"
                        fill="#FFFFFF"
                    />
                    <rect
                        y="77.8"
                        width="100"
                        height="11.1"
                        fill="#FFFFFF"
                    />
                    <rect
                        width="55.6"
                        height="55.6"
                        fill="#0D5EAF"
                    />
                    <rect
                        x="22.2"
                        width="11.1"
                        height="55.6"
                        fill="#FFFFFF"
                    />
                    <rect
                        y="22.2"
                        width="55.6"
                        height="11.1"
                        fill="#FFFFFF"
                    />
                </>
            );
        case 'Thai':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="16.7"
                        fill="#A51931"
                    />
                    <rect
                        y="16.7"
                        width="100"
                        height="16.7"
                        fill="#F4F5F8"
                    />
                    <rect
                        y="33.4"
                        width="100"
                        height="33.3"
                        fill="#2D2A4A"
                    />
                    <rect
                        y="66.7"
                        width="100"
                        height="16.7"
                        fill="#F4F5F8"
                    />
                    <rect
                        y="83.4"
                        width="100"
                        height="16.7"
                        fill="#A51931"
                    />
                </>
            );
        case 'Vietnamese':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#DA251D"
                    />
                    <polygon
                        points="50,25 53.5,36 65,36 55.7,43 59.2,54 50,47 40.8,54 44.3,43 35,36 46.5,36"
                        fill="#FFFF00"
                    />
                </>
            );
        case 'Moroccan':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#C1272D"
                    />
                    <polygon
                        points="50,28 54.1,41 68,41 57,49 61.1,62 50,54 38.9,62 43,49 32,41 45.9,41"
                        fill="none"
                        stroke="#006233"
                        strokeWidth="3.5"
                    />
                </>
            );
        case 'Turkish':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#E30A17"
                    />
                    <circle
                        cx="45"
                        cy="50"
                        r="18"
                        fill="#FFFFFF"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="14.4"
                        fill="#E30A17"
                    />
                    <polygon
                        points="63,44 65.5,49.5 71,50 67,54 68.5,59.5 63,56.5 57.5,59.5 59,54 55,50 60.5,49.5"
                        fill="#FFFFFF"
                    />
                </>
            );
        case 'Latin American':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#74ACDF"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="15"
                        fill="#F6B426"
                    />
                    <path
                        d="M50,20 L50,80 M20,50 L80,50 M29,29 L71,71 M29,71 L71,29"
                        stroke="#F6B426"
                        strokeWidth="4"
                    />
                </>
            );
        case 'Caribbean':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#00E5FF"
                    />
                    <circle
                        cx="70"
                        cy="35"
                        r="20"
                        fill="#FFEB3B"
                    />
                    <ellipse
                        cx="25"
                        cy="90"
                        rx="35"
                        ry="15"
                        fill="#FFE082"
                    />
                    <path
                        d="M25,85 Q20,65 15,45"
                        fill="none"
                        stroke="#8D6E63"
                        strokeWidth="4.5"
                    />
                    <path
                        d="M15,45 Q5,48 0,55"
                        fill="none"
                        stroke="#2E7D32"
                        strokeWidth="3"
                    />
                    <path
                        d="M15,45 Q8,35 5,28"
                        fill="none"
                        stroke="#2E7D32"
                        strokeWidth="3"
                    />
                    <path
                        d="M15,45 Q20,32 28,30"
                        fill="none"
                        stroke="#2E7D32"
                        strokeWidth="3"
                    />
                    <path
                        d="M15,45 Q25,48 32,55"
                        fill="none"
                        stroke="#2E7D32"
                        strokeWidth="3"
                    />
                </>
            );
        case 'Nordic':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#BA0C2F"
                    />
                    <rect
                        x="25"
                        width="22"
                        height="100"
                        fill="#FFFFFF"
                    />
                    <rect
                        y="39"
                        width="100"
                        height="22"
                        fill="#FFFFFF"
                    />
                    <rect
                        x="30"
                        width="12"
                        height="100"
                        fill="#00205B"
                    />
                    <rect
                        y="44"
                        width="100"
                        height="12"
                        fill="#00205B"
                    />
                </>
            );
        case 'British':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#00247D"
                    />
                    <path
                        d="M0,0 L100,100 M100,0 L0,100"
                        stroke="#FFFFFF"
                        strokeWidth="12"
                    />
                    <path
                        d="M0,0 L100,100 M100,0 L0,100"
                        stroke="#CF142B"
                        strokeWidth="5"
                    />
                    <path
                        d="M50,0 L50,100 M0,50 L100,50"
                        stroke="#FFFFFF"
                        strokeWidth="20"
                    />
                    <path
                        d="M50,0 L50,100 M0,50 L100,50"
                        stroke="#CF142B"
                        strokeWidth="12"
                    />
                </>
            );
        case 'German':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="33.3"
                        fill="#000000"
                    />
                    <rect
                        y="33.3"
                        width="100"
                        height="33.4"
                        fill="#DD0000"
                    />
                    <rect
                        y="66.7"
                        width="100"
                        height="33.3"
                        fill="#FFCC00"
                    />
                </>
            );
        case 'Eastern European':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="33.3"
                        fill="#FFFFFF"
                    />
                    <rect
                        y="33.3"
                        width="100"
                        height="33.4"
                        fill="#0039A6"
                    />
                    <rect
                        y="66.7"
                        width="100"
                        height="33.3"
                        fill="#D52B1E"
                    />
                </>
            );
        case 'African':
            return renderCircularFlag(
                <>
                    <defs>
                        <linearGradient
                            id="sunset-grad"
                            x1="0%"
                            y1="0%"
                            x2="0%"
                            y2="100%"
                        >
                            <stop
                                offset="0%"
                                stopColor="#EA580C"
                            />
                            <stop
                                offset="60%"
                                stopColor="#EAB308"
                            />
                            <stop
                                offset="100%"
                                stopColor="#15803D"
                            />
                        </linearGradient>
                    </defs>
                    <rect
                        width="100"
                        height="100"
                        fill="url(#sunset-grad)"
                    />
                    <path
                        d="M45,100 L47,70 C40,65 30,55 35,45 C45,55 48,60 50,65 C51,55 58,45 65,40 C62,55 56,62 53,70 L55,100 Z"
                        fill="#1C1917"
                    />
                    <ellipse
                        cx="32"
                        cy="42"
                        rx="15"
                        ry="5"
                        fill="#1C1917"
                    />
                    <ellipse
                        cx="68"
                        cy="38"
                        rx="20"
                        ry="7"
                        fill="#1C1917"
                    />
                    <ellipse
                        cx="50"
                        cy="32"
                        rx="25"
                        ry="8"
                        fill="#1C1917"
                    />
                </>
            );
        case 'Asian Fusion':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#0D9488"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="30"
                        fill="none"
                        stroke="#CCFBF1"
                        strokeWidth="2.5"
                    />
                    <line
                        x1="30"
                        y1="20"
                        x2="65"
                        y2="75"
                        stroke="#FFFFFF"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                    />
                    <line
                        x1="25"
                        y1="28"
                        x2="60"
                        y2="83"
                        stroke="#FFFFFF"
                        strokeWidth="4.5"
                        strokeLinecap="round"
                    />
                    <line
                        x1="70"
                        y1="25"
                        x2="40"
                        y2="70"
                        stroke="#FEF08A"
                        strokeWidth="4"
                        strokeLinecap="round"
                    />
                    <path
                        d="M60,35 L68,23 M64,38 L72,26 M68,41 L76,29"
                        stroke="#FEF08A"
                        strokeWidth="2"
                        strokeLinecap="round"
                    />
                </>
            );
        case 'International':
            return renderCircularFlag(
                <>
                    <rect
                        width="100"
                        height="100"
                        fill="#4F46E5"
                    />
                    <circle
                        cx="50"
                        cy="50"
                        r="38"
                        fill="none"
                        stroke="#C7D2FE"
                        strokeWidth="3"
                    />
                    <ellipse
                        cx="50"
                        cy="50"
                        rx="38"
                        ry="16"
                        fill="none"
                        stroke="#C7D2FE"
                        strokeWidth="2"
                    />
                    <ellipse
                        cx="50"
                        cy="50"
                        rx="16"
                        ry="38"
                        fill="none"
                        stroke="#C7D2FE"
                        strokeWidth="2"
                    />
                    <line
                        x1="12"
                        y1="50"
                        x2="88"
                        y2="50"
                        stroke="#C7D2FE"
                        strokeWidth="2"
                    />
                    <line
                        x1="50"
                        y1="12"
                        x2="50"
                        y2="88"
                        stroke="#C7D2FE"
                        strokeWidth="2"
                    />
                </>
            );
        default:
            return <span className="text-lg">🌍</span>;
    }
};
