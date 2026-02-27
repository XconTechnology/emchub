import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

transporter.verify((error) => {
  if (error) console.error("SMTP connection failed:", error);
  else console.log("SMTP server is ready to send emails");
});

const ADMIN_EMAIL = "emchub@ilm.org.hk";

const appUrl =
  process.env.NODE_ENV === "production"
    ? process.env.APP_URL_PROD
    : process.env.APP_URL_DEV;

export async function sendWelcomeEmail(user: {
  email: string;
  username: string;
  firstName: string | null;
}) {
  await transporter.sendMail({
    from: `"EMC Hub" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: "Welcome to EMC Hub!",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to EMC Hub, ${user.firstName}!</h2>
        <p>Your account has been created successfully.</p>
        <p>Your username is: <strong>${user.username}</strong></p>
        <a href="${appUrl}"
           style="display: inline-block; padding: 12px 24px; background-color: #8FC24C;
                  color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Get Started
        </a>
        <p style="color: #8FC24C; font-size: 12px;">
          If you didn't create this account, please contact us immediately.
        </p>
      </div>
    `,
  });
}

export async function sendAdminNewUserEmail(user: {
  username: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
}) {
  await transporter.sendMail({
    from: `"EMC Hub" <${process.env.SMTP_USER}>`,
    to: ADMIN_EMAIL,
    subject: "New User Registration",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New User Registered</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <tr><td style="padding: 8px; color: #8FC24C;">Name</td><td style="padding: 8px;">${user.firstName} ${user.lastName}</td></tr>
          <tr><td style="padding: 8px; color: #8FC24C;">Username</td><td style="padding: 8px;">${user.username}</td></tr>
          <tr><td style="padding: 8px; color: #8FC24C;">Email</td><td style="padding: 8px;">${user.email}</td></tr>
          <tr><td style="padding: 8px; color: #8FC24C;">Registered At</td><td style="padding: 8px;">${new Date().toUTCString()}</td></tr>
        </table>
      </div>
    `,
  });
}

export async function sendPasswordResetEmail(user: {
  email: string;
  username: string;
  resetToken: string;
}) {
  const resetLink = `${appUrl}/reset-password?token=${user.resetToken}`;

  await transporter.sendMail({
    from: `"EMC Hub" <${process.env.SMTP_USER}>`,
    to: user.email,
    subject: "Password Reset Request",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>Hi ${user.username},</p>
        <p>You requested a password reset. Click the button below to reset your password.</p>
        <p>This link will expire in <strong>1 hour</strong>.</p>
        <a href="${resetLink}"
           style="display: inline-block; padding: 12px 24px; background-color: #8FC24C;
                  color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Reset Password
        </a>
        <p>If you didn't request this, you can safely ignore this email.</p>
        <p style="color: #000; font-size: 12px;">
          If the button doesn't work, copy this link: ${resetLink}
        </p>
      </div>
    `,
  });
}
