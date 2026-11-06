"use client"

import { useState, useRef } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login } from "@/lib/auth"
import { isApiError } from "@/lib/errors"
import { useAuth } from "@/context/AuthContext"
import {
  Turnstile,
  type TurnstileInstance,
} from "@marsidev/react-turnstile";
import {
  ClipboardCheck,
  ListTodo,
  Users,
  ChartNoAxesCombined,
} from "lucide-react";

export default function LoginPage() {
  const { refetchUser } = useAuth();
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    general?: string
  }>({})

  const [loading, setLoading] = useState(false)

  const [requiresTurnstile, setRequiresTurnstile] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const turnstileRef = useRef<TurnstileInstance>(null);

  const handleLogin = async () => {
    const newErrors: typeof errors = {};

    if (!email) newErrors.email = "Email is required";
    if (!password) newErrors.password = "Password is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (requiresTurnstile && !turnstileToken) {
      setErrors({
        general: "Please complete the security verification.",
      });
      return;
    }

    setErrors({});
    setLoading(true);

    // Keep the submitted token to determine whether it needs resetting.
    const submittedToken = turnstileToken;

    try {
      await login(email, password, submittedToken ?? undefined);

      await refetchUser();

      router.push("/");
    } catch (error: unknown) {
      let errorMessage = "Unexpected error";
      if (isApiError(error)) {
        if (
          error.statusCode === 403 &&
          error.message === "Additional verification required"
        ) {
          setRequiresTurnstile(true);
          setErrors({});
        } else {
          errorMessage = error.message
        }
      }

      // A submitted Turnstile token must not be reused.
      if (submittedToken) {
        setTurnstileToken(null);
        turnstileRef.current?.reset();
      }

      setErrors({ general: errorMessage });
    } finally {
      setLoading(false);
    }
  };

  console.log("APP ENV:", process.env.NEXT_PUBLIC_API_URL);
  console.log("NODE ENV:", process.env.NODE_ENV);

  return (
    <div className="min-h-screen bg-gray-50 lg:grid lg:grid-cols-2">


      {/* Left Panel - TaskFlow Introduction */}
      <section className="relative hidden min-h-screen overflow-hidden bg-gradient-to-br from-green-800 via-green-700 to-emerald-600 p-12 text-white lg:flex lg:flex-col lg:justify-between">

        {/* Decorative Background */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-40 -left-32 h-96 w-96 rounded-full bg-emerald-300/20 blur-3xl" />

        {/* Decorative Icons */}
        <div className="pointer-events-none absolute right-20 top-1/4 rotate-12 text-white/[0.07]">
          <ClipboardCheck size={180} strokeWidth={1} />
        </div>

        <div className="pointer-events-none absolute bottom-1/4 right-24 -rotate-12 text-white/[0.08]">
          <ListTodo size={130} strokeWidth={1} />
        </div>

        {/* Brand */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-xl font-bold text-green-700 shadow-lg">
            T
          </div>
          <span className="text-2xl font-bold tracking-tight">
            TaskFlow
          </span>
        </div>

        {/* Introduction */}
        <div className="relative z-10 max-w-lg">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-green-100">
            Project & Task Management
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight">
            Ready to boost your productivity
          </h1>

          <h2 className="mt-3 text-3xl font-semibold text-green-100">
            Stay organized. Move forward.
          </h2>

          <p className="mt-6 max-w-md text-lg leading-relaxed text-green-50">
            Manage projects, organize daily tasks, and collaborate
            with your team — all in one place.
          </p>

          {/* Features */}
          <div className="mt-10 space-y-6">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <ClipboardCheck size={22} />
              </div>
              <div>
                <p className="font-semibold">Organize your tasks</p>
                <p className="text-sm text-green-100">
                  Keep everything structured and on track.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <Users size={22} />
              </div>
              <div>
                <p className="font-semibold">Collaborate with your team</p>
                <p className="text-sm text-green-100">
                  Work together and stay connected.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/15">
                <ChartNoAxesCombined size={22} />
              </div>
              <div>
                <p className="font-semibold">Track your progress</p>
                <p className="text-sm text-green-100">
                  See how far your projects have come.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="relative z-10 text-sm text-green-100">
          © {new Date().getFullYear()} TaskFlow. All rights reserved.
        </p>
      </section>


      {/* Right Panel - Login Form */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gray-50 px-5 py-10 sm:px-8">

        {/* Background Decoration */}
        <div className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-green-100/70 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-32 h-80 w-80 rounded-full bg-emerald-100/50 blur-3xl" />

        <div className="relative z-10 w-full max-w-md">

          {/* Mobile Brand */}
          <div className="mb-8 flex items-center justify-center gap-2 lg:hidden">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-green-500 font-bold text-white">
              T
            </div>
            <span className="text-xl font-bold text-gray-900">
              TaskFlow
            </span>
          </div>

          {/* Login Card */}
          <div className="rounded-2xl border border-gray-100 bg-white p-7 shadow-xl shadow-gray-200/50 sm:p-9">

            {/* Header */}
            <div className="mb-7">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900">
                Welcome back
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Sign in to continue managing your projects and tasks.
              </p>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                {errors.general}
              </div>
            )}

            {/* Login Form */}
            <div className="space-y-5">

              {/* Email */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Email address or username
                </label>

                <input
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      email: undefined,
                    }));
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-green-400
              ${errors.email ? "border-red-500" : "border-gray-200"}`}
                />

                {errors.email && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Password
                </label>

                <input
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrors((prev) => ({
                      ...prev,
                      password: undefined,
                    }));
                  }}
                  className={`w-full rounded-lg border px-3 py-2.5 text-sm
              focus:outline-none focus:ring-2 focus:ring-green-400
              ${errors.password ? "border-red-500" : "border-gray-200"}`}
                />

                {errors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link
                  href="/auth/forgot-password"
                  className="text-sm font-medium text-green-600 hover:text-green-700 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              {/* Turnstile */}
              {requiresTurnstile && (
                <div className="flex justify-center py-2">
                  <Turnstile
                    ref={turnstileRef}
                    siteKey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
                    options={{
                      action: "login",
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
              )}

              {/* Login Button */}
              <button
                type="button"
                onClick={handleLogin}
                disabled={loading || (requiresTurnstile && !turnstileToken)}
                className="w-full rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white
            transition hover:bg-green-700 active:scale-[0.98]
            disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? "Logging in..." : "Log in"}
              </button>
            </div>

            {/* Divider */}
            <div className="my-6 flex items-center">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="px-3 text-xs font-medium text-gray-400">
                OR CONTINUE WITH
              </span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>

            {/* Social Login */}
            <div className="space-y-3">
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Image src="/icons/google-icon.svg" alt="Google" width={18} height={18} />
                Continue with Google
              </button>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Image src="/icons/ms-icon.svg" alt="Microsoft" width={18} height={18} />
                Continue with Microsoft
              </button>

              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              >
                <Image src="/icons/slack-icon.svg" alt="Slack" width={18} height={18} />
                Continue with Slack
              </button>
            </div>

            {/* Register Link */}
            <div className="mt-7 text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <Link
                href="/auth/register"
                className="font-semibold text-green-600 hover:text-green-700 hover:underline"
              >
                Sign up
              </Link>
            </div>
          </div>

          {/* Footer */}
          <p className="mt-6 text-center text-xs text-gray-400">
            Privacy Policy &nbsp;&nbsp; Terms of Service
          </p>
        </div>
      </section>

    </div>
  );
}