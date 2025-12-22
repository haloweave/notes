import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { emailOTP } from 'better-auth/plugins';
import { Resend } from 'resend';
import { db } from './db';

const resend = new Resend(process.env.RESEND_API_KEY);

export const auth = betterAuth({
    database: drizzleAdapter(db, {
        provider: 'pg',
    }),
    emailAndPassword: {
        enabled: true,
    },
    user: {
        additionalFields: {
            credits: {
                type: "number",
                defaultValue: 0
            }
        }
    },
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    plugins: [
        emailOTP({
            async sendVerificationOTP({ email, otp, type }) {
                console.log('[EMAIL_OTP] Sending OTP to:', email);
                console.log('[EMAIL_OTP] Type:', type);
                console.log('[EMAIL_OTP] OTP:', otp);

                let subject = 'Your Huggnote verification code';
                let heading = 'Verify your email';
                let message = 'Enter this code to verify your email address:';

                if (type === 'sign-in') {
                    subject = 'Sign in to Huggnote';
                    heading = 'Your sign-in code';
                    message = 'Enter this code to sign in to your Huggnote account:';
                } else if (type === 'forget-password') {
                    subject = 'Reset your Huggnote password';
                    heading = 'Password reset code';
                    message = 'Enter this code to reset your password:';
                }

                try {
                    const result = await resend.emails.send({
                        from: 'Huggnote <noreply@huggnotebespoke.com>',
                        to: email,
                        subject,
                        html: `
                            <!DOCTYPE html>
                            <html>
                            <head>
                                <meta charset="utf-8">
                                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            </head>
                            <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
                                <table role="presentation" style="width: 100%; border-collapse: collapse;">
                                    <tr>
                                        <td align="center" style="padding: 40px 0;">
                                            <table role="presentation" style="width: 600px; max-width: 100%; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                                                <!-- Header -->
                                                <tr>
                                                    <td style="padding: 40px 40px 20px; text-align: center;">
                                                        <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #1f2937;">${heading}</h1>
                                                    </td>
                                                </tr>
                                                
                                                <!-- Content -->
                                                <tr>
                                                    <td style="padding: 0 40px 30px;">
                                                        <p style="margin: 0 0 20px; font-size: 16px; line-height: 24px; color: #4b5563; text-align: center;">
                                                            ${message}
                                                        </p>
                                                        
                                                        <!-- OTP Code -->
                                                        <table role="presentation" style="width: 100%; margin: 30px 0;">
                                                            <tr>
                                                                <td align="center">
                                                                    <div style="display: inline-block; padding: 20px 40px; background: linear-gradient(to right, #2F5A8E, #86CCEA); border-radius: 12px;">
                                                                        <span style="font-size: 32px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Courier New', monospace;">
                                                                            ${otp}
                                                                        </span>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        </table>
                                                        
                                                        <p style="margin: 20px 0 0; font-size: 14px; line-height: 20px; color: #6b7280; text-align: center;">
                                                            This code will expire in 5 minutes.
                                                        </p>
                                                        <p style="margin: 10px 0 0; font-size: 14px; line-height: 20px; color: #6b7280; text-align: center;">
                                                            If you didn't request this code, you can safely ignore this email.
                                                        </p>
                                                    </td>
                                                </tr>
                                                
                                                <!-- Footer -->
                                                <tr>
                                                    <td style="padding: 30px 40px; background-color: #f9fafb; border-radius: 0 0 16px 16px;">
                                                        <p style="margin: 0; font-size: 12px; line-height: 18px; color: #9ca3af; text-align: center;">
                                                            © ${new Date().getFullYear()} Huggnote. All rights reserved.
                                                        </p>
                                                    </td>
                                                </tr>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </body>
                            </html>
                        `,
                        text: `${heading}\n\n${message}\n\n${otp}\n\nThis code will expire in 5 minutes.\n\nIf you didn't request this code, you can safely ignore this email.`,
                    });

                    if (result.error) {
                        console.error('[EMAIL_OTP] Failed to send email:', result.error);
                        throw new Error('Failed to send OTP email');
                    }

                    console.log('[EMAIL_OTP] Email sent successfully:', result.data?.id);
                } catch (error) {
                    console.error('[EMAIL_OTP] Error sending email:', error);
                    throw error;
                }
            },
            otpLength: 6,
            expiresIn: 300, // 5 minutes
            allowedAttempts: 3,
        }),
    ],
    secret: process.env.BETTER_AUTH_SECRET || 'your-secret-key-change-in-production-min-32-characters-long',
    baseURL: process.env.BETTER_AUTH_URL || 'http://localhost:3000',
    trustedOrigins: process.env.BETTER_AUTH_TRUSTED_ORIGINS ? [process.env.BETTER_AUTH_TRUSTED_ORIGINS] : undefined,
});
