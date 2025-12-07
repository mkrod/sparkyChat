import type { Request, Response } from "express";
import { otpHTML } from "../../utilities/html/otp_mail.js";
import transporter from "../../utilities/mailer/mailer.config.js";
import { usersModel } from "../../utilities/db/model/users.js";

export const sendMail = async (req: Request, res: Response) => {
    const { user_id } = req.session;
    const { type, data: code } = req.body;
    let html: string = "";

    if (type === "email_otp") {
        html = await otpHTML({ code });
    }
    if (html !== "") {
        const email = (await usersModel.findOne({ user_id }))?.toJSON().email;
        if (!email) {
            return res.json({ status: 403, message: "User email not found" });
        }
        transporter.sendMail({
            from: `"SparkyChat" <${process.env.MAIL_USER}>`,
            to: email, // recipient email
            subject: "Your SparkyChat Verification Code",
            html: html,
        }).then(() => {
            return res.json({ status: 200, message: "Email sent successfully" });
        }).catch((error) => {
            console.log("Error sending email:", error);
            return res.json({ status: 500, message: "Failed to send email" });
        });
    } else {
        return res.json({ status: 500, message: "Failed to send email" });
    }

}