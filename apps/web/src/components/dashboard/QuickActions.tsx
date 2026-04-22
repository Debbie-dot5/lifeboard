"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, X, CheckSquare, PenLine, Bell, Target } from "lucide-react"

const ACTIONS = [
  { label: "Add Task", icon: CheckSquare, href: "/tasks", color: "#6C47FF" },
  { label: "New Entry", icon: PenLine, href: "/journal", color: "#22C55E" },
  { label: "Set Reminder", icon: Bell, href: "/reminders", color: "#EC4899" },
  { label: "New Plan", icon: Target, href: "/planner", color: "#3B82F6" },
]

const QuickActions = () => {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [isOpen])

  return (
    <div ref={menuRef} className="fixed bottom-6 right-6 z-50 safe-bottom">
      {/* Menu items */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 flex flex-col gap-2 mb-2">
          {ACTIONS.map((action, i) => {
            const Icon = action.icon
            return (
              <button
                key={action.label}
                onClick={() => {
                  router.push(action.href)
                  setIsOpen(false)
                }}
                className="flex items-center gap-3 rounded-xl px-4 py-3 hover:bg-white/10 transition-all animate-fade-in-up whitespace-nowrap"
                style={{
                  animationDelay: `${(ACTIONS.length - 1 - i) * 0.05}s`,
                  background: "rgba(15, 12, 30, 0.85)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  backdropFilter: "blur(40px)",
                  WebkitBackdropFilter: "blur(40px)",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.08)",
                }}
              >
                <Icon size={16} style={{ color: action.color }} />
                <span className="text-sm text-white">{action.label}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* FAB button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 rounded-full text-white flex items-center justify-center transition-all duration-200 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, rgba(108,71,255,0.9), rgba(79,47,224,0.9))",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          border: "1px solid rgba(108,71,255,0.5)",
          boxShadow: "0 4px 20px rgba(108,71,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2), inset 0 -1px 0 rgba(0,0,0,0.2)",
        }}
      >
        {isOpen ? <X size={22} /> : <Plus size={22} />}
      </button>
    </div>
  )
}

export default QuickActions
