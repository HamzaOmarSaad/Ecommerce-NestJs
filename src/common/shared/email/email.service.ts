import * as nodemailer from 'nodemailer';
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
interface SendEmailOptions {
  to: string;
  cc?: string;
  subject: string;
  html: string;
}

@Injectable()
export class EmailService {
  private APP_EMAIL: string;
  private APP_NAME: string;
  private APP_EMAIL_PASSWORD: string;

  constructor(private readonly configService: ConfigService) {
    this.APP_EMAIL = this.configService.get('EMAIL') as string;
    this.APP_EMAIL_PASSWORD = this.configService.get<string>(
      'EMAIL_PASS',
    ) as string;
    this.APP_NAME = this.configService.get<string>(
      'APPLICATION_NAME',
    ) as string;
  }
  email_template({
    message,
    title,
  }: {
    message: string;
    title: string;
  }): string {
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Email Template</title>
</head>
<body style="margin:0; padding:0; background-color:#f4f4f4; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f4f4f4; padding:20px 0;">
    <tr>
      <td align="center">

        <!-- Main Container -->
        <table width="600" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background:#1e3a8a; color:#ffffff; padding:20px; text-align:center;">
              <h1 style="margin:0;">saraha app</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:30px; color:#333333;">
              <h2 style="margin-top:0;">Hello</h2>
              <p style="line-height:1.6;">
                Welcome!${title} .
              </p>

              <p style="line-height:1.6;">
                ${message}.
              </p>


              <p style="line-height:1.6;">
                If you didn’t request this, you can safely ignore this email.
              </p>

              <p style="margin-top:30px;">
                Best regards,<br>
                ${this.APP_NAME} Team
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#f1f1f1; text-align:center; padding:15px; font-size:12px; color:#777;">
              © 2026 Your Company. All rights reserved.
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`;
  }
  async sendEmailService({
    to,
    cc,
    subject,
    html,
  }: SendEmailOptions): Promise<nodemailer.SentMessageInfo> {
    try {
      const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: this.APP_EMAIL,
          pass: this.APP_EMAIL_PASSWORD,
        },
      });
      const info = await transporter.sendMail({
        from: `${this.APP_NAME}  <${this.APP_EMAIL}>`,
        to,
        cc,
        subject,
        html,
      });

      console.log('Email sent:', info.accepted);

      return info;
    } catch (error) {
      console.error('Email sending failed:', error);
      throw error;
    }
  }
}
