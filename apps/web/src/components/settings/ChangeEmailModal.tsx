"use client"

import { useState } from "react"
import { X, Mail } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
  currentEmail: string
  onSubmit: (newEmail: string) => Promise<void>
  isPending: boolean
}

const ChangeEmailModal = ({
  isOpen,
  onClose,
  currentEmail,
  onSubmit,
  isPending,
}: Props) => {
  const [newEmail, setNewEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [error, setError] = useState("")

  const handleClose = () => {
    setNewEmail("")
    setSent(false)
    setError("")
    onClose()
  }

  const handleSubmit = async () => {
    setError("")
    if (!newEmail || newEmail === currentEmail) {
      setError("Please enter a different email address.")
      return
    }
    try {
      await onSubmit(newEmail)
      setSent(true)
    } catch (err: any) {
      setError(err?.message ?? "Failed to update email.")
    }
  }

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center md:p-4"
      style={{
        background: "rgba(5, 5, 16, 0.75)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
      }}
    >
      <div
        className="rounded-t-2xl md:rounded-2xl p-6 w-full md:max-w-sm safe-bottom animate-slide-in-bottom md:animate-none"
        style={{
          background: "rgba(15, 12, 30, 0.85)",
          border: "1px solid rgba(255,255,255,0.1)",
          backdropFilter: "blur(40px)",
          WebkitBackdropFilter: "blur(40px)",
          boxShadow:
            "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(108,71,255,0.1)",
        }}
      >
        <div className="md:hidden mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        {/* Header */}
        <div
          className="flex items-center justify-between mb-6"
          style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            paddingBottom: "16px",
          }}
        >
          <div className="flex items-center gap-2">
            <Mail size={18} className="text-[#6C47FF]" />
            <h2 className="text-lg font-semibold text-white">Change Email</h2>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {sent ? (
          /* ── Success state ─────────────────────────────────────────── */
          <div className="text-center py-4">
            <div
              className="w-12 h-12 rounded-full mx-auto mb-4 flex items-center justify-center"
              style={{
                background: "rgba(108,71,255,0.15)",
                border: "1px solid rgba(108,71,255,0.3)",
              }}
            >
              <Mail size={20} className="text-[#6C47FF]" />
            </div>
            <p className="text-sm text-white/70 leading-relaxed">
              A confirmation link has been sent to{" "}
              <span className="text-white font-medium">{newEmail}</span>. Click
              it to confirm your new email address.
            </p>
            <button
              onClick={handleClose}
              className="mt-6 px-6 py-2 text-sm text-white/50 hover:text-white transition-colors"
            >
              Close
            </button>
          </div>
        ) : (
          /* ── Form state ────────────────────────────────────────────── */
          <>
            {/* Current email */}
            <div className="mb-4">
              <label className="block text-xs text-white/40 mb-1.5">
                Current email
              </label>
              <div
                className="px-3 py-2 rounded-lg text-sm text-white/30"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                }}
              >
                {currentEmail}
              </div>
            </div>

            {/* New email */}
            <div className="mb-4">
              <label className="block text-xs text-white/40 mb-1.5">
                New email
              </label>
              <input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-colors"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
                onFocus={(e) => {
                  e.currentTarget.style.borderColor = "rgba(108,71,255,0.5)"
                  e.currentTarget.style.boxShadow =
                    "0 0 0 2px rgba(108,71,255,0.15)"
                }}
                onBlur={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"
                  e.currentTarget.style.boxShadow = "none"
                }}
              />
            </div>

            {/* Error */}
            {error && (
              <p className="text-xs text-red-400 mb-4">{error}</p>
            )}

            {/* Actions */}
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleClose}
                className="flex-1 px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={isPending || !newEmail}
                className="flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(108,71,255,0.9), rgba(79,47,224,0.9))",
                  border: "1px solid rgba(108,71,255,0.5)",
                  boxShadow:
                    "0 4px 20px rgba(108,71,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)",
                }}
              >
                {isPending ? "Sending..." : "Send confirmation"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ChangeEmailModal
