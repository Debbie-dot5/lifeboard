"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useParams, useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { useQuery } from "@tanstack/react-query"
import dynamic from "next/dynamic"
import { createClient } from "@/lib/supabase/client"
import useLibrary, { useBookReader } from "@/lib/hooks/useLibrary"
import PdfReader from "@/components/modules/library/PdfReader"
import ReaderHeader from "@/components/modules/library/ReaderHeader"
import NotesPanel from "@/components/modules/library/NotesPanel"
import ReaderSettings from "@/components/modules/library/ReaderSettings"
import ProgressBar from "@/components/modules/library/ProgressBar"

// EPUB reader must be dynamically imported — epubjs requires window
const EpubReader = dynamic(
  () => import("@/components/modules/library/EpubReader"),
  { ssr: false }
)

type Theme = "dark" | "sepia" | "light"

const BookReaderPage = () => {
  const params = useParams()
  const router = useRouter()
  const bookId = params.id as string
  const supabase = createClient()

  const [userId, setUserId] = useState("")
  const [theme, setTheme] = useState<Theme>("dark")
  const [fontSize, setFontSize] = useState(18)
  const [showNotes, setShowNotes] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [headerVisible, setHeaderVisible] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState<number | null>(null)
  const [signedUrl, setSignedUrl] = useState<string | null>(null)

  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Get user
  useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUserId(data.user.id)
      return data.user
    },
  })

  const { book, notes, isLoading } = useBookReader(userId, bookId)
  const { updateProgress, createNote, deleteNote, isCreatingNote } = useLibrary(userId)

  // Set initial page from saved progress
  useEffect(() => {
    if (book?.progress) {
      setCurrentPage(book.progress.current_page || 1)
    }
    if (book?.total_pages) {
      setTotalPages(book.total_pages)
    }
  }, [book])

  // Generate signed URL for private book file
  useEffect(() => {
    if (!book || !userId) return
    const getUrl = async () => {
      const { data, error } = await supabase.storage
        .from("books")
        .createSignedUrl(book.file_url, 3600) // 1 hour
      if (data && !error) setSignedUrl(data.signedUrl)
    }
    getUrl()
  }, [book, userId, supabase])

  // Auto-hide header after 3 seconds of no mouse movement
  const resetHideTimer = useCallback(() => {
    setHeaderVisible(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = setTimeout(() => setHeaderVisible(false), 3000)
  }, [])

  useEffect(() => {
    resetHideTimer()
    return () => {
      if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    }
  }, [resetHideTimer])

  const handleMouseMove = useCallback(() => {
    resetHideTimer()
  }, [resetHideTimer])

  // Page change handler
  const handlePageChange = useCallback(
    (page: number) => {
      setCurrentPage(page)
      if (userId && bookId) {
        updateProgress(bookId, page)
      }
    },
    [userId, bookId, updateProgress]
  )

  const handleTotalPagesDetected = useCallback(
    (total: number) => {
      setTotalPages(total)
    },
    []
  )

  // Handle note creation
  const handleAddNote = useCallback(
    async (input: { page_number: number; note_text: string; highlight_text?: string }) => {
      if (!bookId) return
      await createNote({
        book_id: bookId,
        page_number: input.page_number,
        note_text: input.note_text,
        highlight_text: input.highlight_text,
      })
    },
    [bookId, createNote]
  )

  const handleDeleteNote = useCallback(
    (noteId: string) => {
      if (!bookId) return
      deleteNote(noteId, bookId)
    },
    [bookId, deleteNote]
  )

  // Close panels when clicking outside
  const toggleNotes = useCallback(() => {
    setShowNotes((prev) => !prev)
    setShowSettings(false)
  }, [])

  const toggleSettings = useCallback(() => {
    setShowSettings((prev) => !prev)
    setShowNotes(false)
  }, [])

  if (!userId || isLoading || !book) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F1A]">
        <Loader2 className="w-8 h-8 text-white/20 animate-spin" />
      </div>
    )
  }

  if (!signedUrl) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#0F0F1A]">
        <div className="text-center">
          <Loader2 className="w-6 h-6 text-white/20 animate-spin mx-auto mb-2" />
          <p className="text-xs text-white/30">Loading book...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="h-screen flex flex-col" onMouseMove={handleMouseMove}>
      {/* Auto-hiding header */}
      <ReaderHeader
        title={book.title}
        currentPage={currentPage}
        totalPages={totalPages}
        visible={headerVisible || showNotes || showSettings}
        onBack={() => router.push("/library")}
        onToggleNotes={toggleNotes}
        onToggleSettings={toggleSettings}
      />

      {/* Reader content */}
      <div className="flex-1 overflow-hidden pt-0">
        {book.file_type === "pdf" ? (
          <PdfReader
            fileUrl={signedUrl}
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            onTotalPagesDetected={handleTotalPagesDetected}
            theme={theme}
          />
        ) : (
          <EpubReader
            fileUrl={signedUrl}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onTotalPagesDetected={handleTotalPagesDetected}
            theme={theme}
            fontSize={fontSize}
          />
        )}
      </div>

      {/* Notes panel */}
      <NotesPanel
        notes={notes}
        currentPage={currentPage}
        isOpen={showNotes}
        onClose={() => setShowNotes(false)}
        onAddNote={handleAddNote}
        onDeleteNote={handleDeleteNote}
        isCreating={isCreatingNote}
      />

      {/* Settings panel */}
      <ReaderSettings
        theme={theme}
        fontSize={fontSize}
        isOpen={showSettings}
        isEpub={book.file_type === "epub"}
        onClose={() => setShowSettings(false)}
        onThemeChange={setTheme}
        onFontSizeChange={setFontSize}
      />

      {/* Progress bar at bottom */}
      <ProgressBar currentPage={currentPage} totalPages={totalPages} />
    </div>
  )
}

export default BookReaderPage
