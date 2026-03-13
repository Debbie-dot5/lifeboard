"use client"

import { useState, useEffect } from "react"
import { X } from "lucide-react"
import { TEMPLATE_CONFIG } from "./constants"
import type { Plan, PlanTemplateType, CreatePlanInput } from "@lifeboard/types"

type Props = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (input: CreatePlanInput) => void
  onUpdate?: (
    planId: string,
    updates: Partial<Omit<Plan, "id" | "user_id" | "created_at">>
  ) => void
  editingPlan?: Plan | null
  isPending: boolean
}

const TEMPLATE_OPTIONS = (Object.keys(TEMPLATE_CONFIG) as PlanTemplateType[]).map((key) => ({
  value: key,
  label: TEMPLATE_CONFIG[key].label,
  icon: TEMPLATE_CONFIG[key].icon,
}))

const EditPlanModal = ({ isOpen, onClose, onSubmit, onUpdate, editingPlan, isPending }: Props) => {
  const [title, setTitle] = useState("")
  const [goal, setGoal] = useState("")
  const [deadline, setDeadline] = useState("")
  const [templateType, setTemplateType] = useState<PlanTemplateType>("custom")

  useEffect(() => {
    if (editingPlan) {
      setTitle(editingPlan.title)
      setGoal(editingPlan.goal ?? "")
      setDeadline(editingPlan.deadline ?? "")
      setTemplateType(editingPlan.template_type)
    } else {
      setTitle("")
      setGoal("")
      setDeadline("")
      setTemplateType("custom")
    }
  }, [editingPlan, isOpen])

  if (!isOpen) return null

  const handleSave = () => {
    if (!title.trim()) return

    const data = {
      title: title.trim(),
      goal: goal.trim() || null,
      deadline: deadline || null,
      template_type: templateType,
      is_pinned: editingPlan?.is_pinned ?? false,
    }

    if (editingPlan && onUpdate) {
      onUpdate(editingPlan.id, data)
    } else {
      onSubmit(data)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl w-full max-w-md p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white">
            {editingPlan ? "Edit Plan" : "New Plan"}
          </h2>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
            <X size={18} className="text-white/40" />
          </button>
        </div>

        {/* Template selector */}
        <div className="mb-4">
          <label className="block text-xs text-white/40 mb-2">Template</label>
          <div className="flex flex-wrap gap-1.5">
            {TEMPLATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setTemplateType(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  templateType === opt.value
                    ? "bg-[#6C47FF] text-white"
                    : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
                }`}
              >
                <span>{opt.icon}</span>
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title */}
        <div className="mb-4">
          <label className="block text-xs text-white/40 mb-2">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Plan title..."
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6C47FF] transition-colors"
          />
        </div>

        {/* Goal */}
        <div className="mb-4">
          <label className="block text-xs text-white/40 mb-2">Goal / Description</label>
          <textarea
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            placeholder="What do you want to achieve?"
            rows={3}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6C47FF] transition-colors resize-none"
          />
        </div>

        {/* Deadline */}
        <div className="mb-6">
          <label className="block text-xs text-white/40 mb-2">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#6C47FF] transition-colors [color-scheme:dark]"
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || isPending}
            className="px-5 py-2 bg-[#6C47FF] text-white text-sm font-medium rounded-lg hover:bg-[#5835FF] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isPending ? "Saving..." : editingPlan ? "Save Changes" : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditPlanModal
