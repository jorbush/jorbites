import { SafeUser } from '@/app/types';

const getUserDisplayName = (
    user: SafeUser | null | undefined,
    isMdOrSmaller: boolean,
    isSmOrSmaller: boolean
) => {
    if (!user?.name) return '';
    const parts = user.name.split(' ');
    const firstName = parts[0];
    const lastName = parts[1] || '';
    if (lastName.length === 0) return firstName;
    const fullNameLength = user.name.length;
    if (isMdOrSmaller) {
        if (
            isSmOrSmaller ||
            fullNameLength > 20 ||
            (lastName && /^[a-z]/.test(lastName))
        ) {
            return firstName;
        } else {
            return `${firstName} ${lastName}`;
        }
    }
    return user.name;
};
export default getUserDisplayName;
