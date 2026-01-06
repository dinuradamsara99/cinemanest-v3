import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { generateOTP, getOTPExpiration } from '@/lib/otp';
import { resend } from '@/lib/resend';

// Rate limiting: Store request counts in memory (simple approach)
const requestCounts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(email: string): boolean {
  const now = Date.now();
  const record = requestCounts.get(email);

  if (!record || now > record.resetAt) {
    // Reset or create new record
    requestCounts.set(email, {
      count: 1,
      resetAt: now + 60 * 60 * 1000, // 1 hour
    });
    return true;
  }

  if (record.count >= 3) {
    return false; // Rate limit exceeded
  }

  record.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔵 Step 1: Received OTP request');
    const { email } = await request.json();
    console.log('📧 Email:', email);

    // Validate input
    if (!email || typeof email !== 'string') {
      console.log('❌ Invalid email format');
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    // Check rate limit
    console.log('🔵 Step 2: Checking rate limit');
    if (!checkRateLimit(email.toLowerCase())) {
      console.log('❌ Rate limit exceeded');
      return NextResponse.json(
        { success: false, message: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Check if user exists
    console.log('🔵 Step 3: Checking if user exists');
    const userResult = await query(
      'SELECT email FROM "User" WHERE email = $1 LIMIT 1',
      [email.toLowerCase()]
    );
    console.log('👤 User found:', userResult.rows.length > 0);

    if (userResult.rows.length === 0) {
      console.log('❌ Email not found in database');
      return NextResponse.json(
        { success: false, message: 'Email not found' },
        { status: 404 }
      );
    }

    // Generate OTP
    console.log('🔵 Step 4: Generating OTP');
    const otpCode = generateOTP();
    const expiresAt = getOTPExpiration();
    console.log('🔢 OTP Code:', otpCode);
    console.log('⏰ Expires at:', expiresAt);

    // Delete any existing OTPs for this email
    console.log('🔵 Step 5: Deleting old OTPs');
    await query(
      'DELETE FROM password_reset_otps WHERE email = $1',
      [email.toLowerCase()]
    );

    // Store OTP in database
    console.log('🔵 Step 6: Storing OTP in database');
    await query(
      'INSERT INTO password_reset_otps (email, otp_code, expires_at) VALUES ($1, $2, $3)',
      [email.toLowerCase(), otpCode, expiresAt.toISOString()]
    );
    console.log('✅ OTP stored in database');

    // Send email with OTP
    console.log('🔵 Step 7: Sending email via Resend');
    console.log('📧 From: CinemaNest <noreply@resend.dev>');
    console.log('📧 To:', email);

    const emailResult = await resend.emails.send({
      from: 'CinemaNest <noreply@resend.dev>',
      to: email,
      subject: 'Reset Your Password - CinemaNest',
      html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Reset Your Password - CinemaNest</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #09090b;">
  <div style="background: #18181b; color: white; padding: 40px 30px; border-radius: 12px; border: 1px solid #27272a;">
    <h1 style="margin: 0 0 20px 0; font-size: 24px; font-weight: 600;">Reset Your Password</h1>
    <p style="color: #a1a1aa; margin-bottom: 30px; line-height: 1.6;">
      You requested to reset your password for CinemaNest. Use the code below:
    </p>
    
    <div style="background: #27272a; padding: 30px; border-radius: 8px; text-align: center; margin: 30px 0; border: 1px solid #3f3f46;">
      <div style="font-size: 40px; font-weight: bold; letter-spacing: 12px; color: white; font-family: monospace;">
        ${otpCode}
      </div>
    </div>
    
    <p style="color: #a1a1aa; font-size: 14px; margin-bottom: 10px;">
      This code expires in <strong style="color: white;">5 minutes</strong>.
    </p>
    
    <p style="color: #71717a; font-size: 12px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #27272a;">
      If you didn't request this, please ignore this email. Your password will remain unchanged.
    </p>
  </div>
</body>
</html>
      `,
    });

    console.log('✅ Email sent! Resend response:', emailResult);

    return NextResponse.json({
      success: true,
      message: 'OTP sent successfully. Check your email.',
    });
  } catch (error: any) {
    console.error('Send OTP Error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name,
    });
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send OTP. Please try again.',
        error: error.message // Include error in response for debugging
      },
      { status: 500 }
    );
  }
}
