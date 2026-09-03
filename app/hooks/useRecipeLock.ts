'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import {
    LOCK_HEARTBEAT_INTERVAL_MS,
    LOCK_POLL_INTERVAL_MS,
} from '@/app/utils/constants';

export interface LockOwnerInfo {
    userId: string;
    userName?: string;
    userAvatar?: string;
    timestamp: number;
}

export function useRecipeLock(
    targetId: string | null | undefined,
    currentUserId: string | null | undefined
) {
    const [locks, setLocks] = useState<Record<string, LockOwnerInfo>>({});
    const activeLockFieldRef = useRef<string | null>(null);

    const fetchLocks = useCallback(async () => {
        if (!targetId) return;
        try {
            const response = await axios.get(`/api/recipes/${targetId}/lock`);
            if (response.data && typeof response.data === 'object') {
                setLocks(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch recipe locks', error);
        }
    }, [targetId]);

    const acquire = useCallback(
        async (fieldKey: string) => {
            if (!targetId || !currentUserId) return false;
            try {
                const response = await axios.post(
                    `/api/recipes/${targetId}/lock`,
                    {
                        field: fieldKey,
                    }
                );

                if (response.data?.success) {
                    activeLockFieldRef.current = fieldKey;
                    await fetchLocks();
                    return true;
                } else {
                    await fetchLocks();
                    return false;
                }
            } catch (error) {
                console.error('Failed to acquire section lock', error);
                return false;
            }
        },
        [targetId, currentUserId, fetchLocks]
    );

    const release = useCallback(
        async (fieldKey?: string) => {
            const fieldToRelease = fieldKey || activeLockFieldRef.current;
            if (!targetId || !currentUserId || !fieldToRelease) return;

            try {
                await axios.delete(
                    `/api/recipes/${targetId}/lock?field=${encodeURIComponent(fieldToRelease)}`
                );
                if (activeLockFieldRef.current === fieldToRelease) {
                    activeLockFieldRef.current = null;
                }
                await fetchLocks();
            } catch (error) {
                console.error('Failed to release section lock', error);
            }
        },
        [targetId, currentUserId, fetchLocks]
    );

    // Heartbeat renewal for active lock
    useEffect(() => {
        if (!targetId || !currentUserId) return;

        const heartbeatInterval = setInterval(() => {
            if (activeLockFieldRef.current) {
                acquire(activeLockFieldRef.current);
            }
        }, LOCK_HEARTBEAT_INTERVAL_MS);

        return () => clearInterval(heartbeatInterval);
    }, [targetId, currentUserId, acquire]);

    // Poll active locks periodically
    useEffect(() => {
        if (!targetId) return;

        fetchLocks();
        const pollInterval = setInterval(() => {
            fetchLocks();
        }, LOCK_POLL_INTERVAL_MS);

        return () => clearInterval(pollInterval);
    }, [targetId, fetchLocks]);

    // Cleanup active lock on unmount
    useEffect(() => {
        const id = targetId;
        const uid = currentUserId;
        return () => {
            const activeField = activeLockFieldRef.current;
            if (activeField && id && uid) {
                axios
                    .delete(
                        `/api/recipes/${id}/lock?field=${encodeURIComponent(activeField)}`
                    )
                    .catch(() => {});
            }
        };
    }, [targetId, currentUserId]);

    const isLockedByOther = useCallback(
        (fieldKey: string) => {
            const lock = locks[fieldKey];
            if (!lock) return false;
            return lock.userId !== currentUserId;
        },
        [locks, currentUserId]
    );

    const getLockOwner = useCallback(
        (fieldKey: string) => {
            return locks[fieldKey] || null;
        },
        [locks]
    );

    return {
        locks,
        acquire,
        release,
        isLockedByOther,
        getLockOwner,
        fetchLocks,
    };
}
