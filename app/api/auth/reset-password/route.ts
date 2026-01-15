import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, otp, resetToken, password } = body;

        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        if (!otp && !resetToken) {
            return NextResponse.json(
                { error: "OTP or reset token is required" },
                { status: 400 }
            );
        }

        // Validate password
        if (password.length < 6) {
            return NextResponse.json(
                { error: "Password must be at least 6 characters" },
                { status: 400 }
            );
        }

        if (password.length > 100) {
            return NextResponse.json(
                { error: "Password is too long" },
                { status: 400 }
            );
        }

        const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());

        // Find the password reset record
        let passwordReset;

        if (resetToken) {
            // Use reset token (ID) if provided
            passwordReset = await prisma.passwordReset.findUnique({
                where: { id: resetToken }
            });
        } else {
            // Fall back to OTP lookup
            const sanitizedOTP = sanitizeInput(otp.trim());
            passwordReset = await prisma.passwordReset.findFirst({
                where: {
                    email: sanitizedEmail,
                    otp: sanitizedOTP,
                    used: false
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });
        }

        if (!passwordReset) {
            return NextResponse.json(
                { error: "Invalid or expired reset request. Please try again." },
                { status: 400 }
            );
        }

        // Verify email matches
        if (passwordReset.email !== sanitizedEmail) {
            return NextResponse.json(
                { error: "Invalid reset request." },
                { status: 400 }
            );
        }

        // Check if already used
        if (passwordReset.used) {
            return NextResponse.json(
                { error: "This reset code has already been used." },
                { status: 400 }
            );
        }

        // Check if OTP has expired
        if (new Date() > passwordReset.expiresAt) {
            await prisma.passwordReset.delete({
                where: { id: passwordReset.id }
            });

            return NextResponse.json(
                { error: "Reset code has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Update user password
        await prisma.user.update({
            where: { email: sanitizedEmail },
            data: { hashedPassword }
        });

        // Mark OTP as used and delete it
        await prisma.passwordReset.delete({
            where: { id: passwordReset.id }
        });

        return NextResponse.json({
            message: "Password reset successfully. You can now login with your new password."
        });

    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
