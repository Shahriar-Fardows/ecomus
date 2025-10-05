"use client";

import useAuthContext from "@/hooks/useAuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Swal from "sweetalert2";

const LoginPage = () => {
  const { user, loginUser } = useAuthContext();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userName, setUserName] = useState("Guest");
  const router = useRouter();

  console.log(user);

  // Get user name from cookies on component mount
  useEffect(() => {
    const savedUserName = document.cookie
      .split("; ")
      .find((row) => row.startsWith("userName="))
      ?.split("=")[1];

    if (savedUserName) {
      setUserName(decodeURIComponent(savedUserName));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const email = e.target.elements["email"].value.trim();
    const password = e.target.elements["password"].value;

    // Validation
    if (!email || !password) {
      Swal.fire({
        icon: "error",
        title: "Missing Information",
        text: "Please fill in both email and password.",
        confirmButtonColor: "#000000",
      });
      setLoading(false);
      return;
    }

    try {
      // First, check user from API
      const apiResponse = await fetch('/api/userEntries');
      const users = await apiResponse.json();
      
      // Find user by email
      const apiUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      // Check if user exists in API
      if (!apiUser) {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "No account found with this email address.",
          confirmButtonColor: "#000000",
        });
        setLoading(false);
        return;
      }

      // Check if user is blocked
      if (apiUser.status === "blocked") {
        Swal.fire({
          icon: "error",
          title: "Account Blocked",
          text: "Your account has been blocked. Please contact support.",
          confirmButtonColor: "#000000",
        });
        setLoading(false);
        return;
      }

      // Check if user is customer
      if (apiUser.usertype === "customer") {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "Customer accounts cannot access the admin. Only admin, moderator, and staff can login.",
          confirmButtonColor: "#000000",
        });
        setLoading(false);
        return;
      }

      // Check if user type is allowed (admin, moderator, staff)
      const allowedUserTypes = ["admin", "moderator", "staff"];
      if (!allowedUserTypes.includes(apiUser.usertype)) {
        Swal.fire({
          icon: "error",
          title: "Access Denied",
          text: "You don't have permission to access the admin.",
          confirmButtonColor: "#000000",
        });
        setLoading(false);
        return;
      }

      // Check if status is active
      if (apiUser.status !== "active") {
        Swal.fire({
          icon: "error",
          title: "Account Inactive",
          text: "Your account is not active. Please contact support.",
          confirmButtonColor: "#000000",
        });
        setLoading(false);
        return;
      }

      // If all checks passed, proceed with Firebase login
      const userCredential = await loginUser(email, password);
      const firebaseUser = userCredential.user;

      // Store user information in cookies for 30 days
      const expires = new Date();
      expires.setTime(expires.getTime() + 30 * 24 * 60 * 60 * 1000);
      
      document.cookie = `userName=${encodeURIComponent(
        apiUser.name || firebaseUser.email
      )}; expires=${expires.toUTCString()}; path=/`;
      
      document.cookie = `userType=${encodeURIComponent(
        apiUser.usertype
      )}; expires=${expires.toUTCString()}; path=/`;
      
      document.cookie = `userId=${encodeURIComponent(
        apiUser._id
      )}; expires=${expires.toUTCString()}; path=/`;

      Swal.fire({
        icon: "success",
        title: "Login Successful!",
        html: `
          <p>Welcome back, <strong>${apiUser.name}</strong>!</p>
          <p class="text-sm text-gray-600 mt-2">Role: ${apiUser.usertype.charAt(0).toUpperCase() + apiUser.usertype.slice(1)}</p>
        `,
        confirmButtonColor: "#000000",
        timer: 2000,
        showConfirmButton: false,
      });

      // Reset form
      e.target.reset();

      // Redirect to admin
      setTimeout(() => {
        router.push("/admin");
      }, 2000);

    } catch (error) {
      console.error("Login error:", error);
      setLoading(false);
      
      let errorMessage = "Login failed. Please try again.";

      switch (error.code || error.message) {
        case 'auth/user-not-found':
        case 'auth/invalid-email':
          errorMessage = "No account found with this email address.";
          break;
        case 'auth/wrong-password':
        case 'auth/invalid-credential':
          errorMessage = "Incorrect password. Please try again.";
          break;
        case 'auth/too-many-requests':
          errorMessage = "Too many failed attempts. Please try again later.";
          break;
        case 'auth/user-disabled':
          errorMessage = "This account has been disabled.";
          break;
        default:
          errorMessage = error.message || "Login failed. Please try again.";
      }

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: errorMessage,
        confirmButtonColor: "#000000",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen px-4 sm:px-6 lg:px-8 ">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back!
          </h1>
          <p className="text-gray-600">
            Hello {user?.displayName || userName}, please log in to continue
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
                className="peer relative h-12 w-full rounded-lg border border-slate-200 px-4 pl-12 text-slate-700 placeholder-transparent outline-none transition-all autofill:bg-white invalid: invalid: focus:border-black focus:outline-none invalid:focus: focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
              <label
                htmlFor="email"
                className="absolute left-2 -top-2 z-[1] cursor-text px-2 text-xs text-slate-400 transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base peer-autofill:-top-2 peer-required:after: peer-required:after:content-['\00a0*'] peer-invalid: peer-focus:-top-2 peer-focus:left-2 peer-focus:cursor-default peer-focus:text-xs peer-focus:text-black peer-invalid:peer-focus: peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent"
              >
                Enter your email
              </label>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="absolute top-3 left-4 h-6 w-6 stroke-slate-400 peer-disabled:cursor-not-allowed"
                fill="none"
                aria-hidden="true"
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
            <div className="relative mt-8">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                name="password"
                placeholder="your password"
                disabled={loading}
                required
                className="peer relative h-12 w-full rounded-lg border border-slate-200 px-4 pr-12 text-slate-700 placeholder-transparent outline-none transition-all autofill:bg-white invalid: invalid: focus:border-black focus:outline-none invalid:focus: focus-visible:outline-none disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
              />
              <label
                htmlFor="password"
                className="absolute left-2 -top-2 z-[1] cursor-text px-2 text-xs text-slate-400 transition-all before:absolute before:top-0 before:left-0 before:z-[-1] before:block before:h-full before:w-full before:bg-white before:transition-all peer-placeholder-shown:top-3 peer-placeholder-shown:left-10 peer-placeholder-shown:text-base peer-autofill:-top-2 peer-required:after: peer-required:after:content-['\00a0*'] peer-invalid: peer-focus:-top-2 peer-focus:cursor-default peer-focus:text-xs peer-focus:text-black peer-invalid:peer-focus: peer-disabled:cursor-not-allowed peer-disabled:text-slate-400 peer-disabled:before:bg-transparent"
              >
                Your password
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
          </div>

          {/* Forgot Password Link */}
          <div className="text-right mt-4">
            <a
              href="/forgot-password"
              className="text-sm text-black hover:underline transition-colors"
            >
              Forgot your password?
            </a>
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
              'Log In'
            )}
          </button>
        </form>

        

        {/* Access Notice */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mt-4">
          <p className="text-xs text-gray-600 text-center">
            <strong>Note:</strong> Only Admin, Moderator, and Staff with active accounts can access the admin.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;