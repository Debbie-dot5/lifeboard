"use client"

import { useState, useEffect } from "react"
import { Trash2 } from "lucide-react"
import type { BookWithProgress } from "@lifeboard/lib"

type Props = {
  book: BookWithProgress
  onClick: () => void
  onDelete?: (book: BookWithProgress) => void
  size?: "sm" | "md" | "lg"
}

// Generate a consistent warm color from a string hash
const getBookColor = (str: string): string => {
  const colors = [
    "#8B4513", "#A0522D", "#6B3A2A", "#7B3F00", "#5C3317",
    "#704214", "#4A2C2A", "#6F4E37", "#3C1414", "#5D3A1A",
    "#8B6914", "#6B4226", "#7B5B3A", "#4E3B31", "#654321",
  ]
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return colors[Math.abs(hash) % colors.length]
}

const sizeConfig = {
  sm: { width: 100, height: 140, fontSize: "text-[10px]", authorSize: "text-[8px]", spineWidth: 12 },
  md: { width: 130, height: 185, fontSize: "text-xs", authorSize: "text-[10px]", spineWidth: 16 },
  lg: { width: 160, height: 220, fontSize: "text-sm", authorSize: "text-xs", spineWidth: 20 },
}

const sizeConfigMobile = {
  sm: { width: 80, height: 112, fontSize: "text-[10px]", authorSize: "text-[8px]", spineWidth: 10 },
  md: { width: 90, height: 130, fontSize: "text-[10px]", authorSize: "text-[8px]", spineWidth: 12 },
  lg: { width: 120, height: 170, fontSize: "text-xs", authorSize: "text-[10px]", spineWidth: 14 },
}

const BookSpine = ({ book, onClick, onDelete, size = "md" }: Props) => {
  const [isHovered, setIsHovered] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const config = isMobile ? sizeConfigMobile[size] : sizeConfig[size]
  const bgColor = getBookColor(book.title)

  const progress =
    book.progress && book.total_pages
      ? Math.min((book.progress.current_page / book.total_pages) * 100, 100)
      : 0

  const isFinished = progress >= 100

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirming(true)
  }

  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    onDelete?.(book)
    setConfirming(false)
  }

  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation()
    setConfirming(false)
  }

  return (
    <div
      className="relative cursor-pointer group"
      style={{ width: config.width, perspective: "800px" }}
      onClick={confirming ? undefined : onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setConfirming(false) }}
    >
      <div
        className="relative rounded-sm overflow-hidden"
        style={{
          width: config.width,
          height: config.height,
          transform: isHovered
            ? "perspective(800px) rotateY(0deg) translateY(-4px)"
            : "perspective(800px) rotateY(-15deg)",
          boxShadow: isHovered
            ? "12px 16px 30px rgba(0,0,0,0.6)"
            : "8px 8px 20px rgba(0,0,0,0.5), -4px 0 8px rgba(0,0,0,0.3)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          transformOrigin: "left center",
        }}
      >
        {/* Spine edge — darker left side */}
        <div
          className="absolute left-0 top-0 bottom-0"
          style={{
            width: config.spineWidth,
            background: `linear-gradient(90deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)`,
            zIndex: 2,
          }}
        />

        {book.cover_url ? (
          /* Book cover image */
          <img
            src={book.cover_url}
            alt={book.title}
            className="w-full h-full object-cover"
            draggable={false}
          />
        ) : (
          /* Generated spine — colored bg with title */
          <div
            className="w-full h-full flex flex-col items-center justify-center p-3"
            style={{ backgroundColor: bgColor }}
          >
            <p
              className={`${config.fontSize} font-semibold text-white/90 text-center leading-tight line-clamp-4`}
            >
              {book.title}
            </p>
            {book.author && (
              <p
                className={`${config.authorSize} text-white/50 text-center mt-1.5 line-clamp-2`}
              >
                {book.author}
              </p>
            )}
            <span
              className="absolute bottom-2 text-[8px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded bg-black/30 text-white/50"
            >
              {book.file_type}
            </span>
          </div>
        )}

        {/* Progress bar at bottom */}
        {progress > 0 && !confirming && (
          <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-black/30">
            <div
              className="h-full transition-all duration-300"
              style={{
                width: `${progress}%`,
                backgroundColor: isFinished ? "#22c55e" : "#d97706",
              }}
            />
          </div>
        )}

        {/* Finished badge */}
        {isFinished && (
          <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-green-500 flex items-center justify-center z-10">
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}

        {/* Delete button — appears on hover */}
        {onDelete && isHovered && !confirming && (
          <button
            onClick={handleDeleteClick}
            className="absolute top-1.5 left-1.5 w-6 h-6 rounded-full flex items-center justify-center z-10 transition-all"
            style={{
              background: "rgba(239,68,68,0.8)",
              border: "1px solid rgba(239,68,68,0.6)",
              boxShadow: "0 2px 8px rgba(239,68,68,0.4)",
            }}
            title="Delete book"
          >
            <Trash2 size={12} className="text-white" />
          </button>
        )}

        {/* Inline delete confirmation overlay */}
        {confirming && (
          <div
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 z-20"
            style={{
              background: "rgba(10,8,20,0.92)",
              backdropFilter: "blur(4px)",
            }}
          >
            <p className="text-[10px] text-white/70 font-medium text-center px-2">
              Delete this book?
            </p>
            <div className="flex gap-1.5">
              <button
                onClick={handleCancelDelete}
                className="px-2.5 py-1 rounded text-[10px] font-medium text-white/60 hover:text-white transition-colors"
                style={{
                  background: "rgba(255,255,255,0.08)",
                  border: "1px solid rgba(255,255,255,0.12)",
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-2.5 py-1 rounded text-[10px] font-medium text-white transition-colors"
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
    </div>
  )
}

export default BookSpine
