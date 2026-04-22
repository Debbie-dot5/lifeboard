import type { Metadata } from "next"
import { Geist, Geist_Mono, Space_Grotesk } from "next/font/google"
import QueryProvider from "../lib/query-provider"
import "./global.css"
import "./glass.css"

const clashDisplay = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-clash",
  display: "swap",
  weight: ["300", "400", "500", "600", "700"],
})

const geist = Geist({
  subsets: ["latin"],
  variable: "--font-geist",
  display: "swap",
})

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
})

export const metadata: Metadata = {
  title: "Lifeboard — Your Personal Life OS",
  description: "Tasks, journal, habits, planner, reminders, and reading — all in one place.",
}

const RootLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${clashDisplay.variable} ${geist.variable} ${geistMono.variable}`}>
        <QueryProvider>
          {children}
        </QueryProvider>
      </body>
    </html>
  )
}

export default RootLayout
