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
    org: process.env.CONTENT_ORG || process.env.EVENTS_ORG || 'jorbites',
    repo: process.env.CONTENT_REPO || process.env.EVENTS_REPO || 'content',
    branch: process.env.CONTENT_BRANCH || process.env.EVENTS_BRANCH || 'main',
    localOverridePath: process.env.CONTENT_LOCAL_PATH || process.env.EVENTS_LOCAL_PATH,
};

const APP_BLOGS_DIR = path.resolve(process.cwd(), 'app/content/blogs');
const APP_BLOG_IMAGES_DIR = path.resolve(process.cwd(), 'public/images/blogs');

/**
 * Mirror blog markdown files across locales, strictly preserving the 'releases' directory
 */
function mirrorBlogContentDirectory(src: string, dest: string) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });

    for (const locale of ['ca', 'en', 'es']) {
        const srcLocaleDir = path.join(src, locale);
        const destLocaleDir = path.join(dest, locale);

        if (!fs.existsSync(srcLocaleDir)) continue;
        fs.mkdirSync(destLocaleDir, { recursive: true });

        const srcFilesList = fs
            .readdirSync(srcLocaleDir)
            .filter((f) => f.endsWith('.md') && f !== 'README.md');
        const srcFilesSet = new Set(srcFilesList);

        // Delete general blogs in dest that are no longer in src, WITHOUT touching 'releases/'
        if (fs.existsSync(destLocaleDir)) {
            for (const destChild of fs.readdirSync(destLocaleDir)) {
                // NEVER touch or delete releases directory or README.md
                if (destChild === 'releases' || destChild === 'README.md' || destChild === '.DS_Store') {
                    continue;
                }
                if (!srcFilesSet.has(destChild)) {
                    const target = path.join(destLocaleDir, destChild);
                    fs.rmSync(target, { recursive: true, force: true });
                    console.log(`   🗑️ Cleaned up deleted blog: ${locale}/${destChild}`);
                }
            }
        }

        // Copy new or updated blogs from src to dest
        for (const file of srcFilesList) {
            const srcFile = path.join(srcLocaleDir, file);
            const destFile = path.join(destLocaleDir, file);
            fs.copyFileSync(srcFile, destFile);
        }
    }
}

/**
 * Mirror blog images in public/images/blogs, strictly preserving the 'releases' directory
 */
function mirrorBlogImagesDirectory(src: string, dest: string) {
    if (!fs.existsSync(src)) return;
    fs.mkdirSync(dest, { recursive: true });

    const srcFilesList = fs
        .readdirSync(src)
        .filter((f) => !f.startsWith('.') && f !== 'releases');
    const srcFilesSet = new Set(srcFilesList);

    // Delete images in dest that no longer exist in src, WITHOUT touching 'releases/'
    if (fs.existsSync(dest)) {
        for (const destChild of fs.readdirSync(dest)) {
            // NEVER touch or delete releases folder
            if (destChild === 'releases' || destChild === '.DS_Store') {
                continue;
            }
            if (!srcFilesSet.has(destChild)) {
                const target = path.join(dest, destChild);
                fs.rmSync(target, { recursive: true, force: true });
                console.log(`   🗑️ Cleaned up deleted blog image: ${destChild}`);
            }
        }
    }

    // Copy blog images
    for (const child of srcFilesList) {
        const srcChild = path.join(src, child);
        const destChild = path.join(dest, child);
        const stats = fs.statSync(srcChild);

        if (!stats.isDirectory()) {
            fs.copyFileSync(srcChild, destChild);
        }
    }
}

function findLocalContentDir(): string | null {
    if (process.env.FORCE_REMOTE_SYNC === 'true') {
        return null;
    }
    const candidates = [
        CONFIG.localOverridePath,
        path.resolve(process.cwd(), '../content'),
        path.resolve(process.cwd(), '../events'),
        path.resolve(process.cwd(), 'content-repo'),
        path.resolve(process.cwd(), 'events-repo'),
    ].filter(Boolean) as string[];

    for (const dir of candidates) {
        if (
            fs.existsSync(dir) &&
            (fs.existsSync(path.join(dir, 'content/blogs')) || fs.existsSync(path.join(dir, 'content')))
        ) {
            return dir;
        }
    }
    return null;
}

function downloadRemoteTarball(tarballUrl: string, destDir: string): Promise<void> {
    return new Promise((resolve, reject) => {
        fs.mkdirSync(destDir, { recursive: true });
        const tarPath = path.join(destDir, 'content.tar.gz');

        function fetchUrl(url: string, redirects = 0) {
            if (redirects > 5) {
                return reject(new Error('Too many redirects while downloading tarball'));
            }

            https
                .get(
                    url,
                    {
                        headers: {
                            'User-Agent': 'Jorbites-Content-Sync',
                            ...(process.env.GITHUB_TOKEN
                                ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` }
                                : {}),
                        },
                    },
                    (res) => {
                        if (
                            res.statusCode &&
                            res.statusCode >= 300 &&
                            res.statusCode < 400 &&
                            res.headers.location
                        ) {
                            return fetchUrl(res.headers.location, redirects + 1);
                        }

                        if (res.statusCode !== 200) {
                            return reject(
                                new Error(`Failed to download tarball: HTTP ${res.statusCode}`)
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

export async function syncBlogs() {
    console.log('🔄 [sync-blogs] Checking blogs source...');

    // 1. Check local source
    const localDir = findLocalContentDir();
    if (localDir) {
        console.log(`📂 [sync-blogs] Found local content source at: ${localDir}`);

        const blogsContentSrc = fs.existsSync(path.join(localDir, 'content/blogs'))
            ? path.join(localDir, 'content/blogs')
            : null;

        const blogsImagesSrc = fs.existsSync(path.join(localDir, 'images/blogs'))
            ? path.join(localDir, 'images/blogs')
            : null;

        if (blogsContentSrc) {
            console.log('📝 Mirroring blog posts (preserving releases/)...');
            mirrorBlogContentDirectory(blogsContentSrc, APP_BLOGS_DIR);
        }

        if (blogsImagesSrc) {
            console.log('🖼️  Mirroring blog images (preserving releases/)...');
            mirrorBlogImagesDirectory(blogsImagesSrc, APP_BLOG_IMAGES_DIR);
        }

        console.log('✅ [sync-blogs] Local blog sync completed successfully!\n');
        return;
    }

    // 2. Try remote download from GitHub organization jorbites
    const tarballUrl = `https://github.com/${CONFIG.org}/${CONFIG.repo}/archive/refs/heads/${CONFIG.branch}.tar.gz`;
    const tempDir = path.resolve(process.cwd(), '.content-cache');

    console.log(`🌐 [sync-blogs] Fetching from ${CONFIG.org}/${CONFIG.repo}@${CONFIG.branch}...`);

    try {
        if (fs.existsSync(tempDir)) {
            fs.rmSync(tempDir, { recursive: true, force: true });
        }
        await downloadRemoteTarball(tarballUrl, tempDir);

        const remoteBlogsSrc = path.join(tempDir, 'content/blogs');
        const remoteImagesSrc = path.join(tempDir, 'images/blogs');

        if (fs.existsSync(remoteBlogsSrc)) {
            console.log('📝 Mirroring blog posts from remote (preserving releases/)...');
            mirrorBlogContentDirectory(remoteBlogsSrc, APP_BLOGS_DIR);
        }
        if (fs.existsSync(remoteImagesSrc)) {
            console.log('🖼️  Mirroring blog images from remote (preserving releases/)...');
            mirrorBlogImagesDirectory(remoteImagesSrc, APP_BLOG_IMAGES_DIR);
        }

        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log('✅ [sync-blogs] Remote blog sync completed successfully!\n');
    } catch (err: any) {
        console.warn(`⚠️ [sync-blogs] Could not download remote blogs: ${err.message}`);
        console.log('ℹ️ [sync-blogs] Existing local blog content was preserved. Continuing build.\n');
    }
}

if (require.main === module) {
    syncBlogs().catch((err) => {
        console.error(err);
        process.exit(1);
    });
}
