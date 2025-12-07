import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,       // e.g., "smtp.gmail.com"
  port: Number(process.env.MAIL_PORT) || 587,
  secure: true,                     // true for port 465
  auth: {
    user: process.env.MAIL_USER,     // full email
    pass: process.env.MAIL_PASS,     // app password
  },
});

export default transporter;
