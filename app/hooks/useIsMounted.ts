import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function useIsMounted() {
    return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
