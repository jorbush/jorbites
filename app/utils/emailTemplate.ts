import { EmailTemplateParams, EmailType } from "@/app/types/email";
import { JORBITES_URL } from "@/app/utils/constants";

export const getEmailTemplate = (
    type: EmailType,
    params: EmailTemplateParams
): { subject: string; html: string } => {
    const logoUrl = `${JORBITES_URL}/images/logo-nobg.webp`;

    const getBaseTemplate = (content: string) => `
        <!DOCTYPE html>
        <html>
        <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Jorbites Notification</title>
            <style>
                body {
                    font-family: Arial, sans-serif;
                    line-height: 1.6;
                    margin: 0;
                    padding: 0;
                    background-color: #f4f4f4;
                }
                .container {
                    max-width: 600px;
                    margin: 20px auto;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                    padding: 20px;
                }
                .header {
                    text-align: center;
                    padding: 20px 0;
                }
                .logo {
                    max-width: 150px;
                    height: auto;
                }
                .content {
                    padding: 20px;
                    color: #333333;
                }
                .footer {
                    text-align: center;
                    padding: 20px;
                    color: #666666;
                    font-size: 12px;
                    border-top: 1px solid #eeeeee;
                    margin-top: 20px;
                }
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #4CAF50;
                    color: white;
                    text-decoration: none;
                    border-radius: 5px;
                    margin: 20px 0;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <img src="${logoUrl}" alt="Jorbites Logo" class="logo">
                </div>
                <div class="content">
                    ${content}
                </div>
                <div class="footer">
                    <p>You're receiving this email because you have notifications enabled on Jorbites.</p>
                    <p>To manage your email preferences, go to <a href="${JORBITES_URL}">Settings → Email Notifications</a></p>
                    <p>© ${new Date().getFullYear()} Jorbites. All rights reserved.</p>
                </div>
            </div>
        </body>
        </html>
    `;

    let content = '';
    let subject = '';

    switch (type) {
        case EmailType.NEW_COMMENT:
            subject = 'New Comment on Your Recipe - Jorbites';
            content = `
                <h2>You have a new comment!</h2>
                <p>Hi there,</p>
                <p><strong>${params.userName}</strong> has left a comment on your recipe.</p>
                <a href="${JORBITES_URL}/recipes/${params.recipeId}" class="button">View Comment</a>
            `;
            break;

        case EmailType.NEW_LIKE:
            subject = 'New Like on Your Recipe - Jorbites';
            content = `
                <h2>Someone liked your recipe!</h2>
                <p>Hi there,</p>
                <p><strong>${params.userName}</strong> has liked your recipe.</p>
                <a href="${JORBITES_URL}/recipes/${params.recipeId}" class="button">View Recipe</a>
            `;
            break;

        case EmailType.NEW_RECIPE:
            subject = 'New Recipe Available - Jorbites';
            content = `
                <h2>New Recipe Alert! 🍳</h2>
                <p>Hi there,</p>
                <p>A new recipe has been posted on Jorbites!</p>
                <a href="${JORBITES_URL}/recipes/${params.recipeId}" class="button">Check it out</a>
            `;
            break;

        case EmailType.NOTIFICATIONS_ACTIVATED:
            subject = 'Welcome to Jorbites Notifications';
            content = `
                <h2>Notifications Activated! 🎉</h2>
                <p>Hi there,</p>
                <p>You've successfully activated email notifications for Jorbites.</p>
                <p>You'll now receive updates about:</p>
                <ul>
                    <li>New comments on your recipes</li>
                    <li>Likes on your recipes</li>
                    <li>New recipes from your favorite chefs</li>
                </ul>
            `;
            break;

        default:
            throw new Error('Invalid email type');
    }

    return {
        subject,
        html: getBaseTemplate(content)
    };
};
