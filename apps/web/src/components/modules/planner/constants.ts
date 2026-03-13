import type { PlanTemplateType } from "@lifeboard/types"

export type TemplateConfig = {
  label: string
  icon: string
  description: string
  color: string
  borderColor: string
  bgColor: string
  defaultMilestones: string[]
}

export const TEMPLATE_CONFIG: Record<PlanTemplateType, TemplateConfig> = {
  content: {
    label: "Content Plan",
    icon: "📅",
    description: "Plan your content creation pipeline",
    color: "#3B82F6",
    borderColor: "border-blue-500/40",
    bgColor: "bg-blue-500/10",
    defaultMilestones: ["Ideation", "Production", "Editing", "Publishing"],
  },
  event: {
    label: "Event Plan",
    icon: "🎉",
    description: "Organize events from start to finish",
    color: "#EC4899",
    borderColor: "border-pink-500/40",
    bgColor: "bg-pink-500/10",
    defaultMilestones: ["Planning", "Preparation", "Execution", "Follow-up"],
  },
  study: {
    label: "Study Plan",
    icon: "📚",
    description: "Structure your learning journey",
    color: "#22C55E",
    borderColor: "border-green-500/40",
    bgColor: "bg-green-500/10",
    defaultMilestones: ["Research", "Study", "Practice", "Review"],
  },
  personal: {
    label: "Personal Goal",
    icon: "🎯",
    description: "Track personal goals and milestones",
    color: "#6C47FF",
    borderColor: "border-purple-500/40",
    bgColor: "bg-purple-500/10",
    defaultMilestones: ["Define Goal", "Plan", "Execute", "Reflect"],
  },
  nysc: {
    label: "NYSC Plan",
    icon: "🇳🇬",
    description: "Plan your NYSC service year",
    color: "#F97316",
    borderColor: "border-orange-500/40",
    bgColor: "bg-orange-500/10",
    defaultMilestones: ["Pre-NYSC Prep", "Orientation Camp", "PPA", "Passing Out"],
  },
  custom: {
    label: "Custom",
    icon: "⚙️",
    description: "Start from scratch with your own structure",
    color: "#6B7280",
    borderColor: "border-gray-500/40",
    bgColor: "bg-gray-500/10",
    defaultMilestones: [],
  },
}

export const TEMPLATE_FILTER_OPTIONS: { value: PlanTemplateType | "all"; label: string }[] = [
  { value: "all", label: "All" },
  { value: "content", label: "Content" },
  { value: "event", label: "Event" },
  { value: "study", label: "Study" },
  { value: "nysc", label: "NYSC" },
  { value: "personal", label: "Personal" },
  { value: "custom", label: "Custom" },
]
