import nodemailer from 'nodemailer';

const sendEmail = async (
    message: string,
    userEmail: string | null | undefined
) => {
    if (userEmail === null || userEmail === undefined) {
        return;
    }
    try {
        // Configura el transporte de correo
        const transporter = nodemailer.createTransport({
            // Configura los detalles del servidor de correo saliente (SMTP)
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: process.env.JORBITES_EMAIL,
                pass: process.env.JORBITES_EMAIL_PASS,
            },
        });

        // Envía el correo electrónico
        await transporter.sendMail({
            from: process.env.JORBITES_EMAIL,
            to: userEmail,
            subject: 'Something is happening in Jorbites!!',
            text: message,
        });
    } catch (error) {
        // Maneja cualquier error ocurrido durante el envío del correo
        console.error('Error sending an email:', error);
    }
};

export default sendEmail;
