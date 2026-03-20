"use client"

import { useState, useEffect, useCallback } from "react"
import { Document, Page, pdfjs } from "react-pdf"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import "react-pdf/dist/Page/TextLayer.css"
import "react-pdf/dist/Page/AnnotationLayer.css"


pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.js`

type Props = {
  fileUrl: string
  currentPage: number
  totalPages: number | null
  onPageChange: (page: number) => void
  onTotalPagesDetected: (total: number) => void
  theme: "dark" | "sepia" | "light"
}

const themeStyles = {
  dark: { bg: "#0F0F1A", text: "#e5e5e5" },
  sepia: { bg: "#F4ECD8", text: "#433422" },
  light: { bg: "#FFFFFF", text: "#1a1a1a" },
}

const PdfReader = ({ fileUrl, currentPage, totalPages, onPageChange, onTotalPagesDetected, theme }: Props) => {
  const [numPages, setNumPages] = useState<number>(totalPages ?? 0)
  const [pageInputValue, setPageInputValue] = useState(String(currentPage))
  const [scale, setScale] = useState(1.2)

  useEffect(() => {
    setPageInputValue(String(currentPage))
  }, [currentPage])

  const onDocumentLoadSuccess = useCallback(
    ({ numPages: total }: { numPages: number }) => {
      setNumPages(total)
      onTotalPagesDetected(total)
    },
    [onTotalPagesDetected]
  )

  const goToPage = useCallback(
    (page: number) => {
      const target = Math.max(1, Math.min(page, numPages || 1))
      onPageChange(target)
    },
    [numPages, onPageChange]
  )

  const handlePageInputSubmit = () => {
    const page = parseInt(pageInputValue, 10)
    if (!isNaN(page)) goToPage(page)
  }

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        goToPage(currentPage + 1)
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        goToPage(currentPage - 1)
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [currentPage, goToPage])

  const styles = themeStyles[theme]

  return (
    <div
      className="flex flex-col items-center h-full overflow-auto"
      style={{ backgroundColor: styles.bg }}
    >
      {/* PDF Document */}
      <div className="flex-1 flex items-start justify-center py-4 overflow-auto w-full">
        <Document
          file={fileUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            </div>
          }
          error={
            <div className="text-center py-20">
              <p className="text-red-400 text-sm">Failed to load PDF</p>
            </div>
          }
        >
          <Page
            pageNumber={currentPage}
            scale={scale}
            loading={
              <div className="flex items-center justify-center py-20">
                <Loader2 className="w-6 h-6 animate-spin text-white/20" />
              </div>
            }
          />
        </Document>
      </div>

      {/* Bottom navigation bar */}
      <div
        className="flex items-center justify-center gap-4 py-3 px-4 border-t w-full"
        style={{
          backgroundColor: theme === "dark" ? "#13131F" : theme === "sepia" ? "#E8DCC8" : "#F5F5F5",
          borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-colors"
        >
          <ChevronLeft size={18} style={{ color: styles.text }} />
        </button>

        <div className="flex items-center gap-1.5">
          <input
            type="text"
            value={pageInputValue}
            onChange={(e) => setPageInputValue(e.target.value)}
            onBlur={handlePageInputSubmit}
            onKeyDown={(e) => e.key === "Enter" && handlePageInputSubmit()}
            className="w-12 text-center text-sm bg-transparent border rounded px-1 py-0.5"
            style={{
              color: styles.text,
              borderColor: theme === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
            }}
          />
          <span className="text-sm" style={{ color: styles.text, opacity: 0.5 }}>
            of {numPages || "..."}
          </span>
        </div>

        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= (numPages || 1)}
          className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-20 transition-colors"
        >
          <ChevronRight size={18} style={{ color: styles.text }} />
        </button>

        {/* Zoom controls */}
        <div className="flex items-center gap-1 ml-4 border-l pl-4" style={{ borderColor: theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)" }}>
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.2))}
            className="text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: styles.text, opacity: 0.6 }}
          >
            A-
          </button>
          <span className="text-xs tabular-nums" style={{ color: styles.text, opacity: 0.4 }}>
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale(Math.min(3, scale + 0.2))}
            className="text-xs px-2 py-1 rounded hover:bg-white/10 transition-colors"
            style={{ color: styles.text, opacity: 0.6 }}
          >
            A+
          </button>
        </div>
      </div>
    </div>
  )
}

export default PdfReader
