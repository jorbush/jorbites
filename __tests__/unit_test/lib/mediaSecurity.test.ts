import { expect } from '@jest/globals';
import {
    extractCloudinaryAssetOwner,
    canDeleteCloudinaryAsset,
    filterDeletableCloudinaryAssets,
    extractR2AssetOwner,
    canDeleteR2Asset,
    isR2AssetOwnedByUser,
} from '@/app/utils/mediaSecurity';
import { safeCompareSecret } from '@/app/utils/cryptoUtils';

describe('mediaSecurity (O(1) zero-DB ownership) & cryptoUtils', () => {
    describe('Cloudinary ownership checks', () => {
        it('extracts userId from user-scoped Cloudinary URLs (with or without transforms)', () => {
            expect(
                extractCloudinaryAssetOwner(
                    'https://res.cloudinary.com/demo/image/upload/v1700000000/users/user-1/avatar.webp'
                )
            ).toBe('user-1');
            expect(
                extractCloudinaryAssetOwner(
                    'https://res.cloudinary.com/demo/image/upload/w_400,h_400/v1700000000/users/user-1/dish.jpg'
                )
            ).toBe('user-1');
            expect(
                extractCloudinaryAssetOwner(
                    'https://res.cloudinary.com/demo/image/upload/v1700000000/legacy_flat_id.jpg'
                )
            ).toBeNull();
        });

        it('only permits deleting Cloudinary assets explicitly owned by the user', () => {
            expect(
                canDeleteCloudinaryAsset(
                    'https://res.cloudinary.com/demo/image/upload/v1/users/user-1/pic.jpg',
                    'user-1'
                )
            ).toBe(true);
            expect(
                canDeleteCloudinaryAsset(
                    'https://res.cloudinary.com/demo/image/upload/v1/users/victim-2/pic.jpg',
                    'user-1'
                )
            ).toBe(false);
            expect(
                canDeleteCloudinaryAsset(
                    'https://res.cloudinary.com/demo/image/upload/v1/legacy_flat.jpg',
                    'user-1'
                )
            ).toBe(false);
        });

        it('filters Cloudinary deletion lists to only owned assets', () => {
            const safe = filterDeletableCloudinaryAssets(
                [
                    'https://res.cloudinary.com/demo/image/upload/v1/users/victim/pic.jpg',
                    'https://res.cloudinary.com/demo/image/upload/v1/legacy.jpg',
                    'https://res.cloudinary.com/demo/image/upload/v1/users/user-1/own.jpg',
                ],
                'user-1'
            );

            expect(safe).toEqual([
                'https://res.cloudinary.com/demo/image/upload/v1/users/user-1/own.jpg',
            ]);
        });
    });

    describe('R2 ownership checks', () => {
        it('extracts userId from user-scoped R2 URLs and returns null for legacy flat keys', () => {
            expect(
                extractR2AssetOwner(
                    'https://images.jorbites.com/remakes/user-1/12345-abcdef.webp'
                )
            ).toBe('user-1');
            expect(
                extractR2AssetOwner(
                    'https://images.jorbites.com/remakes/12345-abcdef.webp'
                )
            ).toBeNull();
        });

        it('only permits deleting R2 assets explicitly owned by the user', () => {
            expect(
                canDeleteR2Asset(
                    'https://images.jorbites.com/remakes/user-1/12345-abcdef.webp',
                    'user-1'
                )
            ).toBe(true);
            expect(
                canDeleteR2Asset(
                    'https://images.jorbites.com/remakes/victim-2/12345-abcdef.webp',
                    'user-1'
                )
            ).toBe(false);
            expect(
                canDeleteR2Asset(
                    'https://images.jorbites.com/remakes/12345-abcdef.webp',
                    'user-1'
                )
            ).toBe(false);
        });

        it('rejects attaching foreign user-namespaced R2 keys', () => {
            expect(
                isR2AssetOwnedByUser(
                    'https://images.jorbites.com/remakes/victim-99/12345-abcdef.webp',
                    'attacker-1'
                )
            ).toBe(false);
            expect(
                isR2AssetOwnedByUser(
                    'https://images.jorbites.com/remakes/user-1/12345-abcdef.webp',
                    'user-1'
                )
            ).toBe(true);
        });
    });

    describe('safeCompareSecret', () => {
        it('returns true only for exact secret matches', () => {
            expect(safeCompareSecret('my-secret-123', 'my-secret-123')).toBe(
                true
            );
            expect(safeCompareSecret('my-secret-124', 'my-secret-123')).toBe(
                false
            );
            expect(safeCompareSecret('short', 'my-secret-123')).toBe(false);
            expect(safeCompareSecret('', 'my-secret-123')).toBe(false);
            expect(safeCompareSecret(null, 'my-secret-123')).toBe(false);
            expect(safeCompareSecret('undefined', undefined)).toBe(false);
        });
    });
});
