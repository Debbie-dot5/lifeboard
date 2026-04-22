"use client"

import { useState, useRef, useEffect } from "react"
import { ArrowLeft, StickyNote, Settings, MoreVertical, Trash2 } from "lucide-react"

type Props = {
  title: string
  currentPage: number
  totalPages: number | null
  visible: boolean
  onBack: () => void
  onToggleNotes: () => void
  onToggleSettings: () => void
  onDelete?: () => void
}

const ReaderHeader = ({
  title,
  currentPage,
  totalPages,
  visible,
  onBack,
  onToggleNotes,
  onToggleSettings,
  onDelete,
}: Props) => {
  const [showMenu, setShowMenu] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
        setConfirmingDelete(false)
      }
    }
    if (showMenu) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [showMenu])

  return (
    <div
      className="fixed top-0 left-0 right-0 z-30 transition-all duration-300"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "translateY(0)" : "translateY(-100%)",
        pointerEvents: visible ? "auto" : "none",
      }}
    >
      <div className="bg-[#13131F]/95 backdrop-blur-md border-b border-white/10 px-4 py-3">
        <div className="flex items-center justify-between max-w-5xl mx-auto">
          {/* Left — Back button */}
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
          >
            <ArrowLeft size={18} />
            <span className="text-sm hidden sm:inline">Library</span>
          </button>

          {/* Center — Title + page */}
          <div className="flex-1 text-center px-4 min-w-0">
            <p className="text-sm font-medium text-white truncate">{title}</p>
            <p className="font-mono text-xs text-white/40">
              Page {currentPage}
              {totalPages ? ` of ${totalPages}` : ""}
            </p>
          </div>

          {/* Right — Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={onToggleNotes}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            >
              <StickyNote size={18} />
            </button>
            <button
              onClick={onToggleSettings}
              className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
            >
              <Settings size={18} />
            </button>

            {/* Three-dot menu */}
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => { setShowMenu(!showMenu); setConfirmingDelete(false) }}
                className="p-2 rounded-lg hover:bg-white/10 text-white/40 hover:text-white/70 transition-colors"
              >
                <MoreVertical size={18} />
              </button>

              {showMenu && (
                <div
                  className="absolute right-0 top-full mt-1 rounded-xl overflow-hidden min-w-[180px] z-50"
                  style={{
                    background: "rgba(20,18,35,0.95)",
                    backdropFilter: "blur(40px)",
                    WebkitBackdropFilter: "blur(40px)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    boxShadow: "0 16px 48px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.08)",
                  }}
                >
                  {!confirmingDelete ? (
                    <button
                      onClick={() => setConfirmingDelete(true)}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm transition-colors"
                      style={{ color: "rgba(239,68,68,0.9)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = "rgba(239,68,68,0.08)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = "transparent"
                      }}
                    >
                      <Trash2 size={14} />
                      Delete Book
                    </button>
                  ) : (
                    <div className="p-3 space-y-2">
                      <p className="text-xs text-white/60 font-medium">Delete this book?</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setConfirmingDelete(false); setShowMenu(false) }}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white/60 hover:text-white transition-colors"
                          style={{
                            background: "rgba(255,255,255,0.08)",
                            border: "1px solid rgba(255,255,255,0.12)",
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            onDelete?.()
                            setShowMenu(false)
                            setConfirmingDelete(false)
                          }}
                          className="flex-1 px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors"
                          style={{
                            background: "rgba(239,68,68,0.7)",
                            border: "1px solid rgba(239,68,68,0.5)",
                            boxShadow: "0 2px 8px rgba(239,68,68,0.3)",
                          }}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReaderHeader
