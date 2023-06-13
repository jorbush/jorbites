'use client';

import { AiOutlineMenu } from 'react-icons/ai'
import Avatar from '../Avatar';
import { useCallback, useState } from 'react';
import MenuItem from './MenuItem';
import useRegisterModal from '@/app/hooks/useRegisterModal';
import useLoginModal from '@/app/hooks/useLoginModal';
import { signOut } from 'next-auth/react';
import { SafeUser } from '@/app/types';
import useRecipeModal from '@/app/hooks/useRecipeModal';
import useSettingsModal from '@/app/hooks/useSettingsModal';

interface UserMenuProps {
    currentUser?: SafeUser | null
}

const UserMenu: React.FC<UserMenuProps> = ({
    currentUser
}) => {
    const registerModal = useRegisterModal()
    const loginModal = useLoginModal()
    const recipeModal = useRecipeModal()
    const settingsModal = useSettingsModal()
    const [isOpen, setIsOpen] = useState(false)

    const toggleOpen = useCallback(() => {
        setIsOpen((value) => !value)
    }, [])

    const onPost = useCallback(() =>{
        if (!currentUser){
            return loginModal.onOpen()
        }
        // open post a recipe
        recipeModal.onOpen()
    }, [currentUser, loginModal])

    return (
        <div className="relative">
            <div className="flex flex-row items-center gap-3">
                <div
                    onClick={onPost}
                    className="
                        hidden
                        border-[1px] 
                        text-sm
                        font-semibold
                        py-3
                        px-4
                        rounded-full
                        hover:bg-neutral-100
                        dark:text-neutral-100
                        hover:text-black  
                        transition
                        cursor-pointer
                        sm:block
                    "
                >
                    Post a recipe
                </div>
                <div
                    onClick={toggleOpen}
                    className="
                        md:py-1
                        md:px-1
                        border-[1px]
                        border-neutral-200
                        flex
                        flex-row
                        items-center
                        justify-center
                        gap-3
                        rounded-full
                        cursor-pointer
                        hover:shadow-md
                        transition
                        min-w-[40px]
                        min-h-[40px]
                    "
                >
                    <div className='md:block'>
                        <Avatar src={currentUser?.image}/>
                    </div>
                </div>
            </div>
            {isOpen && (
                <div className='
                    absolute
                    rounded-xl
                    shadow-md
                    w-[40vw]
                    md:w-3/4
                    bg-white
                    dark:bg-dark
                    dark:text-neutral-100
                    overflow-hidden
                    right-0
                    top-12
                    text-sm
                '>
                    <div className='flex flex-col cursor-pointer'>
                        {currentUser ? (
                            <>
                                <MenuItem
                                    onClick={recipeModal.onOpen}
                                    label='Post a recipe'
                                />
                                <MenuItem
                                    onClick={() => {}}
                                    label='My recipes'
                                />
                                <MenuItem
                                    onClick={() => {}}
                                    label='My favorites'
                                />
                                <MenuItem
                                    onClick={settingsModal.onOpen}
                                    label='Settings'
                                />
                                <MenuItem
                                    onClick={() => signOut()}
                                    label='Logout'
                                />
                            </>
                        ) : (
                            <>
                                <MenuItem
                                    onClick={settingsModal.onOpen}
                                    label='Settings'
                                />
                                <MenuItem
                                    onClick={loginModal.onOpen}
                                    label='Login'
                                />
                                <MenuItem
                                    onClick={registerModal.onOpen}
                                    label='Sign Up'
                                />
                            </>
                        )}
                        
                    </div>
                </div>
            )}
        </div>
    );
}

export default UserMenu