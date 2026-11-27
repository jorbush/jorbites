import bcrypt from 'bcrypt';
import NextAuth, { AuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import GithubProvider from 'next-auth/providers/github';
import GoogleProvider from 'next-auth/providers/google';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import prisma from '@/app/lib/prismadb';
import { verifyAndConsumeTwoFactorCode } from '@/app/utils/twoFactorVerification';

export const authOptions: AuthOptions = {
    adapter: PrismaAdapter(prisma),
    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID as string,
            clientSecret: process.env.GITHUB_SECRET as string,
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        }),
        CredentialsProvider({
            name: 'credentials',
            credentials: {
                email: { label: 'email', type: 'text' },
                password: {
                    label: 'password',
                    type: 'password',
                },
                twoFactorCode: {
                    label: 'twoFactorCode',
                    type: 'text',
                },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error('Invalid credentials');
                }

                const normalizedEmail = credentials.email.trim().toLowerCase();

                if (
                    (process.env.NODE_ENV === 'production' ||
                        process.env.ENV === 'production') &&
                    process.env.UPSTASH_REDIS_REST_URL &&
                    process.env.UPSTASH_REDIS_REST_TOKEN
                ) {
                    try {
                        const { Ratelimit } =
                            await import('@upstash/ratelimit');
                        const { Redis } = await import('@upstash/redis');
                        const loginLimiter = new Ratelimit({
                            redis: Redis.fromEnv(),
                            limiter: Ratelimit.slidingWindow(10, '15 m'),
                            prefix: '@upstash/ratelimit/password-login',
                        });
                        const { success } = await loginLimiter.limit(
                            `login:${normalizedEmail}`
                        );
                        if (!success) {
                            throw new Error('TOO_MANY_LOGIN_ATTEMPTS');
                        }
                    } catch (err: any) {
                        if (err.message === 'TOO_MANY_LOGIN_ATTEMPTS') {
                            throw err;
                        }
                    }
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: normalizedEmail,
                    },
                });

                if (!user || !user?.hashedPassword) {
                    throw new Error('Invalid credentials');
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.hashedPassword
                );

                if (!isCorrectPassword) {
                    throw new Error('Invalid credentials');
                }

                if (user.twoFactorEnabled && user.twoFactorSecret) {
                    const submittedCode = credentials.twoFactorCode?.trim();
                    if (!submittedCode) {
                        throw new Error('2FA_REQUIRED');
                    }

                    if (
                        (process.env.NODE_ENV === 'production' ||
                            process.env.ENV === 'production') &&
                        process.env.UPSTASH_REDIS_REST_URL &&
                        process.env.UPSTASH_REDIS_REST_TOKEN
                    ) {
                        try {
                            const { Ratelimit } =
                                await import('@upstash/ratelimit');
                            const { Redis } = await import('@upstash/redis');
                            const limiter = new Ratelimit({
                                redis: Redis.fromEnv(),
                                limiter: Ratelimit.slidingWindow(10, '15 m'),
                                prefix: '@upstash/ratelimit/two-factor-login',
                            });
                            const { success } = await limiter.limit(
                                `2fa_login:${user.id}`
                            );
                            if (!success) {
                                throw new Error('TOO_MANY_2FA_ATTEMPTS');
                            }
                        } catch (err: any) {
                            if (err.message === 'TOO_MANY_2FA_ATTEMPTS') {
                                throw err;
                            }
                        }
                    }

                    const verification = await verifyAndConsumeTwoFactorCode({
                        user,
                        code: submittedCode,
                    });

                    if (!verification.valid) {
                        throw new Error('INVALID_2FA_CODE');
                    }
                }

                return user;
            },
        }),
    ],
    pages: {
        signIn: '/',
    },
    debug: process.env.NODE_ENV === 'development',
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
        updateAge: 24 * 60 * 60, // 24 hours
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                const userTokenVersion = (user as { tokenVersion?: unknown })
                    .tokenVersion;
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    picture: user.image,
                    tokenVersion:
                        typeof userTokenVersion === 'number'
                            ? userTokenVersion
                            : 0,
                };
            }

            if (!token?.id || typeof token.id !== 'string') {
                throw new Error('SESSION_INVALID');
            }

            const dbUser = await prisma.user.findUnique({
                where: {
                    id: token.id,
                },
                select: {
                    tokenVersion: true,
                },
            });

            const tokenVersion =
                typeof token.tokenVersion === 'number' ? token.tokenVersion : 0;
            const dbTokenVersion = dbUser?.tokenVersion ?? 0;

            if (!dbUser || tokenVersion !== dbTokenVersion) {
                throw new Error('SESSION_REVOKED');
            }

            return token;
        },
        async session({ session, token }) {
            if (token && session.user) {
                (session.user as any).id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
            }
            return session;
        },
    },
    secret: process.env.NEXTAUTH_SECRET,
};

export default NextAuth(authOptions);
