"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Mail, MessageSquare, MapPin, Phone, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";

export default function ContactPage() {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus('idle');

        const formData = new FormData(e.currentTarget);

        try {
            const response = await fetch("https://api.web3forms.com/submit", {
                method: "POST",
                body: formData,
            });

            const data = await response.json();

            if (data.success) {
                setSubmitStatus('success');
                (e.target as HTMLFormElement).reset();

                // Reset success message after 5 seconds
                setTimeout(() => {
                    setSubmitStatus('idle');
                }, 5000);
            } else {
                throw new Error(data.message || 'Submission failed');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            setSubmitStatus('error');

            // Reset error message after 5 seconds
            setTimeout(() => {
                setSubmitStatus('idle');
            }, 5000);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                            <MessageSquare className="w-5 h-5" />
                            <span className="text-sm font-semibold">Get in Touch</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Hero Section */}
            <div className="relative overflow-hidden">
                <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                    <div className="text-center space-y-4">
                        <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-zinc-900 backdrop-blur-xl border border-zinc-800/50 ring-1 ring-white/5 mb-6">
                            <Mail className="w-10 h-10 text-zinc-400" />
                        </div>
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white tracking-tight">
                            Contact Us
                        </h1>
                        <p className="text-lg sm:text-xl text-zinc-400 max-w-2xl mx-auto">
                            Have a question or need help? We're here for you.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* Contact Information */}
                    <div className="space-y-8">
                        <div className="bg-zinc-900 backdrop-blur-xl rounded-2xl border border-zinc-800/50 ring-1 ring-white/5 p-6 sm:p-8">
                            <h2 className="text-2xl font-bold text-white mb-6">Get in Touch</h2>
                            <div className="space-y-6">

                                {/* Email */}
                                <ContactItem
                                    icon={<Mail className="w-5 h-5" />}
                                    title="Email"
                                    content="support@cinemanest.com"
                                    link="mailto:support@cinemanest.com"
                                />

                                {/* Phone */}
                                <ContactItem
                                    icon={<Phone className="w-5 h-5" />}
                                    title="Phone"
                                    content="+1 (555) 123-4567"
                                    link="tel:+15551234567"
                                />

                                {/* Address */}
                                <ContactItem
                                    icon={<MapPin className="w-5 h-5" />}
                                    title="Address"
                                    content="123 Streaming Ave, Los Angeles, CA 90001"
                                />

                            </div>
                        </div>

                        {/* Quick Links */}
                        <div className="bg-zinc-900 backdrop-blur-xl rounded-2xl border border-zinc-800/50 ring-1 ring-white/5 p-6 sm:p-8">
                            <h3 className="text-xl font-bold text-white mb-4">Quick Links</h3>
                            <div className="space-y-3">
                                <QuickLink href="/privacy" text="Privacy Policy" />
                                <QuickLink href="/terms" text="Terms of Service" />
                                <QuickLink href="/" text="Back to Home" />
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="bg-zinc-900 backdrop-blur-xl rounded-2xl border border-zinc-800/50 ring-1 ring-white/5 p-6 sm:p-8">
                        <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Web3Forms Access Key - Replace with your actual key */}
                            <input
                                type="hidden"
                                name="access_key"
                                value="0fdbf1b5-2b1c-4cfe-af26-5f15cc89b4bd"
                            />

                            {/* Optional: Custom subject */}
                            <input type="hidden" name="subject" value="New Contact Form Submission from CinemaNest" />

                            {/* Optional: Redirect after submission */}
                            <input type="hidden" name="redirect" value="false" />

                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-medium text-zinc-300 mb-2">
                                    Your Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="John Doe"
                                />
                            </div>

                            {/* Email */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-zinc-300 mb-2">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="john@example.com"
                                />
                            </div>

                            {/* Subject */}
                            <div>
                                <label htmlFor="user_subject" className="block text-sm font-medium text-zinc-300 mb-2">
                                    Subject
                                </label>
                                <input
                                    type="text"
                                    id="user_subject"
                                    name="user_subject"
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="How can we help?"
                                />
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-medium text-zinc-300 mb-2">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows={6}
                                    required
                                    disabled={isSubmitting}
                                    className="w-full px-4 py-3 bg-zinc-800/50 border border-zinc-700/50 rounded-xl text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-600 transition-all resize-none disabled:opacity-50 disabled:cursor-not-allowed"
                                    placeholder="Tell us more about your inquiry..."
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full px-6 py-3 bg-white text-black font-semibold rounded-xl hover:bg-zinc-100 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Message'
                                )}
                            </button>

                            {/* Success Message */}
                            {submitStatus === 'success' && (
                                <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                                    <p className="text-sm text-emerald-400">
                                        Message sent successfully! We'll get back to you within 24-48 hours.
                                    </p>
                                </div>
                            )}

                            {/* Error Message */}
                            {submitStatus === 'error' && (
                                <div className="flex items-center gap-3 p-4 bg-red-500/10 border border-red-500/20 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                    <p className="text-sm text-red-400">
                                        Failed to send message. Please try again or email us directly at support@cinemanest.com
                                    </p>
                                </div>
                            )}

                            {submitStatus === 'idle' && (
                                <p className="text-xs text-zinc-500 text-center">
                                    We typically respond within 24-48 hours
                                </p>
                            )}
                        </form>
                    </div>

                </div>
            </div>

            {/* Footer Note */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                <div className="text-center">
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
function ContactItem({
    icon,
    title,
    content,
    link
}: {
    icon: React.ReactNode;
    title: string;
    content: string;
    link?: string;
}) {
    return (
        <div className="flex items-start gap-4">
            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-zinc-800 to-zinc-950 border border-zinc-700/50 flex items-center justify-center text-zinc-400">
                {icon}
            </div>
            <div>
                <h4 className="text-sm font-semibold text-zinc-400 mb-1">{title}</h4>
                {link ? (
                    <a
                        href={link}
                        className="text-white hover:text-zinc-300 transition-colors"
                    >
                        {content}
                    </a>
                ) : (
                    <p className="text-white">{content}</p>
                )}
            </div>
        </div>
    );
}

function QuickLink({ href, text }: { href: string; text: string }) {
    return (
        <Link
            href={href}
            className="block text-zinc-400 hover:text-white transition-colors py-2 border-b border-zinc-800/50 last:border-0"
        >
            {text}
        </Link>
    );
}
