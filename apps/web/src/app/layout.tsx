import type { Metadata } from "next"
import { Inter } from "next/font/google"
import QueryProvider from "../lib/query-provider"
import "./global.css"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Lifeboard — Your Personal Life OS",
  description: "Tasks, journal, habits, planner, reminders, and reading — all in one place.",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}

export default RootLayout
