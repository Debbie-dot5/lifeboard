"use client"

import { Check } from "lucide-react"
import { TEMPLATE_CONFIG } from "./constants"
import type { PlanTemplateType } from "@lifeboard/types"

type Props = {
  selected: PlanTemplateType | null
  onSelect: (type: PlanTemplateType) => void
}

const TEMPLATES = (Object.keys(TEMPLATE_CONFIG) as PlanTemplateType[])

const TemplateSelector = ({ selected, onSelect }: Props) => {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
      {TEMPLATES.map((type) => {
        const config = TEMPLATE_CONFIG[type]
        const isSelected = selected === type

        return (
          <button
            key={type}
            onClick={() => onSelect(type)}
            className={`relative text-left p-4 rounded-xl border transition-all duration-200 ${
              isSelected
                ? "border-[#6C47FF] bg-[#6C47FF]/10 shadow-[0_0_20px_rgba(108,71,255,0.1)]"
                : "border-white/5 bg-[#13131F] hover:border-white/10"
            }`}
          >
            {isSelected && (
              <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#6C47FF] flex items-center justify-center">
                <Check size={12} className="text-white" />
              </div>
            )}
            <span className="text-xl mb-2 block">{config.icon}</span>
            <h3 className="text-sm font-semibold text-white mb-0.5">{config.label}</h3>
            <p className="text-[10px] text-white/30 line-clamp-2">{config.description}</p>
          </button>
        )
      })}
    </div>
  )
}

export default TemplateSelector
