import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { generateOTP, sendPasswordResetOTP } from "@/lib/email";
import { sanitizeInput } from "@/lib/security";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email } = body;

        if (!email) {
            return NextResponse.json(
                { error: "Email is required" },
                { status: 400 }
            );
        }

        // Sanitize and validate email
        const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(sanitizedEmail)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Check if user exists
        const user = await prisma.user.findUnique({
            where: { email: sanitizedEmail }
        });

        // For security, don't reveal if email exists or not
        // But we still need to check to avoid sending emails to non-existent users
        if (!user) {
            // Return success even if user doesn't exist (security best practice)
            return NextResponse.json({
                message: "If an account exists with this email, you will receive a password reset code."
            });
        }

        // Note: We allow OAuth users to set a password too, so they can login with either method

        // Delete any existing OTPs for this email
        await prisma.passwordReset.deleteMany({
            where: { email: sanitizedEmail }
        });

        // Generate new OTP
        const otp = generateOTP();
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        // Store OTP in database
        await prisma.passwordReset.create({
            data: {
                email: sanitizedEmail,
                otp,
                expiresAt
            }
        });

        // Send OTP via email
        const emailSent = await sendPasswordResetOTP(sanitizedEmail, otp);

        if (!emailSent) {
            return NextResponse.json(
                { error: "Failed to send email. Please try again." },
                { status: 500 }
            );
        }

        return NextResponse.json({
            message: "If an account exists with this email, you will receive a password reset code."
        });

    } catch (error) {
        console.error("Forgot password error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
