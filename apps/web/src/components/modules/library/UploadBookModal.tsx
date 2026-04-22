"use client"

import { useState, useRef } from "react"
import { X, Upload, FileText, BookOpen } from "lucide-react"

type Props = {
  isOpen: boolean
  onClose: () => void
  onUpload: (input: { file: File; title: string; author?: string }) => Promise<any>
  isPending: boolean
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

const UploadBookModal = ({ isOpen, onClose, onUpload, isPending }: Props) => {
  const [file, setFile] = useState<File | null>(null)
  const [title, setTitle] = useState("")
  const [author, setAuthor] = useState("")
  const [isDragOver, setIsDragOver] = useState(false)
  const [validationError, setValidationError] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const resetForm = () => {
    setFile(null)
    setTitle("")
    setAuthor("")
    setValidationError("")
    setIsDragOver(false)
  }

  const handleClose = () => {
    resetForm()
    onClose()
  }

  const handleFileSelect = (selectedFile: File) => {
    const ext = selectedFile.name.split(".").pop()?.toLowerCase()
    if (ext !== "pdf" && ext !== "epub") {
      setValidationError("Only PDF and EPUB files are supported")
      return
    }
    setFile(selectedFile)
    setValidationError("")
    // Pre-fill title from filename
    const nameWithoutExt = selectedFile.name.replace(/\.(pdf|epub)$/i, "")
    const cleanTitle = nameWithoutExt.replace(/[-_]/g, " ").replace(/\s+/g, " ").trim()
    setTitle(cleanTitle)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const droppedFile = e.dataTransfer.files[0]
    if (droppedFile) handleFileSelect(droppedFile)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }

  const handleDragLeave = () => setIsDragOver(false)

  const handleSubmit = async () => {
    if (!file) {
      setValidationError("Please select a file")
      return
    }
    if (!title.trim()) {
      setValidationError("Title is required")
      return
    }

    try {
      await onUpload({ file, title: title.trim(), author: author.trim() || undefined })
      handleClose()
    } catch (err: any) {
      setValidationError(err.message || "Upload failed")
    }
  }

  if (!isOpen) return null

  const fileType = file?.name.endsWith(".epub") ? "epub" : "pdf"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(5, 5, 16, 0.75)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
      <div className="rounded-2xl p-6 w-full max-w-md" style={{ background: "rgba(15, 12, 30, 0.85)", border: "1px solid rgba(255,255,255,0.1)", backdropFilter: "blur(40px)", WebkitBackdropFilter: "blur(40px)", boxShadow: "0 24px 64px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.1), inset 0 -1px 0 rgba(0,0,0,0.2), 0 0 0 1px rgba(108,71,255,0.1)" }}>
        {/* Header */}
        <div className="flex items-center justify-between mb-6" style={{ borderBottom: "1px solid rgba(255,255,255,0.06)", paddingBottom: "16px", background: "linear-gradient(180deg, rgba(108,71,255,0.06) 0%, transparent 100%)" }}>
          <h2 className="text-lg font-semibold text-white">Add to Library</h2>
          <button
            onClick={handleClose}
            className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Drop zone */}
        {!file ? (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              isDragOver
                ? "border-[#6C47FF] bg-[#6C47FF]/10"
                : "border-white/10 hover:border-white/20 hover:bg-white/5"
            }`}
          >
            <Upload className="w-10 h-10 mx-auto mb-3 text-white/20" />
            <p className="text-sm text-white/60 mb-1">
              Drop your PDF or EPUB here
            </p>
            <p className="text-xs text-white/30">or click to browse files</p>
          </div>
        ) : (
          /* File preview */
          <div className="bg-white/5 rounded-xl p-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-900/30 flex items-center justify-center">
                {fileType === "pdf" ? (
                  <FileText className="w-5 h-5 text-amber-400" />
                ) : (
                  <BookOpen className="w-5 h-5 text-amber-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-white truncate">{file.name}</p>
                <p className="text-xs text-white/30">
                  {formatFileSize(file.size)} · {fileType.toUpperCase()}
                </p>
              </div>
              <button
                onClick={() => {
                  setFile(null)
                  setTitle("")
                }}
                className="p-1 rounded hover:bg-white/10 text-white/30 hover:text-white/60 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.epub"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0]
            if (f) handleFileSelect(f)
          }}
        />

        {/* Title */}
        {file && (
          <>
            <div className="mb-3 mt-4">
              <label className="block text-xs text-white/40 mb-1.5">Title</label>
              <input
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value)
                  setValidationError("")
                }}
                placeholder="Book title"
                className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 glass-input"
              />
            </div>

            {/* Author */}
            <div className="mb-4">
              <label className="block text-xs text-white/40 mb-1.5">Author (optional)</label>
              <input
                type="text"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                placeholder="Author name"
                className="w-full rounded-lg px-3 py-2 text-sm text-white placeholder-white/20 glass-input"
              />
            </div>
          </>
        )}

        {validationError && (
          <p className="text-red-400 text-xs mb-3">{validationError}</p>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleClose}
            className="flex-1 px-4 py-2 text-sm text-white/40 hover:text-white/60 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isPending || !file}
            className="flex-1 px-4 py-2 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, rgba(108,71,255,0.9), rgba(79,47,224,0.9))", border: "1px solid rgba(108,71,255,0.5)", boxShadow: "0 4px 20px rgba(108,71,255,0.3), inset 0 1px 0 rgba(255,255,255,0.2)" }}
          >
            {isPending ? "Uploading..." : "Add to Library"}
          </button>
        </div>
      </div>
    </div>
  )
}

export default UploadBookModal
