import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sanitizeInput } from "@/lib/security";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { email, otp } = body;

        if (!email || !otp) {
            return NextResponse.json(
                { error: "Email and OTP are required" },
                { status: 400 }
            );
        }

        const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
        const sanitizedOTP = sanitizeInput(otp.trim());

        // Find the password reset record
        const passwordReset = await prisma.passwordReset.findFirst({
            where: {
                email: sanitizedEmail,
                otp: sanitizedOTP,
                used: false
            },
            orderBy: {
                createdAt: 'desc'
            }
        });

        if (!passwordReset) {
            return NextResponse.json(
                { error: "Invalid OTP. Please check and try again." },
                { status: 400 }
            );
        }

        // Check if OTP has expired
        if (new Date() > passwordReset.expiresAt) {
            // Delete expired OTP
            await prisma.passwordReset.delete({
                where: { id: passwordReset.id }
            });

            return NextResponse.json(
                { error: "OTP has expired. Please request a new one." },
                { status: 400 }
            );
        }

        // OTP is valid - return success with a verification token
        // We don't mark it as used yet - that happens when password is reset
        return NextResponse.json({
            message: "OTP verified successfully",
            verified: true,
            resetToken: passwordReset.id // Use the record ID as a simple token
        });

    } catch (error) {
        console.error("Verify OTP error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
