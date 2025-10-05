"use client";

import useAuthContext from "@/hooks/useAuthContext";
import { updateProfile } from 'firebase/auth';
import { useRouter } from "next/navigation";
import { useState } from "react";
import Swal from 'sweetalert2';

const RegisterPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const { createUser } = useAuthContext();
    const router = useRouter();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const name = e.target[0].value.trim();
        const email = e.target[1].value.trim();
        const password = e.target[2].value;
        const confirmPassword = e.target[3].value;

        console.log(name, email, password, confirmPassword);

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Missing Information',
                text: 'Please fill in all fields',
                confirmButtonColor: '#000000'
            });
            setLoading(false);
            return;
        }

        if (password.length < 6) {
            Swal.fire({
                icon: 'error',
                title: 'Weak Password',
                text: 'Password must be at least 6 characters long',
                confirmButtonColor: '#000000'
            });
            setLoading(false);
            return;
        }

        if (password !== confirmPassword) {
            Swal.fire({
                icon: 'error',
                title: 'Password Mismatch',
                text: 'Passwords do not match',
                confirmButtonColor: '#000000'
            });
            setLoading(false);
            return;
        }

        try {
            // Create user with Firebase
            const userCredential = await createUser(email, password);
            const user = userCredential.user;

            // Update user profile with name
            await updateProfile(user, {
                displayName: name
            });

            // Store user name in cookies
            document.cookie = `userName=${encodeURIComponent(name)}; path=/`;

            // Send email verification
            // await sendEmailVerification(user);

            // 👉 Save user info in your own database
            await fetch("/api/userEntries", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    name,
                    email,
                    usertype: "customer",
                    status: "active",
                }),
            });




            // Show additional info
            await Swal.fire({
                icon: 'success',
                title: 'Registration Complete',
                text: 'Your account has been created successfully!',
                confirmButtonColor: '#000000'
            }).then((result) => {
                if (result.isConfirmed) {
                    router.push("/dashboard");
                }
            });

            // Reset form
            e.target.reset();

        } catch (error) {
            console.error('Registration error:', error);

            let errorMessage = 'An error occurred during registration';

            switch (error.code) {
                case 'auth/email-already-in-use':
                    errorMessage = 'This email address is already registered. Please try logging in instead.';
                    break;
                case 'auth/invalid-email':
                    errorMessage = 'Please enter a valid email address';
                    break;
                case 'auth/weak-password':
                    errorMessage = 'Password is too weak. Please choose a stronger password.';
                    break;
                case 'auth/network-request-failed':
                    errorMessage = 'Network error. Please check your internet connection and try again.';
                    break;
                default:
                    errorMessage = error.message || 'Registration failed. Please try again.';
            }

            Swal.fire({
                icon: 'error',
                title: 'Registration Failed',
                text: errorMessage,
                confirmButtonColor: '#000000'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-gray-50">
            <div className="max-w-md w-full space-y-8">
                <div className="text-center">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                        Create Account
                    </h1>
                    <p className="text-gray-600">
                        Join us today! Please fill in your details to get started
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                    <div className="space-y-4">
                        {/* Name Input */}
                        <div className="relative">
                            <input
                                id="name"
                                type="text"
                                name="name"
                                placeholder="your name"
                                disabled={loading}
                                required
                                className="peer relative h-12 w-full rounded-lg border border-slate-200 px-4 pl-12 text-slate-700 placeholder-transparent outline-none transition-all autofill:bg-white invalid: invalid: focus:border-black focus:outline-none invalid:focus: focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                            />
                            <label
                                htmlFor="name"
                                className="absolute left-2 -top-2 z-[1] cursor-text px-2 text-xs text-slate-400 transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base peer-autofill:-top-2 peer-required:after: peer-required:after:content-['\00a0*'] peer-invalid: peer-focus:-top-2 peer-focus:left-2 peer-focus:cursor-default peer-focus:text-xs peer-focus:text-black peer-invalid:peer-focus: peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent"
                            >
                                Full Name
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
                                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                            </svg>
                        </div>

                        {/* Email Input */}
                        <div className="relative">
                            <input
                                id="email"
                                type="email"
                                name="email"
                                placeholder="your email"
                                disabled={loading}
                                required
                                className="peer relative h-12 w-full rounded-lg border border-slate-200 px-4 pl-12 text-slate-700 placeholder-transparent outline-none transition-all autofill:bg-white invalid: invalid: focus:border-black focus:outline-none invalid:focus: focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                            />
                            <label
                                htmlFor="email"
                                className="absolute left-2 -top-2 z-[1] cursor-text px-2 text-xs text-slate-400 transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base peer-autofill:-top-2 peer-required:after: peer-required:after:content-['\00a0*'] peer-invalid: peer-focus:-top-2 peer-focus:left-2 peer-focus:cursor-default peer-focus:text-xs peer-focus:text-black peer-invalid:peer-focus: peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent"
                            >
                                Email Address
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

                        {/* Password Input */}
                        <div className="relative">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                name="password"
                                placeholder="your password"
                                disabled={loading}
                                required
                                minLength="6"
                                className="peer relative h-12 w-full rounded-lg border border-slate-200 px-4 pr-12 text-slate-700 placeholder-transparent outline-none transition-all autofill:bg-white invalid: invalid: focus:border-black focus:outline-none invalid:focus: focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                            />
                            <label
                                htmlFor="password"
                                className="absolute left-2 -top-2 z-[1] cursor-text px-2 text-xs text-slate-400 transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-autofill:-top-2 peer-required:after: peer-required:after:content-['\00a0*'] peer-invalid: peer-focus:-top-2 peer-focus:left-2 peer-focus:cursor-default peer-focus:text-xs peer-focus:text-black peer-invalid:peer-focus: peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent"
                            >
                                Password
                            </label>
                            {showPassword ? (
                                <svg
                                    onClick={() => setShowPassword(!showPassword)}
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute top-3 right-4 h-6 w-6 cursor-pointer stroke-slate-400 hover:stroke-slate-600 transition-colors peer-disabled:cursor-not-allowed"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    onClick={() => setShowPassword(!showPassword)}
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute top-3 right-4 h-6 w-6 cursor-pointer stroke-slate-400 hover:stroke-slate-600 transition-colors peer-disabled:cursor-not-allowed"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            )}
                        </div>

                        {/* Confirm Password Input */}
                        <div className="relative">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="confirm password"
                                disabled={loading}
                                required
                                className="peer relative h-12 w-full rounded-lg border border-slate-200 px-4 pr-12 text-slate-700 placeholder-transparent outline-none transition-all autofill:bg-white invalid: invalid: focus:border-black focus:outline-none invalid:focus: focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
                            />
                            <label
                                htmlFor="confirmPassword"
                                className="absolute left-2 -top-2 z-[1] cursor-text px-2 text-xs text-slate-400 transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-autofill:-top-2 peer-required:after: peer-required:after:content-['\00a0*'] peer-invalid: peer-focus:-top-2 peer-focus:left-2 peer-focus:cursor-default peer-focus:text-xs peer-focus:text-black peer-invalid:peer-focus: peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent"
                            >
                                Confirm Password
                            </label>
                            {showConfirmPassword ? (
                                <svg
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute top-3 right-4 h-6 w-6 cursor-pointer stroke-slate-400 hover:stroke-slate-600 transition-colors peer-disabled:cursor-not-allowed"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                    />
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                                    />
                                </svg>
                            ) : (
                                <svg
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="absolute top-3 right-4 h-6 w-6 cursor-pointer stroke-slate-400 hover:stroke-slate-600 transition-colors peer-disabled:cursor-not-allowed"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                    />
                                </svg>
                            )}
                        </div>
                    </div>

                    {/* Password Requirements */}
                    <div className="text-xs text-gray-500 mt-2">
                        Password must be at least 6 characters long
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
                            'Create Account'
                        )}
                    </button>
                </form>

                {/* Login link */}
                <div className="text-center mt-6">
                    <p className="text-sm text-gray-600">
                        Already have an account? {' '}
                        <a
                            href="/login"
                            className="font-medium text-black hover:underline transition-all"
                        >
                            Sign in here
                        </a>
                    </p>
                </div>

                {/* Terms Notice */}
                <div className="text-center mt-4">
                    <p className="text-xs text-gray-500">
                        By creating an account, you agree to our{' '}
                        <a href="/terms" className="text-black hover:underline">Terms of Service</a>
                        {' '}and{' '}
                        <a href="/privacy" className="text-black hover:underline">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;