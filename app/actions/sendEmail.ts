import nodemailer from 'nodemailer';
import { EmailType } from '@/app/types/email';
import { getEmailTemplate } from '@/app/utils/emailTemplate';

interface SendEmailParams {
    type: EmailType;
    userEmail: string | null | undefined;
    params?: {
        userName?: string | null | undefined;
        recipeId?: string;
        recipeName?: string;
    };
}

const sendEmail = async ({ type, userEmail, params = {} }: SendEmailParams) => {
    if (!userEmail) return;

    try {
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: process.env.JORBITES_EMAIL,
                pass: process.env.JORBITES_EMAIL_PASS,
            },
        });

        const template = getEmailTemplate(type, params);

        await transporter.sendMail({
            from: process.env.JORBITES_EMAIL,
            to: userEmail,
            subject: template.subject,
            text: template.text,
        });
        console.log('Email sent to:', userEmail);
    } catch (error) {
        console.error('Error sending an email:', error);
    }
};

export default sendEmail;
