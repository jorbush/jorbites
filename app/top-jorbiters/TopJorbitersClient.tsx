'use client';

import React from 'react';
import { SafeUser } from '@/app/types';
import Container from '@/app/components/Container';
import Avatar from '@/app/components/Avatar';
import { useRouter } from 'next/navigation';
import { MdVerified } from 'react-icons/md';
import { FaTrophy, FaMedal } from 'react-icons/fa';
import { motion } from 'framer-motion';
import useMediaQuery from '@/app/hooks/useMediaQuery';
import getUserDisplayName from '@/app/utils/reponsive';
import { useTranslation } from 'react-i18next';

interface TopJorbitersClientProps {
    currentUser?: SafeUser | null;
    topJorbiters?: SafeUser[];
}

const TopJorbitersClient: React.FC<TopJorbitersClientProps> = ({
    currentUser,
    topJorbiters,
}) => {
    const router = useRouter();
    const isMdOrSmaller = useMediaQuery('(max-width: 675px)');
    const isSmOrSmaller = useMediaQuery('(max-width: 530px)');
    const { t } = useTranslation();

    const getMedalColor = (index: number) => {
        switch (index) {
            case 0:
                return 'text-yellow-400';
            case 1:
                return 'text-gray-400';
            case 2:
                return 'text-amber-600';
            default:
                return 'text-gray-300';
        }
    };

    const getRankIcon = (index: number) => {
        if (index === 0)
            return <FaTrophy className={`${getMedalColor(index)} text-2xl`} />;
        if (index <= 2)
            return <FaMedal className={`${getMedalColor(index)} text-2xl`} />;
        return (
            <span className="text-xl font-bold text-gray-400">
                #{index + 1}
            </span>
        );
    };

    const StatItem = ({
        value,
        label,
        flexDirection,
    }: {
        value: number;
        label: string;
        flexDirection: string;
    }) => (
        <div className={`flex flex-${flexDirection} items-center gap-1`}>
            <p
                className={`font-bold text-green-450 ${flexDirection !== 'row' ? 'text-lg' : 'text-sm'}`}
            >
                {value}
            </p>
            <p
                className={`text-xs text-gray-500 dark:text-gray-400 ${flexDirection !== 'row' ? 'text-sm' : 'text-xs'}`}
            >
                {label}
            </p>
        </div>
    );

    return (
        <Container>
            <div className="mx-auto max-w-screen-lg sm:px-2 md:px-4">
                {/* Header Section */}
                <div className="mb-10 text-center">
                    <h1 className="mb-3 text-3xl font-bold sm:text-4xl">
                        Top Jorbiters 👨‍🍳
                    </h1>
                    <p className="text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                        Los chefs más destacados de nuestra comunidad. ¡Sube
                        recetas para aumentar tu nivel y únete a la élite!
                    </p>
                </div>

                {/* Leaderboard Grid */}
                <div className="space-y-4">
                    {topJorbiters?.map((jorbiter, index) => (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            key={jorbiter.id}
                            className={`relative overflow-hidden rounded-lg border bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${
                                index < 3
                                    ? 'border- border-2' +
                                      getMedalColor(index).replace(
                                          'text',
                                          'border'
                                      )
                                    : ''
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                {/* Left section - Avatar and Basic Info */}
                                <div className="flex items-center space-x-2 sm:space-x-4">
                                    <div className="flex items-center justify-center">
                                        {getRankIcon(index)}
                                    </div>
                                    <div className="relative">
                                        <Avatar
                                            src={jorbiter.image}
                                            size={50}
                                            onClick={() =>
                                                router.push(
                                                    '/profile/' + jorbiter.id
                                                )
                                            }
                                            props="sm:h-[65px] sm:w-[65px] md:h-[70px] md:w-[70px]"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                        <div className="flex flex-row items-center gap-1">
                                            <div
                                                className="cursor-pointer text-base font-semibold sm:text-xl md:text-2xl"
                                                onClick={() =>
                                                    router.push(
                                                        '/profile/' +
                                                            jorbiter.id
                                                    )
                                                }
                                            >
                                                {getUserDisplayName(
                                                    jorbiter,
                                                    isMdOrSmaller,
                                                    isSmOrSmaller
                                                )}
                                            </div>
                                            {jorbiter.verified && (
                                                <MdVerified
                                                    className={`text-green-450 ${isMdOrSmaller ? 'text-lg' : 'text-xl'}`}
                                                />
                                            )}
                                        </div>
                                        <div className="sm:text-md text-sm text-gray-400 md:text-lg">{`${t('level')} ${jorbiter.level}`}</div>
                                    </div>
                                </div>

                                {/* Right section - Stats */}
                                <div
                                    className={`flex items-end gap-0 md:gap-6 ${isSmOrSmaller ? 'flex-col sm:gap-1' : 'flex-row sm:gap-6'}`}
                                >
                                    <StatItem
                                        value={jorbiter.recipeCount || 0}
                                        label="Recipes"
                                        flexDirection={
                                            isSmOrSmaller ? 'row' : 'col'
                                        }
                                    />
                                    <StatItem
                                        value={jorbiter.likesReceived || 0}
                                        label="Favorites"
                                        flexDirection={
                                            isSmOrSmaller ? 'row' : 'col'
                                        }
                                    />
                                    {jorbiter.badges && (
                                        <StatItem
                                            value={jorbiter.badges.length}
                                            label="Badges"
                                            flexDirection={
                                                isSmOrSmaller ? 'row' : 'col'
                                            }
                                        />
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Call to Action for non-ranked users */}
                {currentUser &&
                    !topJorbiters?.find((j) => j.id === currentUser.id) && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 rounded-lg bg-green-50 p-4 text-center dark:bg-gray-800 sm:p-6"
                        >
                            <h3 className="mb-2 text-lg font-semibold sm:text-xl">
                                ¿Quieres aparecer en el ranking?
                            </h3>
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                                Comparte tus mejores recetas y gana experiencia
                                para subir de nivel
                            </p>
                            <button
                                onClick={() => router.push('/create')}
                                className="rounded-full bg-green-450 px-4 py-2 text-sm text-white transition-colors hover:bg-green-500 sm:px-6 sm:text-base"
                            >
                                Crear Receta
                            </button>
                        </motion.div>
                    )}
                {/* Call to Action for ranked users that are not in the first place */}
                {currentUser &&
                    topJorbiters?.find((j) => j.id === currentUser.id) &&
                    topJorbiters?.findIndex((j) => j.id === currentUser.id) !==
                        0 && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 rounded-lg bg-green-50 p-4 text-center dark:bg-gray-800 sm:p-6"
                        >
                            <h3 className="mb-2 text-lg font-semibold sm:text-xl">
                                ¡Llega al primer puesto!
                            </h3>
                            <p className="mb-4 text-sm text-gray-600 dark:text-gray-300 sm:text-base">
                                Si alcanzas la primera posición podrás solicitar
                                tu verificación gratuita
                            </p>
                            <button
                                onClick={() => router.push('/create')}
                                className="rounded-full bg-green-450 px-4 py-2 text-sm text-white transition-colors hover:bg-green-500 sm:px-6 sm:text-base"
                            >
                                Crear Receta
                            </button>
                        </motion.div>
                    )}
            </div>
        </Container>
    );
};

export default TopJorbitersClient;
