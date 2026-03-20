"use client"

import Link from "next/link"
import type { BookWithProgress } from "@lifeboard/lib"
import type { ReadingGoal } from "@lifeboard/types"

type Props = {
  currentlyReading: BookWithProgress | null
  readingStreak: number
  booksReadThisYear: number
  yearlyReadingGoal: ReadingGoal | null
}

const ReadingCard = ({
  currentlyReading,
  readingStreak,
  booksReadThisYear,
  yearlyReadingGoal,
}: Props) => {
  const book = currentlyReading
  const currentPage = book?.progress?.current_page ?? 0
  const totalPages = book?.total_pages ?? 0
  const progressPercent =
    totalPages > 0 ? Math.round((currentPage / totalPages) * 100) : 0

  return (
    <div className="relative bg-[#13131F] rounded-2xl border border-white/[0.06] border-l-[3px] border-l-[#F59E0B] p-6 h-full hover:border-[#F59E0B]/30 hover:shadow-[0_0_30px_rgba(245,158,11,0.1)] hover:scale-[1.01] transition-all duration-200 group">
      {/* Floating icon */}
      <span className="absolute top-4 right-4 text-lg opacity-60 animate-float-flip">
        📖
      </span>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <h3 className="font-semibold text-white">Reading</h3>
        {readingStreak > 0 && (
          <span className="text-xs bg-[#F59E0B]/15 text-[#F59E0B] rounded-full px-2.5 py-0.5 font-medium">
            🔥 {readingStreak} day streak
          </span>
        )}
      </div>

      {/* Book content */}
      {!book ? (
        <div className="flex flex-col items-center justify-center py-8 text-white/30">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 text-2xl">
            📚
          </div>
          <p className="text-sm font-medium mb-1">No book in progress</p>
          <Link href="/library" className="text-xs text-[#F59E0B] hover:underline">
            Upload your first book &rarr;
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex gap-4 mb-4">
            {/* Cover */}
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-16 h-24 rounded-lg object-cover flex-shrink-0 shadow-lg"
              />
            ) : (
              <div className="w-16 h-24 rounded-lg bg-gradient-to-br from-[#F59E0B]/20 to-[#F59E0B]/5 flex items-center justify-center flex-shrink-0 text-2xl">
                📖
              </div>
            )}

            {/* Info */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">
                {book.title}
              </p>
              {book.author && (
                <p className="text-xs text-white/30 truncate mt-0.5">
                  {book.author}
                </p>
              )}
              <div className="mt-3">
                <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden mb-1">
                  <div
                    className="h-full bg-[#F59E0B] rounded-full transition-all duration-500"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs text-white/30">
                  Page {currentPage} of {totalPages} &middot; {progressPercent}%
                </p>
              </div>
            </div>
          </div>

          <Link
            href="/library"
            className="text-xs text-[#F59E0B] hover:underline"
          >
            Continue Reading &rarr;
          </Link>
        </div>
      )}

      {/* Reading goal */}
      {yearlyReadingGoal && (
        <div className="mt-4 pt-3 border-t border-white/5">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs text-white/40">
              {booksReadThisYear} of {yearlyReadingGoal.target_count} books this
              year
            </span>
          </div>
          <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full bg-[#F59E0B]/60 rounded-full transition-all duration-500"
              style={{
                width: `${Math.min(
                  100,
                  Math.round(
                    (booksReadThisYear / yearlyReadingGoal.target_count) * 100
                  )
                )}%`,
              }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default ReadingCard
