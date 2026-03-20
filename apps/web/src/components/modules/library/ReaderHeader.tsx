"use client"

import { ArrowLeft, StickyNote, Settings } from "lucide-react"

type Props = {
  title: string
  currentPage: number
  totalPages: number | null
  visible: boolean
  onBack: () => void
  onToggleNotes: () => void
  onToggleSettings: () => void
}

const ReaderHeader = ({
  title,
  currentPage,
  totalPages,
  visible,
  onBack,
  onToggleNotes,
  onToggleSettings,
}: Props) => {
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
            <p className="text-xs text-white/40">
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReaderHeader
