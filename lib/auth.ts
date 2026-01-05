import { NextAuthOptions } from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import CredentialsProvider from "next-auth/providers/credentials";
import GoogleProvider from "next-auth/providers/google";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

export const authOptions: NextAuthOptions = {
    adapter: PrismaAdapter(prisma) as any,
    providers: [
        CredentialsProvider({
            name: "credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) {
                    throw new Error("Invalid credentials");
                }

                const user = await prisma.user.findUnique({
                    where: {
                        email: credentials.email,
                    },
                });

                if (!user || !user.hashedPassword) {
                    throw new Error("Invalid credentials");
                }

                const isCorrectPassword = await bcrypt.compare(
                    credentials.password,
                    user.hashedPassword
                );

                if (!isCorrectPassword) {
                    throw new Error("Invalid credentials");
                }

                return user;
            },
        }),
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID!,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
        }),
    ],
    callbacks: {
        async signIn({ account, profile, user, email }) {
            // Allow OAuth account linking
            if (account?.provider === 'google' && profile?.email) {
                // Check if a user already exists with this email
                const existingUser = await prisma.user.findUnique({
                    where: { email: profile.email as string },
                    include: { accounts: true }
                });

                if (existingUser) {
                    // Check if this Google account is already linked
                    const accountLinked = existingUser.accounts.some(
                        acc => acc.provider === 'google' && acc.providerAccountId === account.providerAccountId
                    );

                    if (!accountLinked) {
                        // Link the Google account to the existing user
                        await prisma.account.create({
                            data: {
                                userId: existingUser.id,
                                type: account.type,
                                provider: account.provider,
                                providerAccountId: account.providerAccountId,
                                access_token: account.access_token,
                                expires_at: account.expires_at,
                                token_type: account.token_type,
                                scope: account.scope,
                                id_token: account.id_token,
                                refresh_token: account.refresh_token,
                            }
                        });
                    }
                }
            }
            return true; // Allow all sign-ins
        },
        async redirect({ url, baseUrl }) {
            // Always redirect to account page after successful login
            return `${baseUrl}/account`;
        },
        async session({ token, session }) {
            if (token && session.user) {
                session.user.id = token.id;
                session.user.name = token.name;
                session.user.email = token.email;
                session.user.image = token.picture;
            }

            return session;
        },
        async jwt({ token, user, account, profile }) {
            // Initial sign in
            if (user && account) {
                // For new users via OAuth, save user info to token
                return {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    picture: user.image,
                };
            }

            // Return existing token
            return token;
        },
    },
    session: {
        strategy: "jwt",
    },
    debug: process.env.NODE_ENV === "development",
    secret: process.env.NEXTAUTH_SECRET,
};
