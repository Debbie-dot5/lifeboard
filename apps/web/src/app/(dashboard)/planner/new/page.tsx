"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import usePlanner from "@/lib/hooks/usePlanner"
import TemplateSelector from "@/components/modules/planner/TemplateSelector"
import { TEMPLATE_CONFIG } from "@/components/modules/planner/constants"
import { createMilestone } from "@lifeboard/lib"
import type { PlanTemplateType } from "@lifeboard/types"

const useUser = () => {
  const supabase = createClient()
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
  })
}

const NewPlanPage = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: user } = useUser()
  const { createPlan, isCreating } = usePlanner(user?.id ?? "")

  const [selectedTemplate, setSelectedTemplate] = useState<PlanTemplateType | null>(null)
  const [title, setTitle] = useState("")
  const [goal, setGoal] = useState("")
  const [deadline, setDeadline] = useState(searchParams.get("deadline") ?? "")

  const handleCreate = async () => {
    if (!title.trim() || !selectedTemplate) return

    const supabase = createClient()

    const plan = await createPlan({
      title: title.trim(),
      goal: goal.trim() || null,
      deadline: deadline || null,
      template_type: selectedTemplate,
      is_pinned: false,
    })

    // Create default milestones for the selected template
    const defaultMilestones = TEMPLATE_CONFIG[selectedTemplate].defaultMilestones
    for (let i = 0; i < defaultMilestones.length; i++) {
      await createMilestone(supabase, {
        plan_id: plan.id,
        title: defaultMilestones[i],
        order_index: i,
      })
    }

    router.push(`/planner/${plan.id}`)
  }

  return (
    <div className="p-8">
      {/* Back button */}
      <button
        onClick={() => router.push("/planner")}
        className="flex items-center gap-2 text-sm text-white/40 hover:text-white/60 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Back to Planner
      </button>

      <h1 className="text-2xl font-bold text-white mb-1">Create a New Plan</h1>
      <p className="text-white/40 text-sm mb-8">Choose a template and fill in the details</p>

      {/* Template selector */}
      <div className="mb-8">
        <label className="block text-xs text-white/40 mb-3 uppercase tracking-wider font-medium">
          Choose Template
        </label>
        <TemplateSelector selected={selectedTemplate} onSelect={setSelectedTemplate} />
      </div>

      {/* Show pre-filled milestones preview */}
      {selectedTemplate && TEMPLATE_CONFIG[selectedTemplate].defaultMilestones.length > 0 && (
        <div className="mb-6 p-3 bg-white/5 rounded-xl">
          <p className="text-[10px] text-white/30 mb-2 uppercase tracking-wider font-medium">
            Pre-filled milestones
          </p>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_CONFIG[selectedTemplate].defaultMilestones.map((m) => (
              <span
                key={m}
                className="text-xs px-2.5 py-1 bg-white/5 text-white/50 rounded-lg"
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Form fields */}
      <div className="space-y-4 mb-8">
        <div>
          <label className="block text-xs text-white/40 mb-2">Plan Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Launch YouTube Channel"
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6C47FF] transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-2">Goal / Description</label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What do you want to achieve with this plan?"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6C47FF] transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs text-white/40 mb-2">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-[#6C47FF] transition-colors [color-scheme:dark]"
          />
        </div>
      </div>

      {/* Create button */}
      <button
        onClick={handleCreate}
        disabled={!title.trim() || !selectedTemplate || isCreating}
        className="w-full py-3 bg-gradient-to-r from-[#6C47FF] to-[#5835FF] text-white font-medium rounded-xl hover:from-[#5835FF] hover:to-[#4A2BE0] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isCreating ? "Creating..." : "Create Plan"}
      </button>
    </div>
  )
}

export default NewPlanPage
