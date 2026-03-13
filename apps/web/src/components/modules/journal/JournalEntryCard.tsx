"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MoreVertical, Play } from "lucide-react"
import { formatDate, extractPlainText } from "@lifeboard/lib"
import type { JournalEntry } from "@lifeboard/types"
import MoodBadge from "./MoodBadge"

const isVideoUrl = (url: string) => /\.(mp4|mov|webm|ogg|avi)(\?|$)/i.test(url)

const JournalEntryCard = ({
  entry,
  onEdit,
  onDelete,
}: {
  entry: JournalEntry
  onEdit: () => void
  onDelete: () => void
}) => {
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [menuOpen])

  const preview = extractPlainText(entry.content, 120)
  const firstMedia = entry.media_urls?.[0]
  const isVideo = firstMedia ? isVideoUrl(firstMedia) : false

  return (
    <div
      onClick={() => router.push(`/journal/${entry.id}`)}
      className="bg-[#13131F] rounded-xl border border-white/5 p-5 hover:border-[#6C47FF]/30 hover:shadow-[0_0_20px_rgba(108,71,255,0.08)] transition-all cursor-pointer group relative"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/30">{formatDate(entry.created_at)}</span>
          <MoodBadge mood={entry.mood} />
        </div>
        <div ref={menuRef} className="relative">
          <button
            onClick={(e) => {
              e.stopPropagation()
              setMenuOpen(!menuOpen)
            }}
            className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-all"
          >
            <MoreVertical size={16} />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 bg-[#1A1A2E] border border-white/10 rounded-lg shadow-xl py-1 z-10 min-w-[100px]">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onEdit()
                }}
                className="block w-full text-left px-3 py-1.5 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  setMenuOpen(false)
                  onDelete()
                }}
                className="block w-full text-left px-3 py-1.5 text-sm text-red-400/80 hover:text-red-400 hover:bg-white/5 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      <h3 className="text-white font-medium mb-2 line-clamp-1">
        {entry.title || "Untitled"}
      </h3>

      {preview && (
        <p className="text-white/40 text-sm mb-3 line-clamp-3">{preview}</p>
      )}

      {firstMedia && (
        <div className="relative rounded-lg overflow-hidden h-32 mt-2">
          {isVideo ? (
            <div className="w-full h-full bg-white/5 flex items-center justify-center">
              <Play size={32} className="text-white/40" />
            </div>
          ) : (
            <img
              src={firstMedia}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}
    </div>
  )
}

export default JournalEntryCard
