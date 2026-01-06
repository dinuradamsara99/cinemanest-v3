import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Shield, Lock, Eye, Cookie, Mail } from "lucide-react";

export const metadata: Metadata = {
    title: "Privacy Policy",
    description: "Learn how CinemaNest collects, uses, and protects your personal information. Your privacy matters to us.",
};

export default function PrivacyPolicyPage() {
    return (
        <div className="min-h-screen bg-black">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-zinc-900/80 backdrop-blur-xl border-b border-zinc-800/50">
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link
                            href="/"
                            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors group"
                        >
                            <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                            <span className="text-sm font-medium">Back to Home</span>
                        </Link>
                        <div className="flex items-center gap-2 text-zinc-400">
                            <Shield className="w-5 h-5" />
                            <span className="text-sm font-semibold">Secure & Private</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-900 backdrop-blur-xl border border-zinc-800/50 ring-1 ring-white/5 mb-6">
                            <Shield className="w-10 h-10 text-zinc-400" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                            Privacy Policy
                        </h1>
                        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
                            Your privacy is important to us. Learn how we collect, use, and protect your information.
                        </p>
                        <p className="text-sm text-zinc-500">
                            Last Updated: January 5, 2026
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="bg-zinc-900 backdrop-blur-xl rounded-2xl border border-zinc-800/50 ring-1 ring-white/5 overflow-hidden">
                    <div className="p-6 sm:p-8 lg:p-12 space-y-12">

                        {/* Information We Collect */}
                        <Section
                            icon={<Eye className="w-6 h-6 " />}
                            title="Information We Collect"
                        >
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                We collect information to provide better services to our users. The types of information we collect include:
                            </p>
                            <ul className="space-y-3">
                                <ListItem>
                                    <strong className="text-white">Account Information:</strong> When you create an account, we collect your name, email address, and password.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Viewing History:</strong> We track the movies and TV shows you watch to provide personalized recommendations.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Device Information:</strong> We collect information about the device you use to access CinemaNest, including device type, operating system, and browser.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Usage Data:</strong> We collect data about how you interact with our platform, including pages visited, features used, and time spent.
                                </ListItem>
                            </ul>
                        </Section>

                        <Divider />

                        {/* How We Use Your Information */}
                        <Section
                            icon={<Lock className="w-6 h-6" />}
                            title="How We Use Your Information"
                        >
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                We use the information we collect for the following purposes:
                            </p>
                            <ul className="space-y-3">
                                <ListItem>
                                    <strong className="text-white">Service Delivery:</strong> To provide, maintain, and improve our streaming services.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Personalization:</strong> To recommend content based on your viewing history and preferences.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Communication:</strong> To send you updates, newsletters, and promotional materials (you can opt-out anytime).
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Security:</strong> To detect, prevent, and respond to fraud, abuse, security risks, and technical issues.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Analytics:</strong> To understand how users interact with our platform and improve user experience.
                                </ListItem>
                            </ul>
                        </Section>

                        <Divider />

                        {/* Data Protection */}
                        <Section
                            icon={<Shield className="w-6 h-6" />}
                            title="Data Protection & Security"
                        >
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                We implement industry-standard security measures to protect your personal information:
                            </p>
                            <ul className="space-y-3">
                                <ListItem>
                                    All data transmission is encrypted using SSL/TLS protocols.
                                </ListItem>
                                <ListItem>
                                    Your password is securely hashed and never stored in plain text.
                                </ListItem>
                                <ListItem>
                                    We conduct regular security audits and vulnerability assessments.
                                </ListItem>
                                <ListItem>
                                    Access to your personal data is restricted to authorized personnel only.
                                </ListItem>
                            </ul>
                        </Section>

                        <Divider />

                        {/* Cookies */}
                        <Section
                            icon={<Cookie className="w-6 h-6" />}
                            title="Cookies & Tracking Technologies"
                        >
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                We use cookies and similar tracking technologies to enhance your experience:
                            </p>
                            <ul className="space-y-3">
                                <ListItem>
                                    <strong className="text-white">Essential Cookies:</strong> Required for basic site functionality, such as maintaining your login session.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Analytics Cookies:</strong> Help us understand how visitors use our platform.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Preference Cookies:</strong> Remember your settings and preferences.
                                </ListItem>
                            </ul>
                        </Section>

                        <Divider />

                        {/* Your Rights */}
                        <Section
                            icon={<Mail className="w-6 h-6" />}
                            title="Your Rights & Choices"
                        >
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                You have the following rights regarding your personal information:
                            </p>
                            <ul className="space-y-3">
                                <ListItem>
                                    <strong className="text-white">Access:</strong> You can request a copy of the personal data we hold about you.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Correction:</strong> You can update or correct your personal information through your account settings.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Deletion:</strong> You can request deletion of your account and associated data.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Opt-Out:</strong> You can unsubscribe from marketing communications at any time.
                                </ListItem>
                            </ul>
                        </Section>

                        <Divider />

                        {/* Contact */}
                        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-zinc-700/50">
                            <h3 className="text-xl font-semibold text-white mb-3">Contact Us</h3>
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                If you have any questions or concerns about this Privacy Policy or our data practices, please contact us:
                            </p>
                            <div className="space-y-2 text-zinc-400">
                                <p>
                                    <strong className="text-zinc-300">Email:</strong>{" "}
                                    <a href="mailto:privacy@cinemanest.com" className="text-zinc-400 hover:text-white transition-colors">
                                        privacy@cinemanest.com
                                    </a>
                                </p>
                                <p>
                                    <strong className="text-zinc-300">Response Time:</strong> We typically respond within 48 hours
                                </p>
                            </div>
                        </div>

                    </div>
                </div>
            </div>

            {/* Footer Note */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="text-center space-y-4">
                    <p className="text-sm text-zinc-500">
                        This privacy policy may be updated from time to time. We will notify you of any changes by posting the new policy on this page.
                    </p>
                    <Link
                        href="/"
                        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-medium"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Return to CinemaNest
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Reusable Components
function Section({
    icon,
    title,
    children
}: {
    icon: React.ReactNode;
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center gap-4">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700/50">
                    <div className="text-zinc-400">
                        {icon}
                    </div>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white">
                    {title}
                </h2>
            </div>
            <div className="pl-0 sm:pl-16">
                {children}
            </div>
        </div>
    );
}

function ListItem({ children }: { children: React.ReactNode }) {
    return (
        <li className="flex gap-3 text-zinc-300 leading-relaxed">
            <span className="text-zinc-600 mt-1.5 flex-shrink-0">•</span>
            <span>{children}</span>
        </li>
    );
}

function Divider() {
    return <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />;
}
