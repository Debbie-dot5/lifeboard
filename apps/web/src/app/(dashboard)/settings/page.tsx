"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import useSettings, { useUser } from "@/lib/hooks/useSettings"
import ChangeEmailModal from "@/components/settings/ChangeEmailModal"
import {
  Settings,
  Camera,
  Save,
  Lock,
  Eye,
  EyeOff,
  Bell,
  Target,
  Minus,
  Plus,
  AlertTriangle,
  Copy,
  Check,
  User,
  Shield,
  Trash2,
} from "lucide-react"

// ─── GLASS CARD ──────────────────────────────────────────────────────────────

const GlassCard = ({
  children,
  dangerBorder,
}: {
  children: React.ReactNode
  dangerBorder?: boolean
}) => (
  <div
    className="rounded-xl p-4 md:p-5 lg:p-6"
    style={{
      background: "rgba(255,255,255,0.03)",
      border: "1px solid rgba(255,255,255,0.08)",
      borderLeft: dangerBorder
        ? "3px solid rgba(239,68,68,0.6)"
        : "1px solid rgba(255,255,255,0.08)",
      backdropFilter: "blur(20px)",
      WebkitBackdropFilter: "blur(20px)",
      boxShadow:
        "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
    }}
  >
    {children}
  </div>
)

// ─── GLASS INPUT ─────────────────────────────────────────────────────────────

const GlassInput = ({
  type = "text",
  value,
  onChange,
  placeholder,
  disabled,
  readOnly,
}: {
  type?: string
  value: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  placeholder?: string
  disabled?: boolean
  readOnly?: boolean
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    disabled={disabled}
    readOnly={readOnly}
    className={`w-full px-3 py-2.5 rounded-lg text-sm text-white placeholder-white/20 outline-none transition-all ${
      readOnly || disabled ? "text-white/30 cursor-not-allowed" : ""
    }`}
    style={{
      background: readOnly
        ? "rgba(255,255,255,0.02)"
        : "rgba(255,255,255,0.05)",
      border: `1px solid rgba(255,255,255,${readOnly ? "0.05" : "0.1"})`,
    }}
    onFocus={(e) => {
      if (!readOnly && !disabled) {
        e.currentTarget.style.borderColor = "rgba(108,71,255,0.5)"
        e.currentTarget.style.boxShadow = "0 0 0 2px rgba(108,71,255,0.15)"
      }
    }}
    onBlur={(e) => {
      e.currentTarget.style.borderColor = `rgba(255,255,255,${
        readOnly ? "0.05" : "0.1"
      })`
      e.currentTarget.style.boxShadow = "none"
    }}
  />
)

// ─── TOGGLE SWITCH ───────────────────────────────────────────────────────────

const ToggleSwitch = ({
  checked,
  onChange,
}: {
  checked: boolean
  onChange: (val: boolean) => void
}) => (
  <button
    onClick={() => onChange(!checked)}
    className="relative w-11 h-6 rounded-full transition-colors duration-200"
    style={{
      background: checked ? "#6C47FF" : "rgba(255,255,255,0.1)",
    }}
  >
    <span
      className="absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-md transition-transform duration-200"
      style={{
        transform: checked ? "translateX(20px)" : "translateX(0)",
      }}
    />
  </button>
)

// ─── TOAST ───────────────────────────────────────────────────────────────────

const Toast = ({
  message,
  type,
  onDismiss,
}: {
  message: string
  type: "success" | "error"
  onDismiss: () => void
}) => {
  useEffect(() => {
    const t = setTimeout(onDismiss, 3000)
    return () => clearTimeout(t)
  }, [onDismiss])

  return (
    <div
      className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-sm font-medium animate-fade-in"
      style={{
        background:
          type === "success"
            ? "rgba(34,197,94,0.15)"
            : "rgba(239,68,68,0.15)",
        border: `1px solid ${
          type === "success"
            ? "rgba(34,197,94,0.3)"
            : "rgba(239,68,68,0.3)"
        }`,
        color: type === "success" ? "#22c55e" : "#ef4444",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
      }}
    >
      {message}
    </div>
  )
}

// ─── DELETE CONFIRMATION MODAL ───────────────────────────────────────────────

const DeleteConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  isPending,
}: {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  isPending: boolean
}) => {
  const [typed, setTyped] = useState("")

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
            "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), 0 0 0 1px rgba(239,68,68,0.15)",
        }}
      >
        <div className="md:hidden mx-auto mb-3 h-1 w-10 rounded-full bg-white/20" />
        <div className="flex items-center gap-3 mb-4">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{
              background: "rgba(239,68,68,0.15)",
              border: "1px solid rgba(239,68,68,0.3)",
            }}
          >
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <h2 className="text-lg font-semibold text-white">Delete Account</h2>
        </div>

        <p className="text-sm text-white/50 leading-relaxed mb-4">
          Are you sure? This will permanently delete all your data including
          tasks, journal entries, habits, and books.
        </p>

        <div className="mb-4">
          <label className="block text-xs text-white/40 mb-1.5">
            Type <span className="text-red-400 font-mono">DELETE</span> to
            confirm
          </label>
          <GlassInput
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            placeholder="DELETE"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              setTyped("")
              onClose()
            }}
            className="flex-1 px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={typed !== "DELETE" || isPending}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-lg transition-all disabled:opacity-30"
            style={{
              background: "rgba(239,68,68,0.2)",
              border: "1px solid rgba(239,68,68,0.4)",
              color: "#ef4444",
            }}
          >
            {isPending ? "Deleting..." : "Delete my account"}
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── SETTINGS PAGE ───────────────────────────────────────────────────────────

const SettingsPage = () => {
  const router = useRouter()
  const { data: user } = useUser()
  const userId = user?.id ?? ""

  const {
    yearlyGoal,
    upsertGoal,
    isUpsertingGoal,
    updateName,
    isUpdatingName,
    updatePassword,
    isUpdatingPassword,
    updateEmail,
    isUpdatingEmail,
    uploadAvatar,
    isUploading,
    deleteAccount,
    isDeletingAccount,
  } = useSettings(userId)

  // ── Local state ─────────────────────────────────────────────────────────
  const [displayName, setDisplayName] = useState("")
  const [showEmailModal, setShowEmailModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  // Password
  const [currentPw, setCurrentPw] = useState("")
  const [newPw, setNewPw] = useState("")
  const [confirmPw, setConfirmPw] = useState("")
  const [showCurrentPw, setShowCurrentPw] = useState(false)
  const [showNewPw, setShowNewPw] = useState(false)
  const [pwError, setPwError] = useState("")

  // Reading goal
  const [goalTarget, setGoalTarget] = useState(12)

  // Notifications (localStorage)
  const [notifBirthday, setNotifBirthday] = useState(true)
  const [notifHabit, setNotifHabit] = useState(true)
  const [notifWeekly, setNotifWeekly] = useState(true)

  // Toast
  const [toast, setToast] = useState<{
    message: string
    type: "success" | "error"
  } | null>(null)

  // Copied
  const [copied, setCopied] = useState(false)

  // Avatar file ref
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Sync user data ────────────────────────────────────────────────────
  useEffect(() => {
    if (user) {
      setDisplayName(user.user_metadata?.display_name ?? "")
    }
  }, [user])

  useEffect(() => {
    if (yearlyGoal) {
      setGoalTarget(yearlyGoal.target_count)
    }
  }, [yearlyGoal])

  // Load notification prefs from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("lifeboard_notif_prefs")
      if (saved) {
        const prefs = JSON.parse(saved)
        setNotifBirthday(prefs.birthday ?? true)
        setNotifHabit(prefs.habit ?? true)
        setNotifWeekly(prefs.weekly ?? true)
      }
    } catch {}
  }, [])

  // Save notification prefs
  const saveNotifPrefs = (
    birthday: boolean,
    habit: boolean,
    weekly: boolean
  ) => {
    localStorage.setItem(
      "lifeboard_notif_prefs",
      JSON.stringify({ birthday, habit, weekly })
    )
  }

  // ── Handlers ──────────────────────────────────────────────────────────

  const handleSaveName = async () => {
    try {
      await updateName(displayName)
      setToast({ message: "Display name updated!", type: "success" })
    } catch (err: any) {
      setToast({
        message: err?.message ?? "Failed to update name.",
        type: "error",
      })
    }
  }

  const handlePasswordUpdate = async () => {
    setPwError("")
    if (newPw.length < 8) {
      setPwError("Password must be at least 8 characters.")
      return
    }
    if (newPw !== confirmPw) {
      setPwError("Passwords do not match.")
      return
    }
    try {
      await updatePassword(newPw)
      setCurrentPw("")
      setNewPw("")
      setConfirmPw("")
      setToast({ message: "Password updated!", type: "success" })
    } catch (err: any) {
      setToast({
        message: err?.message ?? "Failed to update password.",
        type: "error",
      })
    }
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const allowed = ["image/jpeg", "image/png", "image/webp"]
    if (!allowed.includes(file.type)) {
      setToast({
        message: "Only JPEG, PNG, or WebP images are allowed.",
        type: "error",
      })
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setToast({ message: "Image must be under 2MB.", type: "error" })
      return
    }
    try {
      await uploadAvatar(file)
      setToast({ message: "Avatar updated!", type: "success" })
    } catch (err: any) {
      setToast({
        message: err?.message ?? "Failed to upload avatar.",
        type: "error",
      })
    }
  }

  const handleGoalSave = async (target: number) => {
    setGoalTarget(target)
    try {
      await upsertGoal({ goalId: yearlyGoal?.id, target })
    } catch {}
  }

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount()
      router.push("/")
      router.refresh()
    } catch (err: any) {
      setToast({
        message: err?.message ?? "Failed to delete account.",
        type: "error",
      })
    }
  }

  const handleCopyId = async () => {
    if (user?.id) {
      await navigator.clipboard.writeText(user.id)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // ── Computed ──────────────────────────────────────────────────────────
  const avatarUrl = user?.user_metadata?.avatar_url
  const initials = (user?.user_metadata?.display_name ?? user?.email ?? "U")
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)

  const createdAt = user?.created_at
    ? new Date(user.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—"

  const lastSignIn = user?.last_sign_in_at
    ? new Date(user.last_sign_in_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "—"

  const truncatedId = user?.id
    ? `${user.id.slice(0, 8)}...${user.id.slice(-4)}`
    : "—"

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-20 md:pt-6 lg:pt-8 max-w-none md:max-w-2xl mx-auto">
      {/* ── Page Header ──────────────────────────────────────────────── */}
      <div
        className="rounded-xl p-4 md:p-5 lg:p-6 mb-6 md:mb-8"
        style={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          boxShadow:
            "0 8px 32px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-lg flex items-center justify-center"
            style={{
              background: "rgba(108,71,255,0.15)",
              border: "1px solid rgba(108,71,255,0.3)",
            }}
          >
            <Settings size={20} className="text-[#6C47FF]" />
          </div>
          <div>
            <h1
              className="text-2xl font-bold text-white"
              style={{ fontFamily: "var(--font-clash)", letterSpacing: "-0.03em" }}
            >
              Settings
            </h1>
            <p className="text-sm text-white/40">
              Manage your account and preferences
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        {/* ══════════════════════════════════════════════════════════════
            SECTION 1 — Profile
            ══════════════════════════════════════════════════════════ */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <User size={16} className="text-[#6C47FF]" />
            <h2 className="text-base font-semibold text-white">Profile</h2>
          </div>

          {/* Avatar */}
          <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-5 mb-6">
            <div className="relative mx-auto md:mx-0">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Avatar"
                  className="w-20 h-20 rounded-full object-cover"
                  style={{
                    border: "2px solid rgba(108,71,255,0.3)",
                    boxShadow: "0 4px 20px rgba(108,71,255,0.2)",
                  }}
                />
              ) : (
                <div
                  className="w-20 h-20 rounded-full flex items-center justify-center text-xl font-bold text-white"
                  style={{
                    background:
                      "linear-gradient(135deg, #6C47FF 0%, #4F2FE0 100%)",
                    boxShadow: "0 4px 20px rgba(108,71,255,0.3)",
                  }}
                >
                  {initials}
                </div>
              )}
              {isUploading && (
                <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-[#6C47FF] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div className="text-center md:text-left">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="inline-flex items-center gap-2 px-3 py-2 md:py-1.5 text-xs font-medium rounded-lg transition-all text-white/60 hover:text-white min-h-[44px] md:min-h-0"
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                }}
              >
                <Camera size={14} />
                Change photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={handleAvatarUpload}
              />
              <p className="text-[10px] text-white/25 mt-1">
                JPG, PNG or WebP · Max 2MB
              </p>
            </div>
          </div>

          {/* Display name */}
          <div className="mb-4">
            <label className="block text-xs text-white/40 mb-1.5">
              Display name
            </label>
            <div className="flex flex-col md:flex-row gap-2">
              <GlassInput
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Your name"
              />
              <button
                onClick={handleSaveName}
                disabled={isUpdatingName}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-medium text-white rounded-lg transition-all disabled:opacity-50 shrink-0"
                style={{
                  background:
                    "linear-gradient(135deg, rgba(108,71,255,0.9), rgba(79,47,224,0.9))",
                  border: "1px solid rgba(108,71,255,0.5)",
                  boxShadow: "0 4px 20px rgba(108,71,255,0.3)",
                }}
              >
                <Save size={14} />
                {isUpdatingName ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs text-white/40 mb-1.5">Email</label>
            <GlassInput value={user?.email ?? ""} readOnly />
            <button
              onClick={() => setShowEmailModal(true)}
              className="text-xs text-[#6C47FF] hover:text-[#8B6FFF] mt-1.5 transition-colors"
            >
              Change email
            </button>
          </div>
        </GlassCard>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 2 — Security
            ══════════════════════════════════════════════════════════ */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Shield size={16} className="text-[#6C47FF]" />
            <h2 className="text-base font-semibold text-white">Security</h2>
          </div>

          <div className="space-y-4">
            {/* Current password */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">
                Current password
              </label>
              <div className="relative">
                <GlassInput
                  type={showCurrentPw ? "text" : "password"}
                  value={currentPw}
                  onChange={(e) => setCurrentPw(e.target.value)}
                  placeholder="••••••••"
                />
                <button
                  onClick={() => setShowCurrentPw(!showCurrentPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
                >
                  {showCurrentPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* New password */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">
                New password
              </label>
              <div className="relative">
                <GlassInput
                  type={showNewPw ? "text" : "password"}
                  value={newPw}
                  onChange={(e) => setNewPw(e.target.value)}
                  placeholder="Minimum 8 characters"
                />
                <button
                  onClick={() => setShowNewPw(!showNewPw)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/50 transition-colors"
                >
                  {showNewPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-xs text-white/40 mb-1.5">
                Confirm new password
              </label>
              <GlassInput
                type="password"
                value={confirmPw}
                onChange={(e) => setConfirmPw(e.target.value)}
                placeholder="••••••••"
              />
            </div>

            {pwError && (
              <p className="text-xs text-red-400">{pwError}</p>
            )}

            <button
              onClick={handlePasswordUpdate}
              disabled={isUpdatingPassword || !newPw}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-all disabled:opacity-50"
              style={{
                background:
                  "linear-gradient(135deg, rgba(108,71,255,0.9), rgba(79,47,224,0.9))",
                border: "1px solid rgba(108,71,255,0.5)",
                boxShadow: "0 4px 20px rgba(108,71,255,0.3)",
              }}
            >
              <Lock size={14} />
              {isUpdatingPassword ? "Updating..." : "Update password"}
            </button>
          </div>
        </GlassCard>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 3 — Preferences
            ══════════════════════════════════════════════════════════ */}
        <GlassCard>
          <div className="flex items-center gap-2 mb-6">
            <Target size={16} className="text-[#6C47FF]" />
            <h2 className="text-base font-semibold text-white">Preferences</h2>
          </div>

          {/* Reading goal quick set */}
          <div className="mb-6">
            <p className="text-sm text-white/60 mb-3">
              Books to read in {new Date().getFullYear()}
            </p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => handleGoalSave(Math.max(1, goalTarget - 1))}
                disabled={isUpsertingGoal}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
              >
                <Minus size={16} />
              </button>
              <span className="font-mono text-3xl font-bold text-[#6C47FF] tabular-nums w-12 text-center">
                {goalTarget}
              </span>
              <button
                onClick={() => handleGoalSave(goalTarget + 1)}
                disabled={isUpsertingGoal}
                className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>
          </div>

          {/* Notification toggles */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Bell size={14} className="text-white/40" />
              <p className="text-sm text-white/60">Notifications</p>
            </div>

            <div className="space-y-3">
              {[
                {
                  label: "Birthday reminders",
                  checked: notifBirthday,
                  onChange: (v: boolean) => {
                    setNotifBirthday(v)
                    saveNotifPrefs(v, notifHabit, notifWeekly)
                  },
                },
                {
                  label: "Daily habit check-in reminder",
                  checked: notifHabit,
                  onChange: (v: boolean) => {
                    setNotifHabit(v)
                    saveNotifPrefs(notifBirthday, v, notifWeekly)
                  },
                },
                {
                  label: "Weekly review prompt",
                  checked: notifWeekly,
                  onChange: (v: boolean) => {
                    setNotifWeekly(v)
                    saveNotifPrefs(notifBirthday, notifHabit, v)
                  },
                },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between py-2"
                  style={{
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <span className="text-sm text-white/50">{item.label}</span>
                  <ToggleSwitch
                    checked={item.checked}
                    onChange={item.onChange}
                  />
                </div>
              ))}
            </div>
          </div>
        </GlassCard>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 4 — Danger Zone
            ══════════════════════════════════════════════════════════ */}
        <GlassCard dangerBorder>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle size={16} className="text-red-400/70" />
            <h2 className="text-base font-semibold text-white">Danger Zone</h2>
          </div>

          <p className="text-sm text-white/40 mb-4">
            Permanently delete your account and all associated data.
          </p>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all"
            style={{
              background: "transparent",
              border: "1px solid rgba(239,68,68,0.3)",
              color: "#ef4444",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "rgba(239,68,68,0.1)"
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.5)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.borderColor = "rgba(239,68,68,0.3)"
            }}
          >
            <Trash2 size={14} />
            Delete my account
          </button>
        </GlassCard>

        {/* ══════════════════════════════════════════════════════════════
            SECTION 5 — Account Info
            ══════════════════════════════════════════════════════════ */}
        <div className="pt-2 pb-8 space-y-1.5">
          <p className="text-xs text-white/20">
            Account created: {createdAt}
          </p>
          <p className="text-xs text-white/20">
            Last sign in: {lastSignIn}
          </p>
          <p className="text-xs text-white/20 flex items-center gap-1.5">
            User ID: {truncatedId}
            <button
              onClick={handleCopyId}
              className="text-white/20 hover:text-white/40 transition-colors"
              title="Copy full ID"
            >
              {copied ? <Check size={12} /> : <Copy size={12} />}
            </button>
          </p>
          <p className="text-xs text-white/20">App version: 1.0.0</p>
        </div>
      </div>

      {/* ── Modals ─────────────────────────────────────────────────── */}
      <ChangeEmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        currentEmail={user?.email ?? ""}
        onSubmit={updateEmail}
        isPending={isUpdatingEmail}
      />

      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onConfirm={handleDeleteAccount}
        isPending={isDeletingAccount}
      />

      {/* ── Toast ──────────────────────────────────────────────────── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onDismiss={() => setToast(null)}
        />
      )}
    </div>
  )
}

export default SettingsPage
