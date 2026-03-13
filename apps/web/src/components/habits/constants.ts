import type { HabitCategory } from "@lifeboard/types"

export const CATEGORY_CONFIG: Record<
  HabitCategory,
  {
    emoji: string
    label: string
    borderColor: string
    color: string
    bgColor: string
    suggestions: string[]
  }
> = {
  health: {
    emoji: "\u{1F49A}",
    label: "Health",
    borderColor: "border-l-green-500",
    color: "#22C55E",
    bgColor: "bg-green-500/10",
    suggestions: ["Drink 8 glasses of water", "Sleep 8 hours", "Take vitamins", "No junk food"],
  },
  fitness: {
    emoji: "\u{1F525}",
    label: "Fitness",
    borderColor: "border-l-orange-500",
    color: "#F97316",
    bgColor: "bg-orange-500/10",
    suggestions: ["Exercise 30 mins", "10,000 steps", "Stretch", "Morning run"],
  },
  learning: {
    emoji: "\u{1F4D6}",
    label: "Learning",
    borderColor: "border-l-blue-500",
    color: "#3B82F6",
    bgColor: "bg-blue-500/10",
    suggestions: ["Read 30 mins", "Study", "Practice skill", "Online course"],
  },
  mindfulness: {
    emoji: "\u{1F9D8}",
    label: "Mindfulness",
    borderColor: "border-l-purple-500",
    color: "#8B5CF6",
    bgColor: "bg-violet-500/10",
    suggestions: ["Meditate", "Gratitude journal", "No phone morning", "Deep breathing"],
  },
  social: {
    emoji: "\u{1F465}",
    label: "Social",
    borderColor: "border-l-pink-500",
    color: "#EC4899",
    bgColor: "bg-pink-500/10",
    suggestions: ["Call a friend", "Family time", "Random act of kindness"],
  },
  finance: {
    emoji: "\u{1F4B0}",
    label: "Finance",
    borderColor: "border-l-yellow-500",
    color: "#EAB308",
    bgColor: "bg-yellow-500/10",
    suggestions: ["Track expenses", "Save daily", "No impulse buys", "Review budget"],
  },
  custom: {
    emoji: "\u{26A1}",
    label: "Custom",
    borderColor: "border-l-gray-500",
    color: "#6B7280",
    bgColor: "bg-gray-500/10",
    suggestions: [],
  },
}

export const CATEGORY_FILTER_OPTIONS: { value: HabitCategory | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "health", label: "Health" },
  { value: "fitness", label: "Fitness" },
  { value: "learning", label: "Learning" },
  { value: "mindfulness", label: "Mindfulness" },
  { value: "social", label: "Social" },
  { value: "finance", label: "Finance" },
  { value: "custom", label: "Custom" },
]
