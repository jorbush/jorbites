'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
    currentUserId: string | null | undefined,
    activeField?: string | null
) {
    const [locks, setLocks] = useState<Record<string, LockOwnerInfo>>({});
    const activeLockFieldRef = useRef<string | null>(null);
    const lastHeldTargetIdRef = useRef<string | null>(null);
    const targetIdRef = useRef(targetId);
    const currentUserIdRef = useRef(currentUserId);
    const activeFieldRef = useRef(activeField);

    const prevTargetIdRef = useRef<string | null>(null);

    useEffect(() => {
        if (targetId !== prevTargetIdRef.current) {
            setLocks({});
            prevTargetIdRef.current = targetId;
        }
        targetIdRef.current = targetId;
        currentUserIdRef.current = currentUserId;
        activeFieldRef.current = activeField;
    }, [targetId, currentUserId, activeField]);

    const fetchLocks = useCallback(async () => {
        const id = targetIdRef.current;
        if (!id) return null;
        try {
            const response = await axios.get(`/api/recipes/${id}/lock`);
            if (response?.data && typeof response.data === 'object') {
                setLocks(response.data);
                return response.data as Record<string, LockOwnerInfo>;
            }
        } catch (error) {
            console.error('Failed to fetch recipe locks', error);
        }
        return null;
    }, []);

    const acquire = useCallback(
        async (fieldKey: string) => {
            const id = targetIdRef.current;
            const uid = currentUserIdRef.current;
            if (!id || !uid) return false;
            try {
                const response = await axios.post(`/api/recipes/${id}/lock`, {
                    field: fieldKey,
                });

                if (response?.data?.success) {
                    activeLockFieldRef.current = fieldKey;
                    lastHeldTargetIdRef.current = id;
                    await fetchLocks();
                    return true;
                } else {
                    if (activeLockFieldRef.current === fieldKey) {
                        activeLockFieldRef.current = null;
                    }
                    await fetchLocks();
                    return false;
                }
            } catch (error) {
                console.error('Failed to acquire section lock', error);
                return false;
            }
        },
        [fetchLocks]
    );

    const release = useCallback(
        async (fieldKey?: string, explicitTargetId?: string | null) => {
            const id =
                explicitTargetId ||
                lastHeldTargetIdRef.current ||
                targetIdRef.current;
            const uid = currentUserIdRef.current;
            const fieldToRelease = fieldKey || activeLockFieldRef.current;
            if (!id || !uid || !fieldToRelease) return;

            // Synchronously clear active lock ref to prevent duplicate release calls (C5)
            if (activeLockFieldRef.current === fieldToRelease) {
                activeLockFieldRef.current = null;
            }

            try {
                await axios.delete(
                    `/api/recipes/${id}/lock?field=${encodeURIComponent(fieldToRelease)}`
                );
                await fetchLocks();
            } catch (error) {
                console.error('Failed to release section lock', error);
            }
        },
        [fetchLocks]
    );

    // Automatically manage active field lock lifecycle (acquire on mount/change, release on exit)
    useEffect(() => {
        if (!targetId || !currentUserId || !activeField) {
            if (activeLockFieldRef.current) {
                const held = activeLockFieldRef.current;
                activeLockFieldRef.current = null;
                release(held, lastHeldTargetIdRef.current || targetId);
            }
            return;
        }

        acquire(activeField);

        return () => {
            const held = activeLockFieldRef.current;
            if (held && held === activeField) {
                activeLockFieldRef.current = null;
                release(held, targetId);
            }
        };
    }, [targetId, currentUserId, activeField, acquire, release]);

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

    // Poll active locks periodically and re-try acquiring if activeField becomes free
    useEffect(() => {
        if (!targetId) return;

        fetchLocks();
        const pollInterval = setInterval(async () => {
            const latestLocks = await fetchLocks();
            const desired = activeFieldRef.current;
            const uid = currentUserIdRef.current;
            if (
                desired &&
                uid &&
                activeLockFieldRef.current !== desired &&
                latestLocks
            ) {
                const holder = latestLocks[desired];
                if (!holder || holder.userId === uid) {
                    acquire(desired);
                }
            }
        }, LOCK_POLL_INTERVAL_MS);

        return () => clearInterval(pollInterval);
    }, [targetId, fetchLocks, acquire]);

    // Cleanup active lock on unmount
    useEffect(() => {
        const id = targetId;
        const uid = currentUserId;
        return () => {
            const activeField = activeLockFieldRef.current;
            if (activeField && id && uid) {
                activeLockFieldRef.current = null;
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

    return useMemo(
        () => ({
            locks,
            acquire,
            release,
            isLockedByOther,
            getLockOwner,
            fetchLocks,
        }),
        [locks, acquire, release, isLockedByOther, getLockOwner, fetchLocks]
    );
}
