'use client';

import { useEffect, useRef, useCallback, useMemo } from 'react';
import axios from 'axios';
import useSWR from 'swr';
import { axiosFetcher } from '@/app/utils/fetcher';
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

const EMPTY_LOCKS: Record<string, LockOwnerInfo> = {};

export function useRecipeLock(
    targetId: string | null | undefined,
    currentUserId: string | null | undefined,
    activeField?: string | null
) {
    const lockEndpoint = targetId
        ? `/api/recipes/${encodeURIComponent(targetId)}/lock`
        : null;

    const { data: locksData, mutate: mutateLocks } = useSWR<
        Record<string, LockOwnerInfo>
    >(lockEndpoint, axiosFetcher, {
        refreshInterval: targetId ? LOCK_POLL_INTERVAL_MS : 0,
        revalidateOnFocus: true,
        shouldRetryOnError: false,
    });

    const locks = targetId && locksData ? locksData : EMPTY_LOCKS;

    const activeLockFieldRef = useRef<string | null>(null);
    const lastHeldTargetIdRef = useRef<string | null>(null);
    const targetIdRef = useRef(targetId);
    const currentUserIdRef = useRef(currentUserId);
    const activeFieldRef = useRef(activeField);

    useEffect(() => {
        targetIdRef.current = targetId;
        currentUserIdRef.current = currentUserId;
        activeFieldRef.current = activeField;
    }, [targetId, currentUserId, activeField]);

    const fetchLocks = useCallback(async () => {
        if (!targetIdRef.current) return null;
        try {
            const updated = await mutateLocks();
            if (updated && typeof updated === 'object') {
                return updated as Record<string, LockOwnerInfo>;
            }
        } catch (error) {
            console.error('Failed to fetch recipe locks', error);
        }
        return null;
    }, [mutateLocks]);

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

    // Re-try acquiring activeField if it becomes free on lock update
    useEffect(() => {
        if (!targetId || !locks) return;

        const desired = activeFieldRef.current;
        const uid = currentUserIdRef.current;
        if (
            desired &&
            uid &&
            activeLockFieldRef.current !== desired
        ) {
            const holder = locks[desired];
            if (!holder || holder.userId === uid) {
                acquire(desired);
            }
        }
    }, [targetId, locks, acquire]);

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
