import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { Resend } from "resend";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Check if user exists
    const { data: userData, error: userError } = await supabase.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error listing users:", userError);
      return NextResponse.json(
        { error: "Failed to process request" },
        { status: 500 }
      );
    }

    const user = userData.users.find((u) => u.email === email);

    if (!user) {
      // Don't reveal if user exists or not for security
      return NextResponse.json(
        { message: "If an account exists, a reset email has been sent" },
        { status: 200 }
      );
    }

    // Generate password reset token using Supabase
    const { data: resetData, error: resetError } = await supabase.auth.admin.generateLink({
      type: "recovery",
      email: email,
      options: {
        redirectTo: `${process.env.APP_BASE_URL || "https://your-site.vercel.app"}/auth/reset-password`,
      },
    });

    if (resetError) {
      console.error("Error generating reset link:", resetError);
      return NextResponse.json(
        { error: "Failed to generate reset link" },
        { status: 500 }
      );
    }

    // Send email via Resend
    const resend = new Resend(process.env.RESEND_API_KEY);

    const { error: emailError } = await resend.emails.send({
      from: "TradeStock <noreply@tradestock.ie>",
      to: email,
      subject: "Reset Your TradeStock Password",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
        </head>
        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background: #f8fafc; border-radius: 8px; padding: 40px; text-align: center;">
            <h1 style="color: #1a1f36; margin-bottom: 10px;">TradeStock</h1>
            <p style="color: #64748b; margin-bottom: 30px;">The B2B Dealership Marketplace</p>
            
            <h2 style="color: #1a1f36; margin-bottom: 20px;">Reset Your Password</h2>
            <p style="color: #475569; margin-bottom: 30px;">
              We received a request to reset your password. Click the button below to create a new password.
            </p>
            
            <a href="${resetData.properties.action_link}" 
               style="display: inline-block; background: #3b82f6; color: white; text-decoration: none; padding: 14px 32px; border-radius: 6px; font-weight: 600; margin-bottom: 30px;">
              Reset Password
            </a>
            
            <p style="color: #64748b; font-size: 14px; margin-bottom: 20px;">
              Or copy and paste this link into your browser:
            </p>
            <p style="color: #3b82f6; font-size: 12px; word-break: break-all; margin-bottom: 30px;">
              ${resetData.properties.action_link}
            </p>
            
            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; margin-top: 30px;">
              <p style="color: #94a3b8; font-size: 12px; margin-bottom: 10px;">
                This link will expire in 1 hour for security reasons.
              </p>
              <p style="color: #94a3b8; font-size: 12px;">
                If you didn't request this reset, you can safely ignore this email.
              </p>
            </div>
          </div>
          
          <div style="text-align: center; padding: 20px;">
            <p style="color: #94a3b8; font-size: 12px;">
              © 2026 TradeStock Marketplace. All rights reserved.
            </p>
          </div>
        </body>
        </html>
      `,
    });

    if (emailError) {
      console.error("Error sending email:", emailError);
      return NextResponse.json(
        { error: "Failed to send reset email" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Password reset email sent" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
