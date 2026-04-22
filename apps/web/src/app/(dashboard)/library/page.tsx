"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Plus, Search, BookOpen, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import useLibrary from "@/lib/hooks/useLibrary"
import BookSpine from "@/components/modules/library/BookSpine"
import UploadBookModal from "@/components/modules/library/UploadBookModal"
import ReadingGoalModal from "@/components/modules/library/ReadingGoalModal"
import ReadingGoalBanner from "@/components/modules/library/ReadingGoalBanner"
import LibraryStats from "@/components/modules/library/LibraryStats"
import { useToastContext } from "@/components/ui/ToastProvider"
import type { BookWithProgress } from "@lifeboard/lib"
import { useQuery } from "@tanstack/react-query"
import { getRelativeDate } from "@lifeboard/lib"

type Filter = "all" | "pdf" | "epub" | "finished" | "in_progress" | "not_started"

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "PDF", value: "pdf" },
  { label: "EPUB", value: "epub" },
  { label: "Finished", value: "finished" },
  { label: "In Progress", value: "in_progress" },
  { label: "Not Started", value: "not_started" },
]

const LibraryPage = () => {
  const router = useRouter()
  const supabase = createClient()
  const [userId, setUserId] = useState<string>("")
  const [showUpload, setShowUpload] = useState(false)
  const [showGoal, setShowGoal] = useState(false)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<Filter>("all")
  const [booksPerShelf, setBooksPerShelf] = useState(5)

  useEffect(() => {
    const update = () => setBooksPerShelf(window.innerWidth < 768 ? 3 : 5)
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  // Get user
  useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data } = await supabase.auth.getUser()
      if (data.user) setUserId(data.user.id)
      return data.user
    },
  })

  const {
    books,
    currentlyReading,
    booksFinishedThisYear,
    readingGoalProgress,
    monthlyGoalProgress,
    readingStreak,
    yearlyGoal,
    monthlyGoal,
    isLoading,
    uploadBook,
    deleteBook,
    createReadingGoal,
    updateReadingGoal,
    isUploading,
    isCreatingGoal,
  } = useLibrary(userId)

  const { showToast } = useToastContext()

  const handleDeleteBook = useCallback(
    (book: BookWithProgress) => {
      deleteBook({ id: book.id, file_url: book.file_url, cover_url: book.cover_url })
      showToast("Book deleted", "success")
    },
    [deleteBook, showToast]
  )

  // Filter + search
  const filteredBooks = useMemo(() => {
    let result = books

    // Search
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(
        (b) =>
          b.title.toLowerCase().includes(q) ||
          (b.author && b.author.toLowerCase().includes(q))
      )
    }

    // Filter
    switch (filter) {
      case "pdf":
        result = result.filter((b) => b.file_type === "pdf")
        break
      case "epub":
        result = result.filter((b) => b.file_type === "epub")
        break
      case "finished":
        result = result.filter(
          (b) => b.progress && b.total_pages && b.progress.current_page >= b.total_pages
        )
        break
      case "in_progress":
        result = result.filter(
          (b) =>
            b.progress &&
            b.progress.current_page > 0 &&
            (!b.total_pages || b.progress.current_page < b.total_pages)
        )
        break
      case "not_started":
        result = result.filter((b) => !b.progress || b.progress.current_page === 0)
        break
    }

    return result
  }, [books, search, filter])

  // Group into shelf rows
  const shelves = useMemo(() => {
    const rows: BookWithProgress[][] = []
    for (let i = 0; i < filteredBooks.length; i += booksPerShelf) {
      rows.push(filteredBooks.slice(i, i + booksPerShelf))
    }
    return rows
  }, [filteredBooks, booksPerShelf])

  const openBook = (bookId: string) => {
    router.push(`/library/${bookId}`)
  }

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 pt-20 md:pt-6 lg:pt-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1
            className="text-2xl font-bold text-white"
            style={{ fontFamily: "var(--font-clash)", letterSpacing: "-0.03em" }}
          >
            Library
          </h1>
          <p className="text-sm text-white/40 mt-0.5">
            {books.length} book{books.length !== 1 ? "s" : ""} in your collection
          </p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="hidden md:inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all"
          style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.9), rgba(79,47,224,0.9))", border: "1px solid rgba(108,71,255,0.5)", boxShadow: "0 4px 20px rgba(108,71,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" }}
        >
          <Plus size={16} />
          Upload Book
        </button>
      </div>

      {/* Mobile FAB */}
      <button
        onClick={() => setShowUpload(true)}
        className="md:hidden fixed bottom-4 right-4 z-40 w-14 h-14 rounded-full flex items-center justify-center safe-bottom"
        style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.95), rgba(79,47,224,0.95))", border: "1px solid rgba(108,71,255,0.5)", boxShadow: "0 8px 24px rgba(108,71,255,0.4), inset 0 1px 0 rgba(255,255,255,0.2)" }}
        aria-label="Upload Book"
      >
        <Plus size={24} className="text-white" />
      </button>

      {/* Reading Goal Banner */}
      <div className="mb-4">
        <ReadingGoalBanner
          yearlyProgress={readingGoalProgress}
          monthlyProgress={monthlyGoalProgress}
          readingStreak={readingStreak}
          onSetGoal={() => setShowGoal(true)}
        />
      </div>

      {/* Stats Row */}
      <div className="mb-6">
        <LibraryStats
          totalBooks={books.length}
          finishedCount={booksFinishedThisYear.length}
          readingStreak={readingStreak}
          goalProgress={readingGoalProgress}
        />
      </div>

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-white/20 animate-spin" />
        </div>
      ) : books.length === 0 ? (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
            <BookOpen className="w-8 h-8 text-white/20" />
          </div>
          <p className="text-white/40 text-sm mb-4">Your library is empty</p>
          <button
            onClick={() => setShowUpload(true)}
            className="px-4 py-2 bg-[#6C47FF] text-white text-sm font-medium rounded-lg hover:bg-[#5835FF] transition-colors"
          >
            Upload your first book
          </button>
        </div>
      ) : (
        <>
          {/* Currently Reading */}
          {currentlyReading.length > 0 && (
            <div className="mb-8">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider mb-4">
                Continue Reading
              </h2>
              <div className="flex gap-4 md:gap-6 overflow-x-auto flex-nowrap pb-4 -mx-2 px-2 scrollbar-thin">
                {currentlyReading.map((book) => (
                  <div key={book.id} className="flex-shrink-0">
                    <BookSpine book={book} onClick={() => openBook(book.id)} onDelete={handleDeleteBook} size="lg" />
                    <p className="text-[10px] text-white/30 mt-2 text-center max-w-[160px] truncate">
                      {book.progress
                        ? getRelativeDate(book.progress.last_read_at)
                        : ""}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search + Filters */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                My Library
              </h2>
            </div>

            {/* Search bar */}
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title or author..."
                className="w-full rounded-lg pl-9 pr-3 py-2 text-sm text-white placeholder-white/20 glass-input"
              />
            </div>

            {/* Filter pills */}
            <div className="flex gap-2 flex-wrap">
              {FILTERS.map((f) => (
                <button
                  key={f.value}
                  onClick={() => setFilter(f.value)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    filter === f.value
                      ? "text-white"
                      : "text-white/40 hover:text-white/60"
                  }`}
                  style={
                    filter === f.value
                      ? { background: "rgba(108,71,255,0.2)", border: "1px solid rgba(108,71,255,0.3)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.1)" }
                      : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }
                  }
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Bookshelf */}
          {filteredBooks.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-white/30 text-sm">No books match your search</p>
            </div>
          ) : (
            <div className="space-y-2 mb-8">
              {shelves.map((shelf, shelfIndex) => (
                <div key={shelfIndex}>
                  {/* Books on shelf */}
                  <div className="flex items-end gap-2 md:gap-4 px-2 md:px-4 pb-1 min-h-[200px]">
                    {shelf.map((book) => (
                      <BookSpine
                        key={book.id}
                        book={book}
                        onClick={() => openBook(book.id)}
                        onDelete={handleDeleteBook}
                      />
                    ))}
                    {/* Add Book slot — only on last shelf */}
                    {shelfIndex === shelves.length - 1 && (
                      <div
                        onClick={() => setShowUpload(true)}
                        className="flex-shrink-0 w-[90px] h-[130px] md:w-[130px] md:h-[185px] border-2 border-dashed border-white/10 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/5 transition-colors"
                        style={{
                          transform: "perspective(800px) rotateY(-15deg)",
                          transformOrigin: "left center",
                        }}
                      >
                        <Plus className="w-6 h-6 text-white/20 mb-1" />
                        <span className="text-[10px] text-white/20">Add Book</span>
                      </div>
                    )}
                  </div>
                  {/* Wooden shelf */}
                  <div
                    className="h-3 rounded-sm mx-2"
                    style={{
                      background:
                        "linear-gradient(180deg, #3D2B1F 0%, #2C1F15 60%, #1A1209 100%)",
                      boxShadow:
                        "0 4px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  />
                </div>
              ))}

              {/* Empty shelf if no books match but has filter */}
              {shelves.length === 0 && (
                <div>
                  <div className="flex items-end gap-2 md:gap-4 px-2 md:px-4 pb-1 min-h-[200px] justify-center">
                    <div
                      onClick={() => setShowUpload(true)}
                      className="flex-shrink-0 w-[90px] h-[130px] md:w-[130px] md:h-[185px] border-2 border-dashed border-white/10 rounded-sm flex flex-col items-center justify-center cursor-pointer hover:border-white/20 hover:bg-white/5 transition-colors"
                      style={{
                        transform: "perspective(800px) rotateY(-15deg)",
                        transformOrigin: "left center",
                      }}
                    >
                      <Plus className="w-6 h-6 text-white/20 mb-1" />
                      <span className="text-[10px] text-white/20">Add Book</span>
                    </div>
                  </div>
                  <div
                    className="h-3 rounded-sm mx-2"
                    style={{
                      background:
                        "linear-gradient(180deg, #3D2B1F 0%, #2C1F15 60%, #1A1209 100%)",
                      boxShadow:
                        "0 4px 8px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.05)",
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Finished Books Section */}
          {booksFinishedThisYear.length > 0 && (
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-4">
                <h2 className="text-sm font-medium text-white/50 uppercase tracking-wider">
                  Finished
                </h2>
                <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex gap-4 md:gap-6 overflow-x-auto flex-nowrap pb-4 -mx-2 px-2 scrollbar-thin">
                {booksFinishedThisYear.map((book) => (
                  <div key={book.id} className="flex-shrink-0">
                    <BookSpine book={book} onClick={() => openBook(book.id)} onDelete={handleDeleteBook} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Modals */}
      <UploadBookModal
        isOpen={showUpload}
        onClose={() => setShowUpload(false)}
        onUpload={uploadBook}
        isPending={isUploading}
      />
      <ReadingGoalModal
        isOpen={showGoal}
        onClose={() => setShowGoal(false)}
        onCreateGoal={createReadingGoal}
        onUpdateGoal={updateReadingGoal}
        yearlyGoal={yearlyGoal}
        monthlyGoal={monthlyGoal}
        isPending={isCreatingGoal}
      />
    </div>
  )
}

export default LibraryPage
