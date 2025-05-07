import { NextResponse } from 'next/server';
import crypto from 'crypto';
import prisma from '@/app/libs/prismadb';
import { JORBITES_URL } from '@/app/utils/constants';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: 'Email is required' },
                { status: 400 }
            );
        }

        const user = await prisma.user.findUnique({
            where: {
                email,
            },
        });

        if (!user) {
            return NextResponse.json({ success: true }, { status: 200 });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour

        await prisma.user.update({
            where: {
                id: user.id,
            },
            data: {
                resetToken,
                resetTokenExpiry,
            },
        });

        const resetUrl = `${JORBITES_URL}/reset-password/${resetToken}`;

        // use notifier service to send email

        // const transporter = nodemailer.createTransport({
        //     host: process.env.EMAIL_SERVER_HOST,
        //     port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        //     auth: {
        //         user: process.env.EMAIL_SERVER_USER,
        //         pass: process.env.EMAIL_SERVER_PASSWORD,
        //     },
        //     secure: process.env.EMAIL_SERVER_SECURE === 'true',
        // });

        // // Send email
        // await transporter.sendMail({
        //     from: process.env.EMAIL_FROM,
        //     to: user.email,
        //     subject: 'Password Reset',
        //     text: `Hello, to reset your password click on the following link: ${resetUrl}`,
        //     html: `
        //         <div>
        //             <h1>Password Reset</h1>
        //             <p>Hello,</p>
        //             <p>You have requested to reset your password. Click on the following link to create a new password:</p>
        //             <a href="${resetUrl}">Reset Password</a>
        //             <p>This link will expire in 1 hour.</p>
        //             <p>If you did not request this change, you can ignore this email.</p>
        //         </div>
        //     `,
        // });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error in reset request:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
