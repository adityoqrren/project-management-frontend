"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { login } from "@/lib/auth"
import { isApiError } from "@/lib/errors"
import { useAuth } from "@/context/AuthContext"

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

  // 🔥 SIMULASI LOGIN
  // const fakeLogin = async (email: string, password: string) => {
  //   return new Promise<boolean>((resolve) => {
  //     setTimeout(() => {
  //       // simulasi:
  //       // email: user@mail.com
  //       // password: 123456
  //       if (email === "user@mail.com" && password === "123456") {
  //         resolve(true)
  //       } else {
  //         resolve(false)
  //       }
  //     }, 1000)
  //   })
  // }

  const handleLogin = async () => {
    const newErrors: typeof errors = {}

    // VALIDASI
    if (!email) newErrors.email = "Email is required"
    if (!password) newErrors.password = "Password is required"

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setErrors({})
    setLoading(true)

    //const success = await fakeLogin(email, password)

    // if (!success) {
    //   setErrors({
    //     general: "Invalid email or password",
    //   })
    //   return
    // }

    // // ✅ SUCCESS → redirect ke dashboard home "/"
    // router.push("/")

    try {
      await login(email, password);

      await refetchUser(); // 🔥 update user di context

      router.push("/");
    } catch (error: unknown) {
      console.log(`error: ${error}`)
      if (isApiError(error)) {
        setErrors({ general: error.message });
      } else {
        setErrors({ general: "Unexpected error" });
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        {/* <Image
          src="/bg.jpg"
          alt="background"
          fill
          className="object-cover blur-sm scale-105"
        /> */}
        <div className="absolute inset-0 bg-white/70" />
      </div>

      {/* CARD */}
      <div className="relative bg-white w-[380px] rounded-xl shadow-lg p-6">

        {/* HEADER */}
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-8 h-8 bg-green-400 rounded-md flex items-center justify-center text-white font-bold">
            ⛁
          </div>
          <h1 className="text-lg font-semibold">TaskFlow</h1>
        </div>

        <p className="text-center text-sm text-gray-500 mb-6">
          Log in to your account
        </p>

        {/* GLOBAL ERROR */}
        {errors.general && (
          <div className="mb-3 text-sm text-red-500 text-center">
            {errors.general}
          </div>
        )}

        {/* FORM */}
        <div className="space-y-3">

          {/* EMAIL */}
          <div>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                setErrors((prev) => ({ ...prev, email: undefined }))
              }}
              className={`w-full border rounded-md px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-green-400
                ${errors.email ? "border-red-500" : ""}
              `}
            />
            {errors.email && (
              <p className="text-xs text-red-500 mt-1">
                {errors.email}
              </p>
            )}
          </div>

          {/* PASSWORD */}
          <div>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                setErrors((prev) => ({ ...prev, password: undefined }))
              }}
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

          {/* BUTTON */}
          <button
            onClick={handleLogin}
            disabled={loading}
            className="w-full bg-green-500 text-white py-2 rounded-md text-sm
              hover:bg-green-600 active:scale-95 transition
              disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>

        </div>

        {/* DIVIDER */}
        <div className="flex items-center my-4">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="px-3 text-xs text-gray-400">
            OR CONTINUE WITH
          </span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {/* SOCIAL */}
        <div className="space-y-2">
          <button className="w-full flex items-center justify-center gap-2 border rounded-md py-2 text-sm hover:bg-gray-50 transition">
            <Image src="/icons/google-icon.svg" alt="google" width={18} height={18} />
            Google
          </button>

          <button className="w-full flex items-center justify-center gap-2 border rounded-md py-2 text-sm hover:bg-gray-50 transition">
            <Image src="/icons/ms-icon.svg" alt="microsoft" width={18} height={18} />
            Microsoft
          </button>

          <button className="w-full flex items-center justify-center gap-2 border rounded-md py-2 text-sm hover:bg-gray-50 transition">
            <Image src="/icons/slack-icon.svg" alt="slack" width={18} height={18} />
            Slack
          </button>
        </div>

        {/* FOOTER */}
        <div className="text-center mt-4 text-sm">
          <p className="text-green-600 cursor-pointer hover:underline">
            Can&apos;t log in?
          </p>

          <p className="text-gray-500 mt-1">
            No account?{" "}
            <Link href="/auth/register" className="text-green-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>

        <div className="text-center text-xs text-gray-400 mt-6">
          Privacy Policy &nbsp;&nbsp; Terms of Service
        </div>

      </div>
    </div>
  )
}