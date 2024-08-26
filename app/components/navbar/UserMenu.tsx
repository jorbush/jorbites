'use client';

import Avatar from '../Avatar';
import { useCallback, useState } from 'react';
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

    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value);
    }, []);

    const onPost = useCallback(() => {
        if (!currentUser) {
            return loginModal.onOpen();
        }
        recipeModal.onOpen();
    }, [currentUser, loginModal, recipeModal]);

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">
                <div
                    onClick={onPost}
                    className="hidden cursor-pointer rounded-full border-[1px] px-4 py-3 text-sm font-semibold transition hover:bg-neutral-100 hover:text-black dark:text-neutral-100 sm:block"
                    data-cy="post-recipe"
                >
                    {t('post_recipe')}
                </div>
                <div
                    onClick={toggleOpen}
                    className="flex min-h-[40px] min-w-[40px] cursor-pointer flex-row items-center justify-center gap-3 rounded-full border-[1px] border-neutral-200 transition hover:shadow-md md:px-1 md:py-1"
                    data-cy="user-menu"
                >
                    <div className="md:block">
                        <Avatar src={currentUser?.image} />
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className="absolute right-0 top-12 w-[40vw] overflow-hidden rounded-xl bg-white text-sm shadow-md dark:bg-dark dark:text-neutral-100 md:w-3/4">
                    <div className="flex cursor-pointer flex-col">
                        {currentUser ? (
                            <>
                                <MenuItem
                                    onClick={() => {
                                        recipeModal.onOpen();
                                        toggleOpen();
                                    }}
                                    label={t('post_recipe')}
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
