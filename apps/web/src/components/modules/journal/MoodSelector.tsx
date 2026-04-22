"use client"

import { Sparkles, Smile, Meh, Frown, CloudRain } from "lucide-react"
import type { MoodType } from "@lifeboard/types"

const MOODS: { value: MoodType; label: string; icon: typeof Sparkles; color: string; ring: string }[] = [
  { value: "great", label: "Great", icon: Sparkles, color: "text-green-400", ring: "ring-green-400/50" },
  { value: "good", label: "Good", icon: Smile, color: "text-blue-400", ring: "ring-blue-400/50" },
  { value: "okay", label: "Okay", icon: Meh, color: "text-yellow-400", ring: "ring-yellow-400/50" },
  { value: "low", label: "Low", icon: Frown, color: "text-orange-400", ring: "ring-orange-400/50" },
  { value: "bad", label: "Bad", icon: CloudRain, color: "text-red-400", ring: "ring-red-400/50" },
]

const MoodSelector = ({
  value,
  onChange,
}: {
  value: MoodType | null
  onChange: (mood: MoodType | null) => void
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto flex-nowrap pb-1">
      {MOODS.map(({ value: mood, label, icon: Icon, color, ring }) => {
        const isSelected = value === mood
        return (
          <button
            key={mood}
            type="button"
            onClick={() => onChange(isSelected ? null : mood)}
            className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
              isSelected
                ? `${color} bg-white/10 ring-2 ${ring}`
                : "text-white/40 hover:text-white/60 hover:bg-white/5"
            }`}
          >
            <Icon size={16} />
            <span>{label}</span>
          </button>
        )
      })}
    </div>
  )
}

export default MoodSelector
