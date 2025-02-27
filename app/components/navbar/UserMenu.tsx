'use client';

import Avatar from '../Avatar';
import { useCallback, useEffect, useRef, useState } from 'react';
import MenuItem from './MenuItem';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import { signOut } from 'next-auth/react';
import { SafeUser } from '@/app/types';
import useRecipeModal from '@/app/hooks/useRecipeModal';
import useSettingsModal from '@/app/hooks/useSettingsModal';
import { useTranslation } from 'react-i18next';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
    currentUser?: SafeUser | null;
}

const UserMenu: React.FC<UserMenuProps> = ({ currentUser }) => {
    const registerModal = useRegisterModal();
    const loginModal = useLoginModal();
    const recipeModal = useRecipeModal();
    const settingsModal = useSettingsModal();
    const [isOpen, setIsOpen] = useState(false);
    const { t } = useTranslation();
    const router = useRouter();
    const menuRef = useRef<HTMLDivElement>(null);

    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value);
    }, []);

    const onPost = useCallback(() => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
        recipeModal.onOpen();
    }, [currentUser, loginModal, recipeModal]);

    const handleClickOutside = useCallback((event: MouseEvent) => {
        if (
            menuRef.current &&
            !menuRef.current.contains(event.target as Node)
        ) {
            setIsOpen(false);
        }
    }, []);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, handleClickOutside]);

    return (
        <div
            className="relative z-50"
            ref={menuRef}
        >
            <div className="flex flex-row items-center gap-2 md:gap-3">
                <div
                    onClick={onPost}
                    className="hidden cursor-pointer rounded-full border-[1px] px-3 py-2 text-xs font-semibold transition hover:bg-neutral-100 hover:text-black dark:text-neutral-100 sm:block sm:text-sm md:px-4 md:py-3"
                    data-cy="post-recipe"
                >
                    <span className="whitespace-nowrap">
                        {t('post_recipe')}
                    </span>
                </div>
                <div
                    onClick={toggleOpen}
                    className="flex min-h-[40px] min-w-[40px] cursor-pointer flex-row items-center justify-center gap-3 rounded-full border-[1px] border-neutral-200 p-1 transition hover:shadow-md"
                    data-cy="user-menu"
                >
                    <div className="md:block">
                        <Avatar
                            src={currentUser?.image}
                            size={35}
                        />
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="absolute right-0 top-14 w-[40vw] overflow-hidden rounded-xl bg-white text-sm shadow-md dark:bg-dark dark:text-neutral-100 md:w-3/4">
                    <div className="flex cursor-pointer flex-col">
                        {currentUser ? (
                            <>
                                <MenuItem
                                    onClick={() => {
                                        recipeModal.onOpen();
                                        toggleOpen();
                                    }}
                                    label={t('post_recipe')}
                                    extraClasses="sm:hidden"
                                />
                                <MenuItem
                                    onClick={() => {
                                        router.push(
                                            '/profile/' + currentUser.id
                                        );
                                        toggleOpen();
                                    }}
                                    label={t('my_profile')}
                                />
                                <MenuItem
                                    onClick={() => {
                                        router.push('/favorites');
                                        toggleOpen();
                                    }}
                                    label={t('my_favorites')}
                                />
                                <MenuItem
                                    onClick={() => {
                                        router.push('/top-jorbiters');
                                        toggleOpen();
                                    }}
                                    label="Top Jorbiters"
                                    isNew
                                />
                                <MenuItem
                                    onClick={() => {
                                        settingsModal.onOpen();
                                        toggleOpen();
                                    }}
                                    label={t('settings')}
                                />
                                <MenuItem
                                    onClick={() => signOut()}
                                    label={t('logout')}
                                    dataCy="user-menu-logout"
                                />
                            </>
                        ) : (
                            <>
                                <MenuItem
                                    onClick={() => {
                                        router.push('/top-jorbiters');
                                        toggleOpen();
                                    }}
                                    label="Top Jorbiters"
                                    isNew
                                />
                                <MenuItem
                                    onClick={() => {
                                        settingsModal.onOpen();
                                        toggleOpen();
                                    }}
                                    label={t('settings')}
                                />
                                <MenuItem
                                    onClick={() => {
                                        loginModal.onOpen();
                                        toggleOpen();
                                    }}
                                    label={t('login')}
                                    dataCy="user-menu-login"
                                />
                                <MenuItem
                                    onClick={() => {
                                        registerModal.onOpen();
                                        toggleOpen();
                                    }}
                                    label={t('sign_up')}
                                />
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserMenu;
