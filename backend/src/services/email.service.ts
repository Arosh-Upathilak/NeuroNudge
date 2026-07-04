import nodemailer from "nodemailer";

const smtpUser = process.env.SMTP_USER;
const smtpPass = process.env.SMTP_PASS;
const smtpFromName = process.env.SMTP_FROM_NAME || "NeuroNudge";

let transporter: nodemailer.Transporter | null = null;

if (smtpUser && smtpPass) {
  transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });
} else {
  console.warn(
    "WARNING: SMTP_USER or SMTP_PASS environment variables are not set. Nodemailer will fail to send emails.",
  );
}

/**
 * Returns an HTML email template styled with the NeuroNudge brand aesthetics.
 * Uses the sage green (#3C6255), warm cream (#F5F0EB), and Poppins typography.
 */
const getHtmlTemplate = (
  title: string,
  bodyContent: string,
  actionUrl: string,
  actionText: string,
) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${title}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');
    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      background-color: #F5F0EB;
      margin: 0;
      padding: 0;
      -webkit-font-smoothing: antialiased;
    }
    .wrapper {
      width: 100%;
      background-color: #F5F0EB;
      padding: 48px 0;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background: #FFFFFF;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 8px 30px rgba(60, 98, 85, 0.08);
      border: 1px solid #E8E3DD;
    }
    .header {
      background: linear-gradient(135deg, #4A7A6A 0%, #3C6255 100%);
      padding: 40px 32px;
      text-align: center;
    }
    .header h1 {
      color: #FFFFFF;
      margin: 0;
      font-size: 28px;
      font-weight: 700;
      letter-spacing: -0.5px;
    }
    .content {
      padding: 44px 36px;
      color: #1A1A1A;
      line-height: 1.65;
    }
    .content p {
      margin: 0 0 24px 0;
      font-size: 15px;
    }
    .cta-container {
      text-align: center;
      margin: 36px 0;
    }
    .cta-button {
      background-color: #3C6255;
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 15px 36px;
      border-radius: 10px;
      font-weight: 600;
      font-size: 15px;
      display: inline-block;
      box-shadow: 0 4px 12px rgba(60, 98, 85, 0.2);
    }
    .footer {
      padding: 28px 36px;
      background-color: #F5F0EB;
      border-top: 1px solid #E8E3DD;
      text-align: center;
      font-size: 13px;
      color: #6B6B6B;
    }
    .footer p {
      margin: 8px 0 0 0;
    }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="container">
      <div class="header">
        <h1>NeuroNudge</h1>
      </div>
      <div class="content">
        ${bodyContent}
        <div class="cta-container">
          <a href="${actionUrl}" class="cta-button" target="_blank">${actionText}</a>
        </div>
        <p style="font-size: 13px; color: #999999; word-break: break-all; margin-top: 32px; line-height: 1.5;">
          If the button doesn't work, copy and paste this link into your browser:<br>
          <a href="${actionUrl}" style="color: #3C6255; text-decoration: underline;">${actionUrl}</a>
        </p>
      </div>
      <div class="footer">
        <p>This is an automated message from NeuroNudge.</p>
        <p>&copy; ${new Date().getFullYear()} NeuroNudge. All rights reserved.</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

/**
 * Sends a registration/email verification link to the user.
 */
export const sendVerificationEmail = async (
  email: string,
  name: string,
  link: string,
): Promise<void> => {
  if (!transporter) {
    throw new Error(
      "SMTP email service is not properly configured. Check SMTP_USER and SMTP_PASS.",
    );
  }

  const subject = "Verify your email address for NeuroNudge";
  const bodyContent = `
    <p>Hi ${name || "there"},</p>
    <p>Welcome to <strong>NeuroNudge</strong>! We're excited to have you join us.</p>
    <p>Before you get started, please confirm your email address by clicking the button below. This helps us secure your account and ensure you receive your personalized notifications.</p>
  `;

  await transporter.sendMail({
    from: `"${smtpFromName}" <${smtpUser}>`,
    to: email,
    subject,
    html: getHtmlTemplate(
      "Verify your email",
      bodyContent,
      link,
      "Verify Email",
    ),
  });
};

/**
 * Sends a password reset link to the user.
 */
export const sendPasswordResetEmail = async (
  email: string,
  name: string,
  link: string,
): Promise<void> => {
  if (!transporter) {
    throw new Error(
      "SMTP email service is not properly configured. Check SMTP_USER and SMTP_PASS.",
    );
  }

  const subject = "Reset your password for NeuroNudge";
  const bodyContent = `
    <p>Hi ${name || "there"},</p>
    <p>We received a request to reset the password associated with your <strong>NeuroNudge</strong> account.</p>
    <p>Click the button below to choose a new password. If you did not request this change, you can safely ignore this email.</p>
  `;

  await transporter.sendMail({
    from: `"${smtpFromName}" <${smtpUser}>`,
    to: email,
    subject,
    html: getHtmlTemplate(
      "Reset your password",
      bodyContent,
      link,
      "Reset Password",
    ),
  });
};
