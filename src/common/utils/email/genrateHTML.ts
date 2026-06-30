export const email_template = ({
  message,
  title,
}: {
  message: string;
  title: string;
}): string => {
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
                saraha Team
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
};
