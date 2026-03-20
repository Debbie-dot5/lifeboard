import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

const ReaderLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="h-screen bg-[#0F0F1A] text-white overflow-hidden">
      {children}
    </div>
  )
}

export default ReaderLayout
