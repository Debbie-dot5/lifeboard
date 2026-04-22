import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Sidebar from "@/components/layout/Sidebar"
import { ToastProvider } from "@/components/ui/ToastProvider"

const DashboardLayout = async ({ children }: { children: React.ReactNode }) => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  return (
    <div className="flex h-screen bg-[#0F0F1A] text-white overflow-hidden">
      <Sidebar />
      <main className="flex-1 overflow-y-auto safe-top">
        <ToastProvider>
          {children}
        </ToastProvider>
      </main>
    </div>
  )
}

export default DashboardLayout

