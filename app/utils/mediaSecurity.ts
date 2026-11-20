/**
 * Pure O(1) media ownership helpers (zero database queries).
 *
 * Ownership is structurally encoded in storage paths:
 * - Cloudinary (signed uploads via /api/upload/cloudinary-sign): `users/<userId>/<asset>`
 * - Cloudflare R2 (presigned uploads via /api/upload/r2): `remakes/<userId>/<asset>`
 *
 * Assets without a matching user prefix (including foreign or legacy un-namespaced assets)
 * are never automatically deleted on API mutations, preventing cross-user media destruction
 * without introducing any database latency.
 */

function isCloudinaryAssetUrl(url: string): boolean {
    if (!url || typeof url !== 'string') return false;
    return url.includes('cloudinary.com');
}

function extractCloudinaryPublicId(url: string): string | null {
    if (!isCloudinaryAssetUrl(url)) return null;
    const uploadIdx = url.indexOf('/upload/');
    if (uploadIdx === -1) return null;
    const afterUpload = url.substring(uploadIdx + 8);
    const segments = afterUpload.split('/');
    let idx = 0;
    while (idx < segments.length - 1) {
        if (/_/.test(segments[idx]) || /^v\d+$/.test(segments[idx])) {
            idx++;
        } else {
            break;
        }
    }
    const last = segments[segments.length - 1].split('.')[0];
    const prefix = segments.slice(idx, -1);
    return prefix.length > 0 ? [...prefix, last].join('/') : last;
}

function extractR2AssetKey(url: string): string | null {
    if (!url || typeof url !== 'string') return null;
    try {
        if (url.startsWith('http://') || url.startsWith('https://')) {
            return new URL(url).pathname.replace(/^\/+/, '') || null;
        }
        return url.replace(/^\/+/, '') || null;
    } catch {
        return null;
    }
}

/**
 * Extracts the owning userId from a user-scoped Cloudinary URL (`.../upload/.../users/<userId>/<file>`).
 * Returns null for legacy or non-user-scoped Cloudinary assets.
 */
export function extractCloudinaryAssetOwner(imageUrl: string): string | null {
    const publicId = extractCloudinaryPublicId(imageUrl);
    if (!publicId) return null;
    const parts = publicId.split('/');
    if (parts.length >= 3 && parts[0] === 'users' && parts[1]) {
        return parts[1];
    }
    return null;
}

/**
 * Returns true only when the Cloudinary asset is explicitly scoped to `userId`.
 * Legacy un-namespaced assets return false so they cannot be deleted via cross-user IDOR.
 */
export function canDeleteCloudinaryAsset(
    imageUrl: string,
    userId: string
): boolean {
    if (!imageUrl || !userId) return false;
    const ownerId = extractCloudinaryAssetOwner(imageUrl);
    return ownerId !== null && ownerId === userId;
}

/**
 * Filters a list of Cloudinary URLs down to only those explicitly owned by `userId`.
 */
export function filterDeletableCloudinaryAssets(
    imageUrls: string[],
    userId: string
): string[] {
    return imageUrls.filter((url) => canDeleteCloudinaryAsset(url, userId));
}

/**
 * Extracts the owning userId from a user-scoped R2 URL or key (`remakes/<userId>/<file>`).
 * Returns null for legacy flat keys (`remakes/<file>`).
 */
export function extractR2AssetOwner(imageUrl: string): string | null {
    const key = extractR2AssetKey(imageUrl);
    if (!key) return null;
    const parts = key.split('/');
    if (parts.length === 3 && parts[0] === 'remakes' && parts[1]) {
        return parts[1];
    }
    return null;
}

/**
 * Returns true only when the R2 asset is explicitly scoped to `userId`.
 * Legacy flat keys return false so they cannot be deleted via cross-user IDOR.
 */
export function canDeleteR2Asset(imageUrl: string, userId: string): boolean {
    if (!imageUrl || !userId) return false;
    const ownerId = extractR2AssetOwner(imageUrl);
    return ownerId !== null && ownerId === userId;
}

/**
 * Verifies whether a user is allowed to attach an R2 URL on creation.
 * Rejects user-namespaced keys owned by another user.
 */
export function isR2AssetOwnedByUser(
    imageUrl: string,
    userId: string
): boolean {
    const ownerId = extractR2AssetOwner(imageUrl);
    if (!ownerId) {
        return true;
    }
    return ownerId === userId;
}
