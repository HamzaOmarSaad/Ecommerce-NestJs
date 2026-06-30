// Services/sendEmail.ts

import nodemailer from "nodemailer";

if (!process.env.EMAIL || !process.env.EMAIL_PASS) {
  throw new Error("Missing EMAIL environment variables");
}

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL,
    pass: process.env.EMAIL_PASS,
  },
});

interface SendEmailOptions {
  to: string;
  cc?: string;
  subject: string;
  html: string;
}

export const sendEmailService = async ({
  to,
  cc,
  subject,
  html,
}: SendEmailOptions) => {
  try {
    const info = await transporter.sendMail({
      from: `"Social Media App" <${process.env.EMAIL}>`,
      to,
      cc,
      subject,
      html,
    });

    console.log("Email sent:", info.accepted);

    return info;
  } catch (error) {
    console.error("Email sending failed:", error);
    throw error;
  }
};
