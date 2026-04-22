"use client"

import { useState } from "react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { signUpSchema } from "@lifeboard/validations"

const SignupPage = () => {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [confirmationSent, setConfirmationSent] = useState(false)

  const handleSignup = async () => {
    setError("")

    const result = signUpSchema.safeParse({
      email,
      password,
      display_name: displayName,
    })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { display_name: displayName },
      },
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    setLoading(false)
    setConfirmationSent(true)
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-deep-bg font-[system-ui]">
      {/* Ambient orbs */}
      <div className="pointer-events-none absolute -left-[100px] -top-[120px] h-[400px] w-[400px] rounded-full bg-brand opacity-40 blur-[80px]" />
      <div className="pointer-events-none absolute -bottom-[80px] -right-[60px] h-[300px] w-[300px] rounded-full bg-violet-500 opacity-40 blur-[80px]" />
      <div className="pointer-events-none absolute left-[60%] top-1/2 h-[200px] w-[200px] rounded-full bg-violet-900 opacity-40 blur-[80px]" />

      {/* Grid overlay */}
      <div className="auth-grid-overlay pointer-events-none absolute inset-0" />

      {/* Card */}
      <div className="relative w-full max-w-[420px] mx-4 md:mx-auto animate-card-entrance rounded-[20px] border border-brand/20 bg-white/5 p-7 md:p-10 shadow-[0_0_40px_rgba(108,71,255,0.08)] backdrop-blur-[16px]">
        {confirmationSent ? (
          <div className="py-5 text-center">
            <div className="mb-4 text-5xl">✉</div>
            <h1 className="mb-3 text-[28px] font-bold text-white">Check your email</h1>
            <p className="text-[15px] leading-relaxed text-white/50">
              We sent a confirmation link to <strong>{email}</strong>. Click the
              link to activate your account.
            </p>
            <Link
              href="/login"
              className="mt-6 inline-block text-sm font-medium text-violet-400 no-underline hover:underline"
            >
              Back to login
            </Link>
          </div>
        ) : (
          <>
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-[28px] font-bold text-white">Create your account</h1>
              <p className="text-[15px] text-white/50">Start organizing your life</p>
            </div>

            {error && (
              <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
                {error}
              </div>
            )}

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-white/70">Name</label>
              <input
                type="text"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 font-inherit text-[15px] text-white outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_0_3px_rgba(108,71,255,0.15)]"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-white/70">Email</label>
              <input
                type="email"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 font-inherit text-[15px] text-white outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_0_3px_rgba(108,71,255,0.15)]"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="mb-5">
              <label className="mb-2 block text-sm font-medium text-white/70">Password</label>
              <input
                type="password"
                className="w-full rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 font-inherit text-[15px] text-white outline-none transition-[border-color,box-shadow] duration-200 placeholder:text-white/25 focus:border-brand/50 focus:shadow-[0_0_0_3px_rgba(108,71,255,0.15)]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              className="mt-2 flex min-h-[48px] w-full cursor-pointer items-center justify-center rounded-xl border-none bg-gradient-to-br from-brand to-violet-500 text-base font-semibold text-white transition-[transform,box-shadow] duration-200 hover:not-disabled:-translate-y-0.5 hover:not-disabled:shadow-[0_8px_24px_rgba(108,71,255,0.3)] disabled:cursor-not-allowed disabled:opacity-70"
              onClick={handleSignup}
              disabled={loading}
            >
              {loading ? (
                <span className="auth-spinner h-5 w-5 animate-spin rounded-full" />
              ) : (
                "Create Account"
              )}
            </button>

            <p className="mt-6 text-center text-sm text-white/50">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-violet-400 no-underline hover:underline">
                Sign in
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  )
}

export default SignupPage
