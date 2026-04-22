"use client"

import { X, Minus, Plus } from "lucide-react"

type Theme = "dark" | "sepia" | "light"

type Props = {
  theme: Theme
  fontSize: number
  isOpen: boolean
  isEpub: boolean
  onClose: () => void
  onThemeChange: (theme: Theme) => void
  onFontSizeChange: (size: number) => void
}

const themes: { value: Theme; label: string; bg: string; text: string; border: string }[] = [
  { value: "dark", label: "Dark", bg: "#0F0F1A", text: "#e5e5e5", border: "rgba(255,255,255,0.2)" },
  { value: "sepia", label: "Sepia", bg: "#F4ECD8", text: "#433422", border: "rgba(67,52,34,0.3)" },
  { value: "light", label: "Light", bg: "#FFFFFF", text: "#1a1a1a", border: "rgba(0,0,0,0.2)" },
]

const ReaderSettings = ({
  theme,
  fontSize,
  isOpen,
  isEpub,
  onClose,
  onThemeChange,
  onFontSizeChange,
}: Props) => {
  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-40 w-full md:w-72 transition-transform duration-300 ease-out"
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
      }}
    >
      <div className="h-full bg-[#1A1A2E] border-l border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Settings</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-4 space-y-6">
          {/* Theme */}
          <div>
            <label className="block text-xs text-white/40 mb-3">Theme</label>
            <div className="flex gap-3">
              {themes.map((t) => (
                <button
                  key={t.value}
                  onClick={() => onThemeChange(t.value)}
                  className="flex-1 flex flex-col items-center gap-1.5"
                >
                  <div
                    className="w-full h-10 rounded-lg border-2 transition-all"
                    style={{
                      backgroundColor: t.bg,
                      borderColor: theme === t.value ? "#6C47FF" : t.border,
                    }}
                  />
                  <span
                    className={`text-[10px] font-medium transition-colors ${
                      theme === t.value ? "text-[#6C47FF]" : "text-white/30"
                    }`}
                  >
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Font Size (EPUB only) */}
          {isEpub && (
            <div>
              <label className="block text-xs text-white/40 mb-3">Font Size</label>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => onFontSizeChange(Math.max(12, fontSize - 1))}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
                >
                  <Minus size={14} />
                </button>
                <div className="text-center">
                  <span className="text-lg font-medium text-white tabular-nums">
                    {fontSize}
                  </span>
                  <span className="text-xs text-white/30 ml-1">px</span>
                </div>
                <button
                  onClick={() => onFontSizeChange(Math.min(28, fontSize + 1))}
                  className="w-9 h-9 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:bg-white/10 hover:text-white/60 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
              {/* Preview */}
              <p
                className="mt-3 text-white/60 leading-relaxed"
                style={{ fontSize: `${fontSize}px`, fontFamily: "Georgia, 'Times New Roman', serif" }}
              >
                The quick brown fox jumps over the lazy dog.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ReaderSettings
