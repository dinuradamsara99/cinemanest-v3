import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { isOTPExpired } from '@/lib/otp';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
    try {
        console.log('🔵 Verify OTP - Step 1: Received verification request');
        const { email, otp, newPassword } = await request.json();
        console.log('📧 Email:', email);
        console.log('🔢 OTP received:', otp);
        console.log('🔑 New password length:', newPassword?.length);

        // Validate input
        if (!email || !otp || !newPassword) {
            console.log('❌ Missing required fields');
            return NextResponse.json(
                { success: false, message: 'All fields are required' },
                { status: 400 }
            );
        }

        if (newPassword.length < 8) {
            console.log('❌ Password too short');
            return NextResponse.json(
                { success: false, message: 'Password must be at least 8 characters' },
                { status: 400 }
            );
        }

        // Find OTP record
        console.log('🔵 Step 2: Looking for OTP in database');
        const otpResult = await query(
            `SELECT id, otp_code, expires_at, used, attempts
       FROM password_reset_otps
       WHERE email = $1
       ORDER BY created_at DESC
       LIMIT 1`,
            [email.toLowerCase()]
        );

        console.log('📊 OTP records found:', otpResult.rows.length);
        if (otpResult.rows.length > 0) {
            const record = otpResult.rows[0];
            console.log('🔢 Expected OTP:', record.otp_code);
            console.log('🔢 Received OTP:', otp);
            console.log('⏰ Expires at:', record.expires_at);
            console.log('✅ Used:', record.used);
            console.log('🔄 Attempts:', record.attempts);
        }

        if (otpResult.rows.length === 0) {
            console.log('❌ No OTP record found');
            return NextResponse.json(
                { success: false, message: 'No OTP found. Please request a new code.' },
                { status: 404 }
            );
        }

        const otpRecord = otpResult.rows[0];

        // Check if already used
        if (otpRecord.used) {
            console.log('❌ OTP already used');
            return NextResponse.json(
                { success: false, message: 'This code has already been used.' },
                { status: 400 }
            );
        }

        // Check expiration
        console.log('🔵 Step 3: Checking expiration');
        if (isOTPExpired(otpRecord.expires_at)) {
            console.log('❌ OTP expired');
            await query('DELETE FROM password_reset_otps WHERE id = $1', [otpRecord.id]);
            return NextResponse.json(
                { success: false, message: 'Code has expired. Please request a new one.' },
                { status: 400 }
            );
        }
        console.log('✅ OTP not expired');

        // Check attempt limit
        console.log('🔵 Step 4: Checking attempt limit');
        if (otpRecord.attempts >= 5) {
            console.log('❌ Too many attempts');
            await query('DELETE FROM password_reset_otps WHERE id = $1', [otpRecord.id]);
            return NextResponse.json(
                { success: false, message: 'Too many failed attempts. Please request a new code.' },
                { status: 400 }
            );
        }
        console.log('✅ Attempts OK:', otpRecord.attempts, '/ 5');

        // Verify OTP
        console.log('🔵 Step 5: Comparing OTP codes');
        console.log('Expected (DB):', otpRecord.otp_code, 'Type:', typeof otpRecord.otp_code);
        console.log('Received:', otp, 'Type:', typeof otp);

        if (otpRecord.otp_code !== otp) {
            console.log('❌ OTP does not match!');
            // Increment attempts
            await query(
                'UPDATE password_reset_otps SET attempts = attempts + 1 WHERE id = $1',
                [otpRecord.id]
            );
            return NextResponse.json(
                { success: false, message: 'Invalid code. Please try again.' },
                { status: 400 }
            );
        }
        console.log('✅ OTP matches!');

        // Hash new password
        console.log('🔵 Step 6: Hashing password');
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        console.log('✅ Password hashed');

        // Update user password
        console.log('🔵 Step 7: Updating user password');
        await query(
            'UPDATE "User" SET password = $1 WHERE email = $2',
            [hashedPassword, email.toLowerCase()]
        );
        console.log('✅ Password updated in database');

        // Mark OTP as used and delete
        console.log('🔵 Step 8: Deleting OTP record');
        await query('DELETE FROM password_reset_otps WHERE id = $1', [otpRecord.id]);
        console.log('✅ OTP deleted');

        console.log('🎉 Password reset successful!');
        return NextResponse.json({
            success: true,
            message: 'Password reset successfully!',
        });
    } catch (error: any) {
        console.error('❌ Verify OTP Error:', error);
        console.error('Error details:', {
            message: error.message,
            stack: error.stack,
        });
        return NextResponse.json(
            {
                success: false,
                message: 'Failed to verify OTP. Please try again.',
                error: error.message
            },
            { status: 500 }
        );
    }
}
