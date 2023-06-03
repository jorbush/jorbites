'use client';

import { useCallback, useState } from "react";
import Container from "../Container";
import Categories from "./Categories";
import Search from "./Search";
import UserMenu from "./UserMenu";
import { SafeUser } from "@/app/types";

interface NavbarProps {
    currentUser?: SafeUser | null 
}

const Navbar: React.FC<NavbarProps> = ({
    currentUser
}) => {
    //console.log({currentUser})

    const [isFilterOpen, setIsFilterOpen] = useState(false)

    const filterOpen = useCallback(() => {
        setIsFilterOpen((value) => !value)
    }, [])
    
    return (
        <div className="fixed w-full bg-white z-10 shadow-sm">
            <div className="py-4 border-b-[1px]">
                <Container> 
                    <div className="
                        flex
                        flex-row
                        items-center
                        justify-between
                        gap-3
                        md:gap-0
                    ">
                        <Search onClick={filterOpen}/>
                        <UserMenu currentUser={currentUser}/>
                    </div>
                </Container>
            </div>
            {isFilterOpen && (<Categories />)}
        </div>
    );
}

export default Navbar