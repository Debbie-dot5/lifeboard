"use client"

import type { MoodType } from "@lifeboard/types"

const MOOD_CONFIG: Record<MoodType, { emoji: string; label: string; classes: string }> = {
  great: { emoji: "😄", label: "Great", classes: "bg-green-500/20 text-green-400" },
  good: { emoji: "🙂", label: "Good", classes: "bg-blue-500/20 text-blue-400" },
  okay: { emoji: "😐", label: "Okay", classes: "bg-yellow-500/20 text-yellow-400" },
  low: { emoji: "😔", label: "Low", classes: "bg-orange-500/20 text-orange-400" },
  bad: { emoji: "😞", label: "Bad", classes: "bg-red-500/20 text-red-400" },
}

const MoodBadge = ({ mood }: { mood: MoodType | null }) => {
  if (!mood) return null
  const config = MOOD_CONFIG[mood]

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${config.classes}`}>
      <span>{config.emoji}</span>
      {config.label}
    </span>
  )
}

export { MOOD_CONFIG }
export default MoodBadge
