"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"
import { signInSchema } from "@lifeboard/validations"

const LoginPage = () => {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    setError("")

    const result = signInSchema.safeParse({ email, password })
    if (!result.success) {
      setError(result.error.errors[0].message)
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    router.push("/tasks")
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
      <div className="relative w-full max-w-[420px] animate-card-entrance rounded-[20px] border border-brand/20 bg-white/5 p-10 shadow-[0_0_40px_rgba(108,71,255,0.08)] backdrop-blur-[16px]">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-[28px] font-bold text-white">Welcome back</h1>
          <p className="text-[15px] text-white/50">Sign in to your Lifeboard</p>
        </div>

        {error && (
          <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-red-500" />
            {error}
          </div>
        )}

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
          onClick={handleLogin}
          disabled={loading}
        >
          {loading ? (
            <span className="auth-spinner h-5 w-5 animate-spin rounded-full" />
          ) : (
            "Sign In"
          )}
        </button>

        <p className="mt-6 text-center text-sm text-white/50">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-violet-400 no-underline hover:underline">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
