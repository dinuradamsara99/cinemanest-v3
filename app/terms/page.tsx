import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, FileText, Scale, Users, AlertCircle, Ban, DollarSign } from "lucide-react";

export const metadata: Metadata = {
    title: "Terms of Service",
    description: "Read our terms of service to understand your rights and obligations when using CinemaNest.",
};

export default function TermsOfServicePage() {
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
                            <FileText className="w-5 h-5" />
                            <span className="text-sm font-semibold">Legal Terms</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-900 backdrop-blur-xl border border-zinc-800/50 ring-1 ring-white/5 mb-6">
                            <Scale className="w-10 h-10 text-zinc-400" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                            Terms of Service
                        </h1>
                        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
                            Please read these terms carefully before using CinemaNest.
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

                        {/* Acceptance of Terms */}
                        <Section
                            icon={<FileText className="w-6 h-6" />}
                            title="Acceptance of Terms"
                        >
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                By accessing and using CinemaNest, you accept and agree to be bound by the terms and provision of this agreement.
                            </p>
                            <ul className="space-y-3">
                                <ListItem>
                                    You must be at least 18 years old to use this service.
                                </ListItem>
                                <ListItem>
                                    You agree to use the service only for lawful purposes.
                                </ListItem>
                                <ListItem>
                                    You are responsible for maintaining the confidentiality of your account.
                                </ListItem>
                            </ul>
                        </Section>

                        <Divider />

                        {/* User Accounts */}
                        <Section
                            icon={<Users className="w-6 h-6" />}
                            title="User Accounts"
                        >
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                To access certain features of CinemaNest, you must create an account:
                            </p>
                            <ul className="space-y-3">
                                <ListItem>
                                    <strong className="text-white">Account Creation:</strong> You must provide accurate and complete information.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Account Security:</strong> You are responsible for all activities under your account.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Account Termination:</strong> We reserve the right to terminate accounts that violate these terms.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">One Account Per User:</strong> You may not create multiple accounts.
                                </ListItem>
                            </ul>
                        </Section>

                        <Divider />

                        {/* Prohibited Activities */}
                        <Section
                            icon={<Ban className="w-6 h-6" />}
                            title="Prohibited Activities"
                        >
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                When using CinemaNest, you agree NOT to:
                            </p>
                            <ul className="space-y-3">
                                <ListItem>
                                    Share your account credentials with others.
                                </ListItem>
                                <ListItem>
                                    Use automated systems or bots to access the service.
                                </ListItem>
                                <ListItem>
                                    Attempt to bypass any security measures or access restrictions.
                                </ListItem>
                                <ListItem>
                                    Download, copy, or distribute content without authorization.
                                </ListItem>
                                <ListItem>
                                    Use the service for any illegal or unauthorized purpose.
                                </ListItem>
                                <ListItem>
                                    Harass, abuse, or harm other users.
                                </ListItem>
                            </ul>
                        </Section>

                        <Divider />

                        {/* Subscription & Payment */}
                        <Section
                            icon={<DollarSign className="w-6 h-6" />}
                            title="Subscription & Payment"
                        >
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                CinemaNest offers various subscription plans:
                            </p>
                            <ul className="space-y-3">
                                <ListItem>
                                    <strong className="text-white">Billing:</strong> Subscriptions are billed in advance on a recurring basis.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Cancellation:</strong> You may cancel your subscription at any time.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Refunds:</strong> Refunds are issued at our discretion based on our refund policy.
                                </ListItem>
                                <ListItem>
                                    <strong className="text-white">Price Changes:</strong> We reserve the right to modify subscription prices with 30 days notice.
                                </ListItem>
                            </ul>
                        </Section>

                        <Divider />

                        {/* Disclaimer */}
                        <Section
                            icon={<AlertCircle className="w-6 h-6" />}
                            title="Disclaimer of Warranties"
                        >
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                CinemaNest is provided "as is" without warranties of any kind:
                            </p>
                            <ul className="space-y-3">
                                <ListItem>
                                    We do not guarantee uninterrupted or error-free service.
                                </ListItem>
                                <ListItem>
                                    Content availability may vary and change without notice.
                                </ListItem>
                                <ListItem>
                                    We are not responsible for third-party content or links.
                                </ListItem>
                                <ListItem>
                                    Streaming quality depends on your internet connection.
                                </ListItem>
                            </ul>
                        </Section>

                        <Divider />

                        {/* Contact */}
                        <div className="bg-zinc-800/50 backdrop-blur-sm rounded-xl p-6 sm:p-8 border border-zinc-700/50">
                            <h3 className="text-xl font-semibold text-white mb-3">Questions About Terms?</h3>
                            <p className="text-zinc-300 leading-relaxed mb-4">
                                If you have any questions about these Terms of Service, please contact us:
                            </p>
                            <div className="space-y-2 text-zinc-400">
                                <p>
                                    <strong className="text-zinc-300">Email:</strong>{" "}
                                    <a href="mailto:legal@cinemanest.com" className="text-zinc-400 hover:text-white transition-colors">
                                        legal@cinemanest.com
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
                        These terms may be updated from time to time. We will notify you of any material changes.
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
