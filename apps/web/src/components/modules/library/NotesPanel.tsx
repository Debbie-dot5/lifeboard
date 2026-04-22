"use client"

import { useState } from "react"
import { X, Trash2, StickyNote } from "lucide-react"
import type { BookNote } from "@lifeboard/types"
import { formatDate } from "@lifeboard/lib"

type Props = {
  notes: BookNote[]
  currentPage: number
  isOpen: boolean
  onClose: () => void
  onAddNote: (input: { page_number: number; note_text: string; highlight_text?: string }) => void
  onDeleteNote: (noteId: string) => void
  isCreating: boolean
}

const NotesPanel = ({
  notes,
  currentPage,
  isOpen,
  onClose,
  onAddNote,
  onDeleteNote,
  isCreating,
}: Props) => {
  const [noteText, setNoteText] = useState("")
  const [highlightText, setHighlightText] = useState("")
  const [showAddForm, setShowAddForm] = useState(false)

  const handleSubmit = () => {
    if (!noteText.trim()) return
    onAddNote({
      page_number: currentPage,
      note_text: noteText.trim(),
      highlight_text: highlightText.trim() || undefined,
    })
    setNoteText("")
    setHighlightText("")
    setShowAddForm(false)
  }

  return (
    <div
      className="fixed top-0 right-0 bottom-0 z-40 w-full md:w-80 transition-transform duration-300 ease-out"
      style={{
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
      }}
    >
      <div className="h-full bg-[#1A1A2E] border-l border-white/10 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h3 className="text-sm font-semibold text-white">Notes</h3>
          <button
            onClick={onClose}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Add note button / form */}
        <div className="p-4 border-b border-white/10">
          {showAddForm ? (
            <div>
              <p className="text-xs text-white/30 mb-2">Page {currentPage}</p>
              <textarea
                value={highlightText}
                onChange={(e) => setHighlightText(e.target.value)}
                placeholder="Highlighted text (optional)"
                rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#6C47FF] focus:outline-none transition-colors resize-none mb-2"
              />
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Your note..."
                rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-white/20 focus:border-[#6C47FF] focus:outline-none transition-colors resize-none mb-2"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowAddForm(false)
                    setNoteText("")
                    setHighlightText("")
                  }}
                  className="flex-1 text-xs text-white/30 hover:text-white/50 transition-colors py-1.5"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!noteText.trim() || isCreating}
                  className="flex-1 text-xs bg-[#6C47FF] text-white rounded-lg py-1.5 hover:bg-[#5835FF] disabled:opacity-50 transition-colors"
                >
                  {isCreating ? "Saving..." : "Save Note"}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setShowAddForm(true)}
              className="w-full flex items-center justify-center gap-2 py-2 border border-dashed border-white/10 rounded-lg text-xs text-white/40 hover:border-white/20 hover:text-white/60 transition-colors"
            >
              <StickyNote size={14} />
              Add Note for Page {currentPage}
            </button>
          )}
        </div>

        {/* Notes list */}
        <div className="flex-1 overflow-y-auto">
          {notes.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <StickyNote className="w-8 h-8 text-white/10 mb-2" />
              <p className="text-xs text-white/20">No notes yet</p>
            </div>
          ) : (
            <div className="p-2">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className={`p-3 mb-2 rounded-lg border transition-colors ${
                    note.page_number === currentPage
                      ? "bg-[#6C47FF]/10 border-[#6C47FF]/30"
                      : "bg-white/5 border-white/5"
                  }`}
                >
                  <div className="flex items-start justify-between mb-1">
                    <span className="text-[10px] text-white/30 font-medium">
                      Page {note.page_number}
                    </span>
                    <button
                      onClick={() => onDeleteNote(note.id)}
                      className="p-0.5 text-white/20 hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                  {note.highlight_text && (
                    <p className="text-xs text-amber-300/70 italic mb-1 border-l-2 border-amber-500/30 pl-2">
                      &ldquo;{note.highlight_text}&rdquo;
                    </p>
                  )}
                  <p className="text-xs text-white/70 leading-relaxed">
                    {note.note_text}
                  </p>
                  <p className="text-[10px] text-white/20 mt-1.5">
                    {formatDate(note.created_at)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotesPanel
