import nodemailer from 'nodemailer';

// Create transporter with Gmail configuration
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
    },
});

/**
 * Send password reset OTP email
 */
export async function sendPasswordResetOTP(email: string, otp: string): Promise<boolean> {
    try {
        const mailOptions = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER,
            to: email,
            subject: 'CinemaNest - Password Reset Code',
            html: `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
        <tr>
            <td style="text-align: center; padding-bottom: 24px;">
                <h1 style="color: #1e293b; font-size: 32px; font-weight: 800; margin: 0; letter-spacing: -1px;">
                    🎬 <span style="color: #e11d48;">Cinema</span>Nest
                </h1>
            </td>
        </tr>
        
        <tr>
            <td style="background-color: #ffffff; border-radius: 20px; padding: 40px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06); border: 1px solid #e2e8f0;">
                <h2 style="color: #0f172a; font-size: 24px; font-weight: 700; margin: 0 0 12px 0; text-align: center;">
                    Password Reset Request
                </h2>
                <p style="color: #475569; font-size: 16px; line-height: 1.6; margin: 0 0 32px 0; text-align: center;">
                    Hi there! We received a request to reset your password. Use the verification code below to proceed:
                </p>
                
                <div style="background-color: #f1f5f9; border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 32px 0; border: 2px dashed #cbd5e1;">
                    <span style="font-size: 42px; font-weight: 800; letter-spacing: 12px; color: #1e293b; font-family: 'Courier New', monospace;">
                        ${otp}
                    </span>
                </div>
                
                <div style="text-align: center;">
                    <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0;">
                        This code is valid for <strong style="color: #e11d48;">10 minutes</strong>.
                    </p>
                    <p style="color: #94a3b8; font-size: 13px; margin-top: 12px;">
                        If you didn't request this, you can safely ignore this email. Your account security is our priority.
                    </p>
                </div>
            </td>
        </tr>
        
        <tr>
            <td style="text-align: center; padding-top: 30px;">
                <p style="color: #94a3b8; font-size: 12px; margin: 0; text-transform: uppercase; letter-spacing: 1px;">
                    © ${new Date().getFullYear()} CinemaNest Project
                </p>
                <div style="margin-top: 12px;">
                    <a href="#" style="color: #64748b; text-decoration: none; font-size: 12px; margin: 0 10px;">Support</a>
                    <a href="#" style="color: #64748b; text-decoration: none; font-size: 12px; margin: 0 10px;">Privacy Policy</a>
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
`,
            text: `Your CinemaNest password reset code is: ${otp}\n\nThis code expires in 10 minutes.\n\nIf you didn't request this, please ignore this email.`,
        };

        await transporter.sendMail(mailOptions);
        console.log(`Password reset OTP sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Failed to send password reset email:', error);

        // In development, log the OTP so testing can continue
        if (process.env.NODE_ENV !== 'production') {
            console.log('');
            console.log('========================================');
            console.log('📧 EMAIL FAILED - DEV MODE OTP:');
            console.log(`   Email: ${email}`);
            console.log(`   OTP: ${otp}`);
            console.log('========================================');
            console.log('');
            return true; // Return true in dev so the flow continues
        }

        return false;
    }
}

/**
 * Generate a 6-digit OTP
 */
export function generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
}
