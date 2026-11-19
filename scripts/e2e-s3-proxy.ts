import http from 'node:http';
import https from 'node:https';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
    S3Client,
    CreateBucketCommand,
    GetObjectCommand,
    HeadObjectCommand,
} from '@aws-sdk/client-s3';

const EMULATOR_PORT = process.env.E2E_EMULATOR_PORT || '9297';
const EMULATOR_URL =
    process.env.E2E_EMULATOR_URL || `https://127.0.0.1:${EMULATOR_PORT}`;
const PROXY_PORT = Number(process.env.E2E_S3_PROXY_PORT || '9298');
const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'jorbites-remakes';
const AWS_REGION =
    process.env.R2_REGION || process.env.AWS_REGION || 'us-east-1';

const EMULATOR_DIR = path.join(os.homedir(), '.aws', 'emulator', EMULATOR_PORT);
const CA_BUNDLE_PATH =
    process.env.AWS_CA_BUNDLE || path.join(EMULATOR_DIR, 'ca.pem');
const CREDENTIALS_PATH =
    process.env.AWS_SHARED_CREDENTIALS_FILE ||
    path.join(EMULATOR_DIR, 'emulator_credentials');

const STRIPPED_REQUEST_HEADERS = new Set([
    'origin',
    'referer',
    'sec-fetch-dest',
    'sec-fetch-mode',
    'sec-fetch-site',
    'sec-fetch-user',
    'access-control-request-method',
    'access-control-request-headers',
    'connection',
    'keep-alive',
    'proxy-authenticate',
    'proxy-authorization',
    'te',
    'trailers',
    'transfer-encoding',
    'upgrade',
]);

function readEmulatorCredentials(): {
    accessKeyId: string;
    secretAccessKey: string;
} {
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
        return {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        };
    }

    if (!fs.existsSync(CREDENTIALS_PATH)) {
        throw new Error(
            `AWS Emulator credentials not found at ${CREDENTIALS_PATH}. Start aws-emulator first or set AWS_ACCESS_KEY_ID / AWS_SECRET_ACCESS_KEY.`
        );
    }

    const content = fs.readFileSync(CREDENTIALS_PATH, 'utf8');
    const accessKeyMatch = content.match(/^aws_access_key_id\s*=\s*(.+)$/m);
    const secretKeyMatch = content.match(/^aws_secret_access_key\s*=\s*(.+)$/m);

    if (!accessKeyMatch || !secretKeyMatch) {
        throw new Error(
            `Failed to parse emulator credentials from ${CREDENTIALS_PATH}`
        );
    }

    return {
        accessKeyId: accessKeyMatch[1].trim(),
        secretAccessKey: secretKeyMatch[1].trim(),
    };
}

function setCorsHeaders(res: http.ServerResponse): void {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'GET, PUT, POST, DELETE, HEAD, OPTIONS'
    );
    res.setHeader('Access-Control-Allow-Headers', '*');
    res.setHeader('Access-Control-Expose-Headers', 'ETag, x-amz-request-id');
    res.setHeader('Access-Control-Max-Age', '3600');
}

function isSignedS3Request(req: http.IncomingMessage, parsedUrl: URL): boolean {
    if (req.headers.authorization) return true;
    if (parsedUrl.searchParams.has('X-Amz-Signature')) return true;
    return false;
}

async function main() {
    if (!fs.existsSync(CA_BUNDLE_PATH)) {
        throw new Error(
            `AWS Emulator CA bundle not found at ${CA_BUNDLE_PATH}. Start aws-emulator first.`
        );
    }

    const ca = fs.readFileSync(CA_BUNDLE_PATH);
    const upstreamAgent = new https.Agent({ ca });
    const emulatorOrigin = new URL(EMULATOR_URL);
    const credentials = readEmulatorCredentials();

    let ready = false;

    const s3Client = new S3Client({
        region: AWS_REGION,
        endpoint: `http://127.0.0.1:${PROXY_PORT}`,
        forcePathStyle: true,
        credentials,
    });

    const server = http.createServer(async (req, res) => {
        setCorsHeaders(res);

        if (req.method === 'OPTIONS') {
            res.writeHead(200);
            res.end();
            return;
        }

        const parsedUrl = new URL(
            req.url || '/',
            `http://127.0.0.1:${PROXY_PORT}`
        );

        if (parsedUrl.pathname === '/__proxy/health') {
            if (ready) {
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end('ok');
            } else {
                res.writeHead(503, { 'Content-Type': 'text/plain' });
                res.end('initializing');
            }
            return;
        }

        // Public unauthenticated object reads (emulates Cloudflare R2 custom public domain)
        if (
            (req.method === 'GET' || req.method === 'HEAD') &&
            !isSignedS3Request(req, parsedUrl)
        ) {
            const key = decodeURIComponent(
                parsedUrl.pathname.replace(/^\/+/, '')
            );
            if (!key) {
                res.writeHead(400, { 'Content-Type': 'text/plain' });
                res.end('Missing object key');
                return;
            }

            try {
                if (req.method === 'HEAD') {
                    const headRes = await s3Client.send(
                        new HeadObjectCommand({
                            Bucket: BUCKET_NAME,
                            Key: key,
                        })
                    );
                    console.log(`[e2e-s3-proxy] HEAD /${key} -> 200`);
                    res.writeHead(200, {
                        'Content-Type':
                            headRes.ContentType || 'application/octet-stream',
                        ...(headRes.ContentLength !== undefined
                            ? {
                                  'Content-Length': String(
                                      headRes.ContentLength
                                  ),
                              }
                            : {}),
                    });
                    res.end();
                    return;
                }

                const getRes = await s3Client.send(
                    new GetObjectCommand({
                        Bucket: BUCKET_NAME,
                        Key: key,
                    })
                );
                const bytes = await getRes.Body?.transformToByteArray();
                if (!bytes) {
                    console.warn(
                        `[e2e-s3-proxy] GET /${key} -> 404 (empty body)`
                    );
                    res.writeHead(404, { 'Content-Type': 'text/plain' });
                    res.end('Not found');
                    return;
                }
                console.log(
                    `[e2e-s3-proxy] GET /${key} -> 200 (${bytes.byteLength} bytes, ${getRes.ContentType}, head=${Buffer.from(bytes.slice(0, 16)).toString('hex')})`
                );
                res.writeHead(200, {
                    'Content-Type':
                        getRes.ContentType || 'application/octet-stream',
                    'Content-Length': String(bytes.byteLength),
                });
                res.end(Buffer.from(bytes));
            } catch (err: any) {
                const statusCode =
                    err?.$metadata?.httpStatusCode === 404 ||
                    err?.name === 'NoSuchKey' ||
                    err?.name === 'NotFound'
                        ? 404
                        : 500;
                console.error(
                    `[e2e-s3-proxy] ${req.method} /${key} -> ${statusCode}:`,
                    err?.name,
                    err?.message
                );
                res.writeHead(statusCode, { 'Content-Type': 'text/plain' });
                res.end(statusCode === 404 ? 'Not found' : 'S3 proxy error');
            }
            return;
        }

        // Forward signed S3 requests (including browser presigned PUTs and SDK calls)
        const forwardHeaders: http.OutgoingHttpHeaders = {};
        for (const [headerName, headerValue] of Object.entries(req.headers)) {
            if (
                headerValue !== undefined &&
                !STRIPPED_REQUEST_HEADERS.has(headerName.toLowerCase())
            ) {
                forwardHeaders[headerName] = headerValue;
            }
        }

        const upstreamReq = https.request(
            {
                hostname: emulatorOrigin.hostname,
                port: Number(emulatorOrigin.port || 443),
                path: `${parsedUrl.pathname}${parsedUrl.search}`,
                method: req.method,
                headers: forwardHeaders,
                agent: upstreamAgent,
            },
            (upstreamRes) => {
                console.log(
                    `[e2e-s3-proxy] ${req.method} ${parsedUrl.pathname} (signed) -> ${upstreamRes.statusCode}`
                );
                const responseHeaders: http.OutgoingHttpHeaders = {
                    ...upstreamRes.headers,
                    'access-control-allow-origin': '*',
                    'access-control-allow-methods':
                        'GET, PUT, POST, DELETE, HEAD, OPTIONS',
                    'access-control-allow-headers': '*',
                    'access-control-expose-headers': 'ETag, x-amz-request-id',
                };
                res.writeHead(upstreamRes.statusCode || 502, responseHeaders);
                upstreamRes.pipe(res);
            }
        );

        upstreamReq.on('error', (err) => {
            console.error('[e2e-s3-proxy] Upstream request error:', err);
            if (!res.headersSent) {
                res.writeHead(502, { 'Content-Type': 'text/plain' });
            }
            res.end(`Upstream error: ${err.message}`);
        });

        req.pipe(upstreamReq);
    });

    await new Promise<void>((resolve) => {
        server.listen(PROXY_PORT, '127.0.0.1', () => {
            console.log(
                `[e2e-s3-proxy] Listening on http://127.0.0.1:${PROXY_PORT} -> ${EMULATOR_URL}`
            );
            resolve();
        });
    });

    try {
        await s3Client.send(new CreateBucketCommand({ Bucket: BUCKET_NAME }));
        console.log(`[e2e-s3-proxy] Created bucket "${BUCKET_NAME}"`);
    } catch (err: any) {
        const name = err?.name || err?.Code || '';
        if (
            name === 'BucketAlreadyOwnedByYou' ||
            name === 'BucketAlreadyExists'
        ) {
            console.log(
                `[e2e-s3-proxy] Bucket "${BUCKET_NAME}" already exists`
            );
        } else {
            throw err;
        }
    }

    ready = true;
    console.log('[e2e-s3-proxy] Ready');

    const shutdown = () => {
        server.close(() => process.exit(0));
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
}

main().catch((err) => {
    console.error('[e2e-s3-proxy] Fatal error:', err);
    process.exit(1);
});
