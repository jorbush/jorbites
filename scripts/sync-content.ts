import { syncEvents } from './sync-events';
import { syncBlogs } from './sync-blogs';

export async function syncContent() {
    console.log('🚀 [sync-content] Starting full content synchronization (Events & Blogs)...\n');

    // 1. Sync Events, images, and badges
    await syncEvents();

    // 2. Sync Blogs and blog images (preserving releases/)
    await syncBlogs();

    console.log('🎉 [sync-content] All content synchronization completed successfully!\n');
}

if (require.main === module) {
    syncContent().catch((err) => {
        console.error('❌ [sync-content] Sync failed:', err);
        process.exit(1);
    });
}
