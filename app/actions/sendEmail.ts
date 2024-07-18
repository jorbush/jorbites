import nodemailer from 'nodemailer';

const sendEmail = async (
    message: string,
    userEmail: string | null | undefined
) => {
    if (userEmail === null || userEmail === undefined) {
        return;
    }
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

        await transporter.sendMail({
            from: process.env.JORBITES_EMAIL,
            to: userEmail,
            subject: 'Something is happening in Jorbites!!',
            text: message,
        });
    } catch (error) {
        console.error('Error sending an email:', error);
    }
};

export default sendEmail;
