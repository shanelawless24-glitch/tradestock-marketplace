import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || "noreply@tradestock.ie";
const FROM_NAME = process.env.RESEND_FROM_NAME || "TradeStock Marketplace";

interface EmailParams {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: EmailParams) {
  if (!resend) {
    console.log("[Email Mock] Would send email to:", to);
    console.log("[Email Mock] Subject:", subject);
    return { success: true, id: "mock-email-id" };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      to,
      subject,
      html,
    });

    if (error) {
      console.error("Email send error:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (error) {
    console.error("Email send exception:", error);
    return { success: false, error: String(error) };
  }
}

// Dealer activation email
export async function sendDealerActivationEmail(
  to: string,
  businessName: string,
  activationUrl: string
) {
  const subject = "Activate Your TradeStock Marketplace Account";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Activate Your Account</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #0ea5e9; }
        .content { background: #f8fafc; padding: 32px; border-radius: 8px; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 14px; }
        .expiry { color: #dc2626; font-size: 14px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TradeStock Marketplace</div>
          <p>Ireland's Premier B2B Motor Trading Platform</p>
        </div>
        <div class="content">
          <h2>Welcome, ${businessName}!</h2>
          <p>Your TradeStock Marketplace account has been created. To get started, please set your password by clicking the button below:</p>
          <center>
            <a href="${activationUrl}" class="button">Activate My Account</a>
          </center>
          <p class="expiry">This link will expire in 7 days for security reasons.</p>
          <p>If you didn't request this account, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2026 TradeStock Marketplace. All rights reserved.</p>
          <p>If you're having trouble with the button, copy and paste this URL into your browser:</p>
          <p style="word-break: break-all; font-size: 12px;">${activationUrl}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
}

// SDR activation email
export async function sendSDRActivationEmail(
  to: string,
  fullName: string,
  activationUrl: string
) {
  const subject = "Welcome to TradeStock - Set Your Password";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Set Your Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #0ea5e9; }
        .content { background: #f8fafc; padding: 32px; border-radius: 8px; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 14px; }
        .expiry { color: #dc2626; font-size: 14px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TradeStock Marketplace</div>
          <p>Ireland's Premier B2B Motor Trading Platform</p>
        </div>
        <div class="content">
          <h2>Welcome to the Team, ${fullName}!</h2>
          <p>You've been added as a Sales Development Representative (SDR) for TradeStock Marketplace. Please set your password to access your dashboard:</p>
          <center>
            <a href="${activationUrl}" class="button">Set My Password</a>
          </center>
          <p class="expiry">This link will expire in 7 days for security reasons.</p>
        </div>
        <div class="footer">
          <p>© 2026 TradeStock Marketplace. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
}

// Password reset email
export async function sendPasswordResetEmail(
  to: string,
  resetUrl: string
) {
  const subject = "Reset Your TradeStock Password";
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #0ea5e9; }
        .content { background: #f8fafc; padding: 32px; border-radius: 8px; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 14px; }
        .expiry { color: #dc2626; font-size: 14px; margin-top: 16px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TradeStock Marketplace</div>
        </div>
        <div class="content">
          <h2>Password Reset Request</h2>
          <p>We received a request to reset your password. Click the button below to set a new password:</p>
          <center>
            <a href="${resetUrl}" class="button">Reset Password</a>
          </center>
          <p class="expiry">This link will expire in 1 hour for security reasons.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>© 2026 TradeStock Marketplace. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject, html });
}

// Support ticket notification
export async function sendSupportTicketNotification(
  to: string,
  ticketId: string,
  subject: string,
  ticketUrl: string
) {
  const emailSubject = `Support Ticket Update: ${subject}`;
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Support Ticket Update</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 28px; font-weight: bold; color: #0ea5e9; }
        .content { background: #f8fafc; padding: 32px; border-radius: 8px; }
        .button { display: inline-block; background: #0ea5e9; color: white; padding: 14px 32px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 20px 0; }
        .footer { text-align: center; margin-top: 40px; color: #64748b; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">TradeStock Marketplace</div>
        </div>
        <div class="content">
          <h2>Your Support Ticket Has Been Updated</h2>
          <p><strong>Ticket:</strong> #${ticketId.slice(0, 8)}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <p>There has been a new response to your support ticket. Click below to view:</p>
          <center>
            <a href="${ticketUrl}" class="button">View Ticket</a>
          </center>
        </div>
        <div class="footer">
          <p>© 2026 TradeStock Marketplace. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({ to, subject: emailSubject, html });
}
