import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
const FROM_EMAIL = "DevStash <onboarding@resend.dev>";

export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${APP_URL}/api/auth/verify-email?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Verify your DevStash email",
    html: verificationEmailHtml(verifyUrl),
    text: `Welcome to DevStash!\n\nVerify your email address by visiting this link:\n${verifyUrl}\n\nThis link expires in 24 hours.`,
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${token}`;

  await resend.emails.send({
    from: FROM_EMAIL,
    to: email,
    subject: "Reset your DevStash password",
    html: passwordResetEmailHtml(resetUrl),
    text: `Reset your DevStash password by visiting this link:\n${resetUrl}\n\nThis link expires in 1 hour. If you didn't request this, you can ignore this email.`,
  });
}

function passwordResetEmailHtml(resetUrl: string) {
  return `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0; padding:0; background-color:#0a0a0a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:400px; background-color:#171717; border:1px solid rgba(255,255,255,0.1); border-radius:12px; overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <p style="margin:0 0 24px 0; font-size:14px; font-weight:600; letter-spacing:0.02em; color:#fafafa;">DevStash</p>
                <h1 style="margin:0 0 8px 0; font-size:20px; line-height:28px; color:#fafafa;">Reset your password</h1>
                <p style="margin:0; font-size:14px; line-height:20px; color:#a3a3a3;">
                  Click the button below to choose a new password for your account.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="border-radius:8px; background-color:#e5e5e5;">
                      <a
                        href="${resetUrl}"
                        style="display:inline-block; padding:10px 20px; font-size:14px; font-weight:500; color:#171717; text-decoration:none;"
                      >
                        Reset password
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;">
                <p style="margin:0 0 8px 0; font-size:12px; line-height:18px; color:#a3a3a3;">
                  Or paste this link into your browser:
                </p>
                <p style="margin:0; font-size:12px; line-height:18px; word-break:break-all;">
                  <a href="${resetUrl}" style="color:#a3a3a3;">${resetUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px; border-top:1px solid rgba(255,255,255,0.1);">
                <p style="margin:0; font-size:12px; line-height:18px; color:#a3a3a3;">
                  This link expires in 1 hour. If you didn't request a password reset, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}

function verificationEmailHtml(verifyUrl: string) {
  return `
<!DOCTYPE html>
<html lang="en">
  <body style="margin:0; padding:0; background-color:#0a0a0a; font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a; padding:40px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:400px; background-color:#171717; border:1px solid rgba(255,255,255,0.1); border-radius:12px; overflow:hidden;">
            <tr>
              <td style="padding:32px 32px 8px 32px;">
                <p style="margin:0 0 24px 0; font-size:14px; font-weight:600; letter-spacing:0.02em; color:#fafafa;">DevStash</p>
                <h1 style="margin:0 0 8px 0; font-size:20px; line-height:28px; color:#fafafa;">Verify your email</h1>
                <p style="margin:0; font-size:14px; line-height:20px; color:#a3a3a3;">
                  Click the button below to verify your email address and activate your account.
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:24px 32px;">
                <table role="presentation" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center" style="border-radius:8px; background-color:#e5e5e5;">
                      <a
                        href="${verifyUrl}"
                        style="display:inline-block; padding:10px 20px; font-size:14px; font-weight:500; color:#171717; text-decoration:none;"
                      >
                        Verify email address
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 32px 32px;">
                <p style="margin:0 0 8px 0; font-size:12px; line-height:18px; color:#a3a3a3;">
                  Or paste this link into your browser:
                </p>
                <p style="margin:0; font-size:12px; line-height:18px; word-break:break-all;">
                  <a href="${verifyUrl}" style="color:#a3a3a3;">${verifyUrl}</a>
                </p>
              </td>
            </tr>
            <tr>
              <td style="padding:16px 32px; border-top:1px solid rgba(255,255,255,0.1);">
                <p style="margin:0; font-size:12px; line-height:18px; color:#a3a3a3;">
                  This link expires in 24 hours. If you didn't create a DevStash account, you can ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
  `;
}