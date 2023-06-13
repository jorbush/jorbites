'use client';

import Image from "next/image";
import { useRouter } from "next/navigation";

const Logo = () => {
    const router = useRouter();

    let logoImagePath = "/images/logo-nobg.png"; 
  
    if (localStorage.getItem('theme') === "dark") {
      logoImagePath = "/images/no_bg_white.png";
    }
    
    return (
        <Image
            onClick={() => router.push('/')}
            alt="Logo"
            className="md:block cursor-pointer"
            height="100"
            width="100"
            src={logoImagePath}
        />
    )
}

export default Logo;