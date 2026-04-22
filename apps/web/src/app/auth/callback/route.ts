import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export const GET = async (request: Request) => {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get("code")

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error) {
      // Redirect to login with success message
      return NextResponse.redirect(
        `${origin}/login?confirmed=true`
      )
    }
  }

  // If something went wrong redirect to login with error
  return NextResponse.redirect(
    `${origin}/login?error=confirmation_failed`
  )
}
