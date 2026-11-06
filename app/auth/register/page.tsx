"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { register } from "@/lib/auth";
import { isApiError } from "@/lib/errors";
import {
  Turnstile,
  type TurnstileInstance,
} from "@marsidev/react-turnstile";
import { useToast } from "@/context/ToastContext";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    email: "",
    fullName: "",
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<{
    email?: string;
    fullName?: string;
    username?: string;
    password?: string;
    confirmPassword?: string;
    general?: string;
  }>({});

  const [loading, setLoading] = useState(false);

  const { showToast } = useToast()

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleSubmit = async () => {
    const newErrors: typeof errors = {};

    const email = form.email.trim();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Input validation

    if (!email) {
      newErrors.email = "Email is required";
    } else if (!emailPattern.test(email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!form.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!form.username.trim()) {
      newErrors.username = "Username is required";
    }

    if (!form.password) {
      newErrors.password = "Password is required";
    }

    if (!form.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (form.password !== form.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Check Turnstile verification
    if (!turnstileToken) {
      setErrors({
        general: "Please complete the security verification.",
      });
      return;
    }

    setErrors({});
    setLoading(true);

    const submittedToken = turnstileToken;

    try {
      await register({
        email,
        username: form.username.trim(),
        password: form.password,
        name: form.fullName.trim(), // map ke backend,
        turnstileToken: submittedToken,
      });

      showToast('Account created. You can login with created login')

      // Redirect to login after success
      router.push("/auth/login");
    } catch (err: unknown) {
      if (isApiError(err)) {
        // If backend sends field validation errors
        if (err.data?.errors) {
          setErrors({
            email: err.data.errors.email,
            username: err.data.errors.username,
            password: err.data.errors.password,
            fullName: err.data.errors.name,
          });
        } else {
          setErrors({
            general: err.message,
          });
        }
      } else {
        setErrors({
          general: "Unexpected error",
        });
      }

      // Reset the single-use token after a failed request
      setTurnstileToken(null);
      turnstileRef.current?.reset();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      {/* Background */}
      <div className="absolute inset-0">
        {/* <Image
          src="/bg.jpg"
          alt="background"
          fill
          className="object-cover blur-sm scale-105"
        /> */}
        <div className="absolute inset-0 bg-white/70" />
      </div>

      {/* Card */}
      <div className="relative bg-white w-[380px] rounded-xl shadow-lg p-6">
        {/* Header */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-700 text-xl font-bold text-white shadow-lg">
            T
          </div>
          <span className="text-2xl font-bold tracking-tight">
            TaskFlow
          </span>
        </div>

        <p className="text-center text-sm text-gray-500 mb-6">
          Create your account
        </p>

        {/* General error */}
        {errors.general && (
          <div className="mb-3 text-sm text-red-500 text-center">
            {errors.general}
          </div>
        )}

        {/* Form */}
        <div className="space-y-3">
          {/* Email */}
          <div>
            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => {
                const value = e.target.value;

                setForm((prev) => ({ ...prev, email: value }));

                if (errors.email) {
                  setErrors((prev) => ({ ...prev, email: undefined }));
                }
              }}
              className={`w-full rounded-md border px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-green-400
                ${errors.email ? "border-red-500" : ""}
              `}
            />

            {errors.email && (
              <p className="mt-1 text-xs text-red-500">{errors.email}</p>
            )}
          </div>

          {/* Full name */}
          <div>
            <input
              type="text"
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, fullName: e.target.value }))
              }
              className={`w-full border rounded-md px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-green-400
                ${errors.fullName ? "border-red-500" : ""}
              `}
            />
            {errors.fullName && (
              <p className="text-xs text-red-500 mt-1">
                {errors.fullName}
              </p>
            )}
          </div>

          {/* Username */}
          <div>
            <input
              type="text"
              placeholder="Username"
              value={form.username}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, username: e.target.value }))
              }
              className={`w-full border rounded-md px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-green-400
                ${errors.username ? "border-red-500" : ""}
              `}
            />
            {errors.username && (
              <p className="text-xs text-red-500 mt-1">
                {errors.username}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <input
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, password: e.target.value }))
              }
              className={`w-full border rounded-md px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-green-400
                ${errors.password ? "border-red-500" : ""}
              `}
            />
            {errors.password && (
              <p className="text-xs text-red-500 mt-1">
                {errors.password}
              </p>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <input
              type="password"
              placeholder="Confirm password"
              value={form.confirmPassword}
              onChange={(e) => {
                const value = e.target.value;

                setForm((prev) => ({
                  ...prev,
                  confirmPassword: value,
                }));

                if (errors.confirmPassword) {
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: undefined,
                  }));
                }
              }}
              className={`w-full rounded-md border px-3 py-2 text-sm
                  focus:outline-none focus:ring-2 focus:ring-green-400
                  ${errors.confirmPassword ? "border-red-500" : ""}
                `}
            />

            {errors.confirmPassword && (
              <p className="mt-1 text-xs text-red-500">
                {errors.confirmPassword}
              </p>
            )}
          </div>

          {/* Turnstile */}
          <div className="flex justify-center py-2">
            <Turnstile
              ref={turnstileRef}
              siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
              options={{
                appearance: "always",
                execution: "render",
                size: "normal",
                theme: "light",
                action: "register"
              }}
              onSuccess={(token) => {
                setTurnstileToken(token);
              }}
              onExpire={() => {
                setTurnstileToken(null);
              }}
              onError={() => {
                setTurnstileToken(null);

                setErrors((prev) => ({
                  ...prev,
                  general: "Security verification failed. Please try again.",
                }));
              }}
            />
          </div>

          {/* Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || !turnstileToken}
            className="w-full bg-green-500 text-white py-2 rounded-md text-sm
              hover:bg-green-600 active:scale-95 transition
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </div>
        {/* DIVIDER SECTION */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-xs text-gray-400 font-medium">OR CONTINUE WITH</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* SOCIAL LOGIN SECTION */}
        <div className="space-y-2">
          <SocialButton icon="/icons/google-icon.svg" label="Google" />
          <SocialButton icon="/icons/ms-icon.svg" label="Microsoft" />
          <SocialButton icon="/icons/slack-icon.svg" label="Slack" />
        </div>

        {/* Footer */}
        <div className="text-center mt-4 text-sm">
          <p className="text-gray-500">
            Already have an account?{" "}
            <Link href="/auth/login" className="text-green-600 hover:underline">
              Log in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

//Social Buttons
type SocialButtonProps = {
  icon: string;
  label: string;
  onClick?: () => void;
};

function SocialButton({ icon, label, onClick }: SocialButtonProps) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-center gap-2 border rounded-md py-2 text-sm font-medium hover:bg-gray-50 transition-colors duration-200 active:scale-[0.98]"
    >
      <Image src={icon} alt={label} width={18} height={18} />
      {label}
    </button>
  );
}

