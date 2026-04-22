"use client"

import { X } from "lucide-react"
import type { Toast as ToastData, ToastType } from "@/lib/hooks/useToast"

type Props = {
  toast: ToastData
  onDismiss: (id: string) => void
}

const typeStyles: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: {
    bg: "rgba(34,197,94,0.06)",
    border: "rgba(34,197,94,0.25)",
    icon: "✓",
  },
  error: {
    bg: "rgba(239,68,68,0.06)",
    border: "rgba(239,68,68,0.25)",
    icon: "✕",
  },
  info: {
    bg: "rgba(108,71,255,0.06)",
    border: "rgba(108,71,255,0.25)",
    icon: "ℹ",
  },
}

const iconColors: Record<ToastType, string> = {
  success: "#22c55e",
  error: "#ef4444",
  info: "#6C47FF",
}

const Toast = ({ toast, onDismiss }: Props) => {
  const style = typeStyles[toast.type]

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl animate-slide-in-right"
      style={{
        background: style.bg,
        backdropFilter: "blur(40px)",
        WebkitBackdropFilter: "blur(40px)",
        border: `1px solid ${style.border}`,
        boxShadow:
          "0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.1)",
        minWidth: "260px",
        maxWidth: "380px",
      }}
    >
      {/* Icon */}
      <span
        className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
        style={{
          background: `${iconColors[toast.type]}20`,
          color: iconColors[toast.type],
        }}
      >
        {style.icon}
      </span>

      {/* Message */}
      <p className="flex-1 text-sm text-white/90 font-medium">{toast.message}</p>

      {/* Dismiss */}
      <button
        onClick={() => onDismiss(toast.id)}
        className="flex-shrink-0 p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
      >
        <X size={14} />
      </button>
    </div>
  )
}

export default Toast

// ─── Container: renders all active toasts ─────────────────────────────────────

export const ToastContainer = ({
  toasts,
  onDismiss,
}: {
  toasts: ToastData[]
  onDismiss: (id: string) => void
}) => {
  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-[9990] flex flex-col-reverse gap-2">
      {toasts.map((t) => (
        <Toast key={t.id} toast={t} onDismiss={onDismiss} />
      ))}
    </div>
  )
}
