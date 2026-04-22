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
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      <div className="absolute inset-0" onClick={onClose} style={{ background: "rgba(5, 5, 16, 0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }} />
      <div className="relative rounded-t-2xl md:rounded-2xl w-full md:max-w-md p-6 max-h-[90vh] overflow-y-auto safe-bottom animate-slide-in-bottom md:animate-none" style={{ background: "rgba(15, 12, 30, 0.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(108,71,255,0.1)" }}>
        {/* Swipe handle (mobile) */}
        <div className="md:hidden mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        {/* Header */}
        <div className="flex items-center justify-between mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "16px", background: "linear-gradient(180deg, rgba(108,71,255,0.06) 0%, transparent 100%)" }}>
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
                    ? "text-white"
                    : "text-white/40 hover:text-white/60"
                }`}
                style={
                  templateType === opt.value
                    ? { background: "rgba(108,71,255,0.2)", border: "1px solid rgba(108,71,255,0.3)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }
                    : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
                }
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
            className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 glass-input"
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
            className="w-full rounded-lg px-3 py-2.5 text-sm text-white placeholder-white/20 glass-input resize-none"
          />
        </div>

        {/* Deadline */}
        <div className="mb-6">
          <label className="block text-xs text-white/40 mb-2">Deadline</label>
          <input
            type="date"
            value={deadline}
            onChange={(e) => setDeadline(e.target.value)}
            className="w-full rounded-lg px-3 py-2.5 text-sm text-white glass-input [color-scheme:dark]"
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
            className="px-5 py-2 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.9), rgba(79,47,224,0.9))", border: "1px solid rgba(108,71,255,0.5)", boxShadow: "0 4px 20px rgba(108,71,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" }}
          >
            {isPending ? "Saving..." : editingPlan ? "Save Changes" : "Create Plan"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default EditPlanModal
