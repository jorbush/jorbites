import fs from 'fs';
import path from 'path';
import https from 'https';
import { execSync } from 'child_process';

interface SyncConfig {
    org: string;
    repo: string;
    branch: string;
    localOverridePath?: string;
}

const CONFIG: SyncConfig = {
    org: process.env.EVENTS_ORG || 'jorbites',
    repo: process.env.EVENTS_REPO || 'events',
    branch: process.env.EVENTS_BRANCH || 'main',
    localOverridePath: process.env.EVENTS_LOCAL_PATH,
};

const APP_CONTENT_DIR = path.resolve(process.cwd(), 'app/content/events');
const APP_IMAGES_DIR = path.resolve(process.cwd(), 'public/images/events');
const APP_BADGES_DIR = path.resolve(process.cwd(), 'public/badges');

/**
 * Mirror directory (copies all files from src to dest and deletes files in dest that no longer exist in src)
 */
function mirrorDirectory(src: string, dest: string) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });

    const srcFiles = new Set(
        fs.readdirSync(src).filter((f) => f !== '.DS_Store')
    );

    // Delete files in dest that are no longer in src
    if (fs.existsSync(dest)) {
        for (const destChild of fs.readdirSync(dest)) {
            if (destChild === '.DS_Store') continue;
            if (!srcFiles.has(destChild)) {
                const target = path.join(dest, destChild);
                fs.rmSync(target, { recursive: true, force: true });
            }
        }
    }

    // Copy from src to dest
    for (const child of srcFiles) {
        const srcChild = path.join(src, child);
        const destChild = path.join(dest, child);
        const stats = fs.statSync(srcChild);

        if (stats.isDirectory()) {
            mirrorDirectory(srcChild, destChild);
        } else {
            fs.copyFileSync(srcChild, destChild);
        }
    }
}

/**
 * Copy files from src to dest without deleting other files in dest (useful for public/badges)
 */
function mergeDirectory(src: string, dest: string) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });

    for (const child of fs.readdirSync(src)) {
        if (child === '.DS_Store') continue;
        const srcChild = path.join(src, child);
        const destChild = path.join(dest, child);
        const stats = fs.statSync(srcChild);

        if (stats.isDirectory()) {
            mergeDirectory(srcChild, destChild);
        } else {
            fs.copyFileSync(srcChild, destChild);
        }
    }
}

/**
 * Check if a local candidate directory exists
 */
function findLocalEventsDir(): string | null {
    const candidates = [
        CONFIG.localOverridePath,
        path.resolve(process.cwd(), '../events'),
        path.resolve(process.cwd(), '../jorbites-events'),
        path.resolve(process.cwd(), 'events-repo'),
        path.resolve(process.cwd(), 'events'),
    ].filter(Boolean) as string[];

    for (const dir of candidates) {
        if (
            fs.existsSync(dir) &&
            fs.existsSync(path.join(dir, 'content')) &&
            fs.existsSync(path.join(dir, 'images'))
        ) {
            return dir;
        }
    }
    return null;
}

/**
 * Download a remote tarball from GitHub and extract it
 */
async function downloadRemoteTarball(
    tarballUrl: string,
    destDir: string
): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.mkdirSync(destDir, { recursive: true });
        const tarPath = path.join(destDir, 'events.tar.gz');

        function fetchUrl(url: string) {
            https
                .get(
                    url,
                    {
                        headers: {
                            'User-Agent': 'jorbites-sync-agent',
                        },
                    },
                    (res) => {
                        // Handle GitHub 302 redirects
                        if (
                            res.statusCode &&
                            res.statusCode >= 300 &&
                            res.statusCode < 400 &&
                            res.headers.location
                        ) {
                            return fetchUrl(res.headers.location);
                        }

                        if (res.statusCode !== 200) {
                            return reject(
                                new Error(
                                    `Failed to download tarball: HTTP ${res.statusCode}`
                                )
                            );
                        }

                        const fileStream = fs.createWriteStream(tarPath);
                        res.pipe(fileStream);

                        fileStream.on('finish', () => {
                            fileStream.close(() => {
                                try {
                                    execSync(
                                        `tar -xzf "${tarPath}" -C "${destDir}" --strip-components=1`
                                    );
                                    fs.unlinkSync(tarPath);
                                    resolve();
                                } catch (err) {
                                    reject(err);
                                }
                            });
                        });
                    }
                )
                .on('error', (err) => {
                    reject(err);
                });
        }

        fetchUrl(tarballUrl);
    });
}

export async function syncEvents() {
    console.log('🔄 [sync-events] Checking events source...');

    // 1. Check for local repository / submodule first
    const localDir = findLocalEventsDir();
    if (localDir) {
        console.log(`📂 [sync-events] Found local events source at: ${localDir}`);
        console.log('📦 Mirroring content...');
        mirrorDirectory(path.join(localDir, 'content'), APP_CONTENT_DIR);
        console.log('🖼️  Mirroring images...');
        mirrorDirectory(path.join(localDir, 'images'), APP_IMAGES_DIR);

        const localBadges = path.join(localDir, 'badges');
        if (fs.existsSync(localBadges)) {
            console.log('🏅 Syncing badges...');
            mergeDirectory(localBadges, APP_BADGES_DIR);
        }

        console.log('✅ [sync-events] Local sync completed successfully!\n');
        return;
    }

    // 2. Try remote download from GitHub organization jorbites
    const tarballUrl = `https://github.com/${CONFIG.org}/${CONFIG.repo}/archive/refs/heads/${CONFIG.branch}.tar.gz`;
    const tempDir = path.resolve(process.cwd(), '.events-cache');

    console.log(
        `🌐 [sync-events] Fetching from ${CONFIG.org}/${CONFIG.repo}@${CONFIG.branch}...`
    );

    try {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        await downloadRemoteTarball(tarballUrl, tempDir);

        if (fs.existsSync(path.join(tempDir, 'content'))) {
            mirrorDirectory(path.join(tempDir, 'content'), APP_CONTENT_DIR);
        }
        if (fs.existsSync(path.join(tempDir, 'images'))) {
            mirrorDirectory(path.join(tempDir, 'images'), APP_IMAGES_DIR);
        }
        if (fs.existsSync(path.join(tempDir, 'badges'))) {
            mergeDirectory(path.join(tempDir, 'badges'), APP_BADGES_DIR);
        }

        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log('✅ [sync-events] Remote sync completed successfully!\n');
    } catch (err: any) {
        console.warn(
            `⚠️ [sync-events] Could not download remote events: ${err.message}`
        );
        if (
            fs.existsSync(APP_CONTENT_DIR) &&
            fs.readdirSync(APP_CONTENT_DIR).length > 0
        ) {
            console.log(
                'ℹ️ [sync-events] Existing local event content was preserved. Continuing build.\n'
            );
        } else {
            console.error(
                '❌ [sync-events] No local events found and remote download failed.'
            );
            throw err;
        }
    }
}

// Allow CLI execution
if (require.main === module) {
    syncEvents().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
