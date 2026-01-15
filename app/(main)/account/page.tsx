import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { User, Mail, Calendar, Shield } from "lucide-react";
import Image from "next/image";


import { UserRequestsList } from "@/components/dashboard/UserRequestsList";

export const metadata = {
    title: "My Account - CinemaNest",
    description: "Manage your CinemaNest account",
};

export default async function AccountPage() {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
        redirect("/");
    }

    const user = session.user;
    const joinedDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="min-h-screen bg-zinc-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">My Account</h1>
                    <p className="text-zinc-400">Manage your profile and account settings</p>
                </div>

                {/* Profile Card */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 mb-6">
                    <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative">
                            {user.image ? (
                                <Image
                                    src={user.image}
                                    alt={user.name || "User"}
                                    width={120}
                                    height={120}
                                    className="rounded-full ring-4 ring-zinc-800"
                                />
                            ) : (
                                <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-br from-zinc-700 to-zinc-800 flex items-center justify-center ring-4 ring-zinc-800">
                                    <User className="w-12 h-12 text-zinc-400" />
                                </div>
                            )}
                            <div className="absolute -bottom-2 -right-2 bg-green-500 w-8 h-8 rounded-full border-4 border-zinc-900"></div>
                        </div>

                        {/* User Info */}
                        <div className="flex-1 text-center sm:text-left">
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {user.name || "User"}
                            </h2>
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-zinc-400 justify-center sm:justify-start">
                                    <Mail className="w-4 h-4" />
                                    <span className="text-sm">{user.email}</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-400 justify-center sm:justify-start">
                                    <Calendar className="w-4 h-4" />
                                    <span className="text-sm">Joined {joinedDate}</span>
                                </div>
                                <div className="flex items-center gap-2 text-zinc-400 justify-center sm:justify-start">
                                    <Shield className="w-4 h-4" />
                                    <span className="text-sm">Active Member</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Welcome Message */}
                <div className="bg-gradient-to-r from-zinc-900 to-zinc-800 border border-zinc-700 rounded-2xl p-6 mb-6">
                    <h3 className="text-xl font-semibold text-white mb-2">
                        Welcome back, {user.name?.split(" ")[0] || "there"}! 🎬
                    </h3>
                    <p className="text-zinc-400">
                        You're all set! Browse our collection and enjoy unlimited streaming.
                    </p>
                </div>



                {/* Movie Requests Section */}
                <div className="mt-8">
                    <h3 className="text-xl font-semibold text-white mb-4">My Requests</h3>
                    <div className="w-full">
                        <UserRequestsList />
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <a
                        href="/"
                        className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 transition-all duration-200 hover:bg-zinc-800/50 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                                <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Home</h4>
                                <p className="text-sm text-zinc-400">Browse content</p>
                            </div>
                        </div>
                    </a>

                    <a
                        href="/trending"
                        className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 transition-all duration-200 hover:bg-zinc-800/50 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                                <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">Trending</h4>
                                <p className="text-sm text-zinc-400">Popular now</p>
                            </div>
                        </div>
                    </a>

                    <a
                        href="/tv-shows"
                        className="bg-zinc-900 border border-zinc-800 hover:border-zinc-700 rounded-xl p-6 transition-all duration-200 hover:bg-zinc-800/50 group"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-zinc-800 flex items-center justify-center group-hover:bg-zinc-700 transition-colors">
                                <svg className="w-6 h-6 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                                </svg>
                            </div>
                            <div>
                                <h4 className="font-semibold text-white">TV Shows</h4>
                                <p className="text-sm text-zinc-400">Series & more</p>
                            </div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
}
