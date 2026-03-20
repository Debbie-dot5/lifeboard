"use client"

import { useState } from "react"
import type { BookWithProgress } from "@lifeboard/lib"

type Props = {
  book: BookWithProgress
  onClick: () => void
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

const BookSpine = ({ book, onClick, size = "md" }: Props) => {
  const [isHovered, setIsHovered] = useState(false)
  const config = sizeConfig[size]
  const bgColor = getBookColor(book.title)

  const progress =
    book.progress && book.total_pages
      ? Math.min((book.progress.current_page / book.total_pages) * 100, 100)
      : 0

  const isFinished = progress >= 100

  return (
    <div
      className="relative cursor-pointer group"
      style={{ width: config.width, perspective: "800px" }}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
        {progress > 0 && (
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
      </div>
    </div>
  )
}

export default BookSpine
