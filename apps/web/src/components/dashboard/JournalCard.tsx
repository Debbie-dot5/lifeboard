"use client"

import { useMemo } from "react"
import Link from "next/link"
import { getRelativeDate, extractPlainText, getTodayISO } from "@lifeboard/lib"
import type { JournalEntry } from "@lifeboard/types"

const MOOD_EMOJIS: Record<string, string> = {
  great: "😄",
  good: "🙂",
  okay: "😐",
  low: "😔",
  bad: "😢",
}

type Props = {
  lastJournalEntry: JournalEntry | null
  entriesThisMonth: number
}

const JournalCard = ({ lastJournalEntry, entriesThisMonth }: Props) => {
  const hasEntryToday = useMemo(() => {
    if (!lastJournalEntry) return false
    return lastJournalEntry.created_at.startsWith(getTodayISO())
  }, [lastJournalEntry])

  const preview = useMemo(() => {
    if (!lastJournalEntry?.content) return ""
    return extractPlainText(lastJournalEntry.content, 80)
  }, [lastJournalEntry])

  return (
    <div className="relative bg-[#13131F] rounded-2xl border border-white/[0.06] border-l-[3px] border-l-[#22C55E] p-6 h-full hover:border-[#22C55E]/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.1)] hover:scale-[1.01] transition-all duration-200 group">
      {/* Floating icon */}
      <span className="absolute top-4 right-4 text-lg opacity-60 animate-float-write">
        ✍️
      </span>

      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
        <h3 className="font-semibold text-white">Journal</h3>
        <Link
          href="/journal"
          className="text-xs text-white/40 hover:text-[#22C55E] transition-colors"
        >
          View all &rarr;
        </Link>
      </div>

      {/* Content */}
      {!lastJournalEntry ? (
        <div className="flex flex-col items-center justify-center py-8 text-white/30">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3 text-2xl">
            📝
          </div>
          <p className="text-sm font-medium mb-1">No entries yet</p>
          <Link href="/journal" className="text-xs text-[#22C55E] hover:underline">
            Start your journal &rarr;
          </Link>
        </div>
      ) : (
        <div>
          <div className="flex items-start gap-2 mb-2">
            {lastJournalEntry.mood && (
              <span className="text-lg flex-shrink-0">
                {MOOD_EMOJIS[lastJournalEntry.mood] ?? "😐"}
              </span>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {lastJournalEntry.title || "Untitled"}
              </p>
              <p className="text-xs text-white/30 mt-0.5">
                {getRelativeDate(lastJournalEntry.created_at)}
              </p>
            </div>
          </div>

          {preview && (
            <p className="text-xs text-white/40 leading-relaxed mb-4 line-clamp-3">
              {preview}
            </p>
          )}

          <div className="flex items-center justify-between mt-auto">
            <span className="text-xs text-white/30">
              ✍️ {entriesThisMonth} entries this month
            </span>
            {hasEntryToday ? (
              <Link
                href="/journal"
                className="text-xs text-[#22C55E] hover:underline"
              >
                View entry &rarr;
              </Link>
            ) : (
              <Link
                href="/journal"
                className="text-xs text-[#22C55E] hover:underline font-medium"
              >
                Write today &rarr;
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default JournalCard
