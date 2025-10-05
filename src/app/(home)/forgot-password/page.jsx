"use client";

import useAuthContext from "@/hooks/useAuthContext";
import { useState } from "react";
import Swal from 'sweetalert2';

const ForgotPasswordPage = () => {
    const { forgotPassword } = useAuthContext();
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        
        const email = e.target.elements["email"].value.trim();

        // Validation
        if (!email) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Please enter your email address.',
                confirmButtonColor: '#000000',
            });
            setLoading(false);
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            Swal.fire({
                icon: 'error',
                title: 'Invalid Email',
                text: 'Please enter a valid email address.',
                confirmButtonColor: '#000000',
            });
            setLoading(false);
            return;
        }

        try {
            await forgotPassword(email);
            
            // Success with options to open email or continue
            const result = await Swal.fire({
                icon: 'success',
                title: 'Password Reset Email Sent!',
                html: `
                    <p>We've sent a password reset link to:</p>
                    <p><strong>${email}</strong></p>
                    <p>Please check your email inbox and spam folder.</p>
                    <p>The reset link will expire in 1 hour for security.</p>
                `,
                showCancelButton: true,
                confirmButtonText: 'Open Gmail',
                cancelButtonText: 'Back to Login',
                confirmButtonColor: '#000000',
                cancelButtonColor: '#6b7280'
            });

            // If user clicks "Open Gmail", open Gmail
            if (result.isConfirmed) {
                window.open('https://gmail.com', '_blank');
                // Still redirect to login after opening Gmail
                setTimeout(() => {
                    window.location.href = '/login';
                }, 1000);
            } else if (result.isDismissed) {
                // Redirect to login page
                window.location.href = '/login';
            }

            // Reset form
            e.target.reset();
            
        } catch (error) {
            console.error('Forgot password error:', error);
            let errorMessage = 'Failed to send password reset email. Please try again.';
            
            switch (error.code) {
                case 'auth/user-not-found':
                    errorMessage = 'No account found with this email address. Please check your email or create a new account.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address.';
                    break;
                case 'auth/too-many-requests':
                    errorMessage = 'Too many requests. Please wait a few minutes before trying again.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your connection and try again.';
                    break;
                default:
                    errorMessage = error.message || 'Failed to send reset email. Please try again.';
            }
            
            Swal.fire({
                icon: 'error',
                title: 'Reset Failed',
                text: errorMessage,
                confirmButtonColor: '#000000',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <div className="mx-auto h-16 w-16 bg-black rounded-full flex items-center justify-center mb-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth="2"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Forgot Password?
                    </h1>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        No worries! Enter your email address below and we'll send you a link to reset your password.
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        {/* Email Input */}
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="your email"
                                disabled={loading}
                                required
                                className="peer relative h-12 w-full rounded-lg border border-slate-200 px-4 pl-12 text-slate-700 placeholder-transparent outline-none transition-all autofill:bg-white  focus:border-black focus:outline-none focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-2 -top-2 z-[1] cursor-text px-2 text-xs text-slate-400 transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base peer-autofill:-top-2  peer-required:after:content-['\00a0*']  peer-focus:-top-2 peer-focus:left-2 peer-focus:cursor-default peer-focus:text-xs peer-focus:text-black  peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent"
                            >
                                Enter your email address
                            </label>
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="absolute top-3 left-4 h-6 w-6 stroke-slate-400 peer-disabled:cursor-not-allowed"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="1.5"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                            </svg>
                        </div>
                    </div>

                    {/* Submit Button */}
                    <button 
                        type="submit"
                        disabled={loading}
                        className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        ) : (
                            'Send Reset Link'
                        )}
                    </button>

                    {/* Info Text */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
                        <div className="flex items-start">
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5 text-blue-500 mt-0.5 mr-3 flex-shrink-0"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                            </svg>
                            <div className="text-sm text-blue-800">
                                <p className="font-medium mb-1">Reset Instructions</p>
                                <p>Check your email inbox and spam folder. The reset link will expire in 1 hour for security reasons.</p>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Back to Login */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Remember your password? {' '}
                        <a 
                            href="/login" 
                            className="font-medium text-black hover:underline transition-all"
                        >
                            Back to Login
                        </a>
                    </p>
                </div>

                {/* Help Text */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                        Still having trouble? {' '}
                        <a 
                            href="/contact" 
                            className="text-black hover:underline"
                        >
                            Contact Support
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;