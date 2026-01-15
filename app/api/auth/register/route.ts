import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sanitizeInput, validateLength } from "@/lib/security";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { name, email, password } = body;

        // Validate required fields
        if (!email || !password) {
            return NextResponse.json(
                { error: "Email and password are required" },
                { status: 400 }
            );
        }

        // Validate email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json(
                { error: "Invalid email format" },
                { status: 400 }
            );
        }

        // Validate password length
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

        // Sanitize inputs
        const sanitizedEmail = sanitizeInput(email.toLowerCase().trim());
        const sanitizedName = name ? sanitizeInput(name.trim()) : null;

        // Validate name length if provided
        if (sanitizedName && !validateLength(sanitizedName, 1, 100)) {
            return NextResponse.json(
                { error: "Name must be between 1 and 100 characters" },
                { status: 400 }
            );
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email: sanitizedEmail }
        });

        if (existingUser) {
            return NextResponse.json(
                { error: "An account with this email already exists" },
                { status: 409 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name: sanitizedName,
                email: sanitizedEmail,
                hashedPassword,
            }
        });

        return NextResponse.json(
            {
                message: "Account created successfully",
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email
                }
            },
            { status: 201 }
        );

    } catch (error) {
        console.error("Registration error:", error);
        return NextResponse.json(
            { error: "Something went wrong. Please try again." },
            { status: 500 }
        );
    }
}
