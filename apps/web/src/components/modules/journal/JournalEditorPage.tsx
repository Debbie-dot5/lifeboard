"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { ArrowLeft, Trash2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { queryKeys, fetchJournalEntry } from "@lifeboard/lib"
import useJournal from "@/lib/hooks/useJournal"
import type { MoodType } from "@lifeboard/types"
import MoodSelector from "./MoodSelector"
import dynamic from "next/dynamic"

const LazyJournalEditor = dynamic(() => import("./JournalEditor"), { ssr: false })

const extractMediaUrlsFromContent = (content: string): string[] => {
  try {
    const blocks = JSON.parse(content)
    const urls: string[] = []

    const scanBlocks = (blocks: any[]) => {
      for (const block of blocks) {
        if (
          (block.type === "image" || block.type === "video" || block.type === "file")
          && block.props?.url
          && block.props.url.includes("supabase.co")
        ) {
          urls.push(block.props.url)
        }
        if (block.children?.length) {
          scanBlocks(block.children)
        }
      }
    }

    scanBlocks(blocks)
    return urls
  } catch {
    return []
  }
}

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

const JournalEditorPage = ({ entryId }: { entryId?: string }) => {
  const router = useRouter()
  const { data: user } = useUser()
  const userId = user?.id ?? ""

  const {
    createEntry,
    updateEntry,
    deleteEntry,
    uploadMedia,
    isCreating,
    isUpdating,
    isDeleting,
  } = useJournal(userId)

  // Load existing entry for edit mode
  const supabase = createClient()
  const { data: existingEntry } = useQuery({
    queryKey: queryKeys.journal.entry(userId, entryId ?? ""),
    queryFn: () => fetchJournalEntry(supabase, entryId!),
    enabled: !!entryId && !!userId,
  })

  // Local state
  const [title, setTitle] = useState("")
  const [mood, setMood] = useState<MoodType | null>(null)
  const [contentJson, setContentJson] = useState("")
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle")
  const [initialized, setInitialized] = useState(!entryId) // new entry = already initialized

  // Refs for auto-save (avoids stale closures)
  const entryIdRef = useRef<string | null>(entryId ?? null)
  const isDirtyRef = useRef(false)
  const titleRef = useRef("")
  const moodRef = useRef<MoodType | null>(null)
  const contentRef = useRef("")
  const mediaUrlsRef = useRef<string[]>([])

  // Populate from existing entry
  useEffect(() => {
    if (existingEntry && !initialized) {
      setTitle(existingEntry.title ?? "")
      setMood(existingEntry.mood)
      setContentJson(existingEntry.content)
      titleRef.current = existingEntry.title ?? ""
      moodRef.current = existingEntry.mood
      contentRef.current = existingEntry.content
      mediaUrlsRef.current = existingEntry.media_urls ?? []
      setInitialized(true)
    }
  }, [existingEntry, initialized])

  // Keep refs in sync
  useEffect(() => { titleRef.current = title }, [title])
  useEffect(() => { moodRef.current = mood }, [mood])
  useEffect(() => { contentRef.current = contentJson }, [contentJson])

  const markDirty = () => { isDirtyRef.current = true }

  const handleTitleChange = (val: string) => {
    setTitle(val)
    markDirty()
  }

  const handleMoodChange = (val: MoodType | null) => {
    setMood(val)
    markDirty()
  }

  const handleContentChange = useCallback((json: string) => {
    setContentJson(json)
    contentRef.current = json
    isDirtyRef.current = true
  }, [])

  const saveEntry = useCallback(async () => {
    if (!userId) return
    setSaveStatus("saving")

    try {
      const media_urls = extractMediaUrlsFromContent(contentRef.current)

      if (!entryIdRef.current) {
        // First save — create
        const entry = await createEntry({
          title: titleRef.current || null,
          content: contentRef.current,
          mood: moodRef.current,
          media_urls,
        })
        entryIdRef.current = entry.id
      } else {
        // Subsequent saves — update
        updateEntry({
          entryId: entryIdRef.current,
          updates: {
            title: titleRef.current || null,
            content: contentRef.current,
            mood: moodRef.current,
            media_urls,
          },
        })
      }
      setSaveStatus("saved")
      setTimeout(() => setSaveStatus("idle"), 2000)
    } catch {
      setSaveStatus("idle")
    }
  }, [userId, createEntry, updateEntry])

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isDirtyRef.current) return
      isDirtyRef.current = false
      saveEntry()
    }, 30_000)

    return () => clearInterval(interval)
  }, [saveEntry])

  const handleManualSave = async () => {
    isDirtyRef.current = false
    await saveEntry()
    // For new entries, redirect to the edit page
    if (!entryId && entryIdRef.current) {
      router.push(`/journal/${entryIdRef.current}`)
    }
  }

  const handleDelete = () => {
    if (!entryIdRef.current) return
    if (!window.confirm("Delete this journal entry?")) return
    deleteEntry(entryIdRef.current)
    router.push("/journal")
  }

  const handleUploadMedia = useCallback(async (file: File): Promise<string> => {
    const url = await uploadMedia(file)
    mediaUrlsRef.current = [...mediaUrlsRef.current, url]
    isDirtyRef.current = true
    return url
  }, [uploadMedia])

  const isSaving = isCreating || isUpdating
  const saveLabel = saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved" : "Save"

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-20 md:pt-6 lg:pt-8 pb-24 md:pb-6 lg:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 md:mb-8">
        <button
          onClick={() => router.push("/journal")}
          className="flex items-center gap-2 text-white/40 hover:text-white transition-colors text-sm"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="flex items-center gap-3">
          {entryId && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-400/60 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors min-h-11"
            >
              <Trash2 size={14} />
              <span className="hidden md:inline">Delete</span>
            </button>
          )}
          <button
            onClick={handleManualSave}
            disabled={isSaving}
            className="hidden md:inline-flex px-4 py-2 bg-[#6C47FF] text-white text-sm font-medium rounded-lg hover:bg-[#5835FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-11"
          >
            {saveLabel}
          </button>
        </div>
      </div>

      {/* Title */}
      <input
        type="text"
        placeholder="Untitled"
        value={title}
        onChange={(e) => handleTitleChange(e.target.value)}
        className="w-full bg-transparent text-2xl md:text-3xl font-bold text-white placeholder-white/20 focus:outline-none mb-4"
      />

      {/* Mood */}
      <div className="mb-6">
        <MoodSelector value={mood} onChange={handleMoodChange} />
      </div>

      {/* Editor */}
      {initialized && (
        <div className="min-h-[400px] bg-[#13131F] rounded-xl border border-white/5 p-4">
          <LazyJournalEditor
            initialContent={contentJson || undefined}
            onChange={handleContentChange}
            onUploadMedia={handleUploadMedia}
          />
        </div>
      )}

      {/* Mobile fixed save bar */}
      <div
        className="md:hidden fixed bottom-0 inset-x-0 z-40 p-3 safe-bottom glass-strong"
        style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
      >
        <button
          onClick={handleManualSave}
          disabled={isSaving}
          className="w-full py-3 bg-[#6C47FF] text-white text-sm font-medium rounded-lg hover:bg-[#5835FF] disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-11"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  )
}

export default JournalEditorPage
