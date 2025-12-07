//import { mail } from './resend'; //custom file //might not be used here, maybe elsewhere
import { logo } from "../index.js";





export const otpHTML = async ({ code, link }: { code: string, link?: string }): Promise<string> => { //promise for no reason yet (incase im using external assets later) i can await it to return html

    return `
    <!DOCTYPE html>
    <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>Mail</title>
            <style>
                @import url('https://fonts.googleapis.com/css2?family=Roboto&display=swap');
            </style>      
        </head>
        <body style="background-color: #f5f5f5; padding: 20px; font-family: Roboto, Arial, Helvetica, sans-serif; color: #3b3b3b; line-height: 1.5;">
            <center>
                <table style="background-color: #ffffff; width: 100%; max-width: 500px; box-shadow: 0 0 10px #f5f5f5; border-radius: 10px;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td style="padding: 30px 20px;">
                        <img src="${logo}" width="100" alt="Logo" />
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 0 20px 15px 20px;">
                        <p style="margin: 0;">
                            Thanks for creating a Sparky account. Use the code <strong>${code}</strong> to verify your email address and get started${link ? ", or use the link below" : "."}.
                        </p>
                        </td>
                    </tr>
                        ${link ?
                            `
                            <tr>
                                <td style="padding: 10px 20px;">
                                    <a href="${link}" style="display: inline-block; text-decoration: none; color: white; background-color: #3d00cc; padding: 10px 24px; border-radius: 4px; font-weight: bold;">
                                        Verify email address
                                    </a>
                                </td>
                            </tr>
                            `
                            :
                            `
                            `
                        }
                    <tr>
                        <td style="padding: 15px 20px;">
                        <p style="margin: 0;">
                            We will never email you asking for your password or bank info. If you get a suspicious email, report it to <strong style="color: #3d00cc;">Customer Support</strong>.
                        </p>
                        </td>
                    </tr>
                </table>

                <table style="font-size: 12px; color: #3b3b3b; margin-top: 20px;" cellpadding="0" cellspacing="0">
                    <tr>
                        <td align="center" style="padding: 5px 0;">SparkyChat © ${new Date().getFullYear()}</td>
                    </tr>
                    <tr>
                        <td align="center" style="padding: 0 0 10px 0;">Connecting no cost</td>
                    </tr>
                </table>
            </center>
        </body>
    </html>
`;

};
