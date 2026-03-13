"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { Plus, LayoutGrid, Calendar } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { extractPlainText } from "@lifeboard/lib"
import useJournal from "@/lib/hooks/useJournal"
import type { MoodType } from "@lifeboard/types"
import JournalEntryCard from "@/components/modules/journal/JournalEntryCard"
import CalendarView from "@/components/modules/journal/CalendarView"

const MOOD_FILTERS: (MoodType | "all")[] = ["all", "great", "good", "okay", "low", "bad"]

const useUser = () => {
  const supabase = createClient()
  return useQuery({
    queryKey: ["user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser()
      return user
    },
  })
}

const JournalPage = () => {
  const router = useRouter()
  const { data: user } = useUser()
  const { entries, isLoading, deleteEntry } = useJournal(user?.id ?? "")

  const [viewMode, setViewMode] = useState<"grid" | "calendar">("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [moodFilter, setMoodFilter] = useState<MoodType | "all">("all")
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const filteredEntries = useMemo(() => {
    let filtered = entries

    // Mood filter
    if (moodFilter !== "all") {
      filtered = filtered.filter((e) => e.mood === moodFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (e) =>
          (e.title ?? "").toLowerCase().includes(query) ||
          extractPlainText(e.content, 300).toLowerCase().includes(query)
      )
    }

    // Date filter (calendar)
    if (selectedDate) {
      filtered = filtered.filter((e) => e.created_at.split("T")[0] === selectedDate)
    }

    return filtered
  }, [entries, moodFilter, searchQuery, selectedDate])

  const handleDateClick = (date: string) => {
    if (selectedDate === date) {
      setSelectedDate(null)
    } else {
      const hasEntries = entries.some((e) => e.created_at.split("T")[0] === date)
      if (hasEntries) {
        setSelectedDate(date)
      } else {
        router.push("/journal/new")
      }
    }
  }

  const handleDelete = (entryId: string) => {
    if (!window.confirm("Delete this journal entry?")) return
    deleteEntry(entryId)
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center h-full">
        <div className="text-white/30 text-sm">Loading journal...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white mb-1">Journal</h1>
          <p className="text-white/40 text-sm">
            {entries.length} {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex bg-white/5 rounded-lg p-0.5">
            <button
              onClick={() => { setViewMode("grid"); setSelectedDate(null) }}
              className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-[#6C47FF] text-white" : "text-white/40 hover:text-white/60"}`}
            >
              <LayoutGrid size={16} />
            </button>
            <button
              onClick={() => { setViewMode("calendar"); setSelectedDate(null) }}
              className={`p-2 rounded-md transition-colors ${viewMode === "calendar" ? "bg-[#6C47FF] text-white" : "text-white/40 hover:text-white/60"}`}
            >
              <Calendar size={16} />
            </button>
          </div>
          <button
            onClick={() => router.push("/journal/new")}
            className="flex items-center gap-2 px-4 py-2 bg-[#6C47FF] text-white text-sm font-medium rounded-lg hover:bg-[#5835FF] transition-colors"
          >
            <Plus size={16} />
            New Entry
          </button>
        </div>
      </div>

      {/* Search + Mood Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="text"
          placeholder="Search entries..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="flex-1 bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 focus:outline-none focus:border-[#6C47FF] transition-colors"
        />
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {MOOD_FILTERS.map((filter) => (
            <button
              key={filter}
              onClick={() => setMoodFilter(filter)}
              className={`flex-shrink-0 px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                moodFilter === filter
                  ? "bg-[#6C47FF] text-white"
                  : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white/60"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>
      </div>

      {/* Clear date filter */}
      {selectedDate && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-white/40">
            Showing entries for {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
          </span>
          <button
            onClick={() => setSelectedDate(null)}
            className="text-xs text-[#6C47FF] hover:text-[#5835FF] transition-colors"
          >
            Clear
          </button>
        </div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="mb-6">
          <CalendarView
            entries={entries}
            onDateClick={handleDateClick}
            selectedDate={selectedDate}
          />
        </div>
      )}

      {/* Entries Grid */}
      {filteredEntries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
            <span className="text-2xl">📝</span>
          </div>
          <p className="text-white/30 text-sm mb-4">
            {entries.length === 0 ? "No entries yet — start writing" : "No matching entries"}
          </p>
          {entries.length === 0 && (
            <button
              onClick={() => router.push("/journal/new")}
              className="px-4 py-2 bg-[#6C47FF] text-white text-sm font-medium rounded-lg hover:bg-[#5835FF] transition-colors"
            >
              New Entry
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredEntries.map((entry) => (
            <JournalEntryCard
              key={entry.id}
              entry={entry}
              onEdit={() => router.push(`/journal/${entry.id}`)}
              onDelete={() => handleDelete(entry.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}

export default JournalPage
