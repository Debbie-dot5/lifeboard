"use client"

import { useEffect } from "react"
import { X } from "lucide-react"

type Props = {
  streak: number
  habitName: string
  onDismiss: () => void
}

const MILESTONE_CONFIG: Record<number, { message: string; emoji: string; bgClass: string }> = {
  7: {
    message: "1 Week Streak!",
    emoji: "\u{1F389}",
    bgClass: "bg-[#6C47FF]/90 border-[#6C47FF]",
  },
  30: {
    message: "30 Day Streak!",
    emoji: "\u{1F3C6}",
    bgClass: "bg-green-600/90 border-green-500",
  },
  100: {
    message: "100 Day Streak!",
    emoji: "\u{1F451}",
    bgClass: "bg-yellow-600/90 border-yellow-500",
  },
}

const StreakToast = ({ streak, habitName, onDismiss }: Props) => {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 3000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const config = MILESTONE_CONFIG[streak]
  if (!config) return null

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border shadow-2xl animate-slide-in-right ${config.bgClass}`}
    >
      <span className="text-2xl">{config.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-white font-semibold text-sm">{config.message}</p>
        <p className="text-white/70 text-xs truncate">{habitName} — Keep it up!</p>
      </div>
      <button
        onClick={onDismiss}
        className="p-1 rounded hover:bg-white/10 text-white/50 hover:text-white transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default StreakToast
