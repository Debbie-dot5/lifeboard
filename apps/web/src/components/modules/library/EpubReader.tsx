"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"


type Props = {
  fileUrl: string
  currentPage: number
  onPageChange: (page: number) => void
  onTotalPagesDetected: (total: number) => void
  theme: "dark" | "sepia" | "light"
  fontSize: number
}

const themeConfig = {
  dark: {
    body: { background: "#0F0F1A", color: "#e5e5e5" },
    containerBg: "#0F0F1A",
    navBg: "#13131F",
    navBorder: "rgba(255,255,255,0.1)",
    textColor: "#e5e5e5",
  },
  sepia: {
    body: { background: "#F4ECD8", color: "#433422" },
    containerBg: "#F4ECD8",
    navBg: "#E8DCC8",
    navBorder: "rgba(0,0,0,0.1)",
    textColor: "#433422",
  },
  light: {
    body: { background: "#FFFFFF", color: "#1a1a1a" },
    containerBg: "#FFFFFF",
    navBg: "#F5F5F5",
    navBorder: "rgba(0,0,0,0.1)",
    textColor: "#1a1a1a",
  },
}

const EpubReader = ({ fileUrl, currentPage, onPageChange, onTotalPagesDetected, theme, fontSize }: Props) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const bookRef = useRef<any>(null)
  const renditionRef = useRef<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMessage, setLoadingMessage] = useState("Loading book...")
  const [error, setError] = useState<string | null>(null)
  const [currentLocation, setCurrentLocation] = useState<string | null>(null)
  const [totalLocations, setTotalLocations] = useState(0)
  const [displayedPage, setDisplayedPage] = useState(currentPage)

  const config = themeConfig[theme]

  // Initialize EPUB
  useEffect(() => {
    let mounted = true
    const init = async () => {
      if (!containerRef.current) return

      try {
        setIsLoading(true)
        setError(null)
        setLoadingMessage("Loading book...")

        // Get Supabase access token for private bucket access
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        const accessToken = session?.access_token ?? ""

        // Fetch the entire EPUB file as ArrayBuffer
        setLoadingMessage("Downloading book file...")
        const response = await fetch(fileUrl, {
          headers: accessToken
            ? { Authorization: `Bearer ${accessToken}` }
            : {},
        })

        if (!response.ok) {
          throw new Error(`Failed to download book (${response.status})`)
        }

        const arrayBuffer = await response.arrayBuffer()
        if (!mounted) return

        // Pass ArrayBuffer directly to epubjs — this avoids epubjs
        // trying to resolve internal EPUB paths as separate HTTP requests
        setLoadingMessage("Rendering book...")
        const ePub = (await import("epubjs")).default
        const book = ePub(arrayBuffer)
        bookRef.current = book

        // Wait for book to be ready before rendering
        await book.ready
        if (!mounted || !containerRef.current) return

        const rendition = book.renderTo(containerRef.current, {
          width: "100%",
          height: "100%",
          spread: "none",
          flow: "paginated",
          allowScriptedContent: true,
        })
        renditionRef.current = rendition

        // Apply theme
        rendition.themes.override("font-size", `${fontSize}px`)
        rendition.themes.override("font-family", "Georgia, 'Times New Roman', serif")
        rendition.themes.override("color", config.body.color)
        rendition.themes.override("background", config.body.background)
        rendition.themes.override("line-height", "1.7")

        // Listen for location changes
        rendition.on("relocated", (location: any) => {
          if (!mounted) return
          const start = location.start
          if (start?.index !== undefined) {
            setDisplayedPage(start.index + 1)
            setCurrentLocation(start.cfi)
            onPageChange(start.index + 1)
          }
        })

        // Generate locations for page estimation
        const locations = await book.locations.generate(1024)
        if (mounted) {
          setTotalLocations(locations.length)
          onTotalPagesDetected(locations.length)
        }

        // Display starting location
        if (currentPage > 1) {
          const spine = book.spine as any
          if (spine?.get && spine.get(currentPage - 1)) {
            await rendition.display(spine.get(currentPage - 1).href)
          } else {
            await rendition.display()
          }
        } else {
          await rendition.display()
        }

        if (mounted) setIsLoading(false)
      } catch (err: any) {
        console.error("EPUB init error:", err)
        if (mounted) {
          setError(err?.message || "Failed to load book")
          setIsLoading(false)
        }
      }
    }

    init()

    return () => {
      mounted = false
      if (renditionRef.current) {
        renditionRef.current.destroy()
        renditionRef.current = null
      }
      if (bookRef.current) {
        bookRef.current.destroy()
        bookRef.current = null
      }
    }
  }, [fileUrl]) // Only re-init when file changes

  // Update theme and font size
  useEffect(() => {
    const rendition = renditionRef.current
    if (!rendition) return
    rendition.themes.override("font-size", `${fontSize}px`)
    rendition.themes.override("color", config.body.color)
    rendition.themes.override("background", config.body.background)
  }, [theme, fontSize, config])

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!renditionRef.current) return
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault()
        renditionRef.current.next()
      } else if (e.key === "ArrowLeft") {
        e.preventDefault()
        renditionRef.current.prev()
      }
    }
    window.addEventListener("keydown", handler)
    return () => window.removeEventListener("keydown", handler)
  }, [])

  const goNext = useCallback(() => {
    if (!renditionRef.current) return
    renditionRef.current.next()
  }, [])

  const goPrev = useCallback(() => {
    if (!renditionRef.current) return
    renditionRef.current.prev()
  }, [])

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: config.containerBg }}>
      {/* EPUB render container */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-white/20" />
            <p className="text-xs text-white/30">{loadingMessage}</p>
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 gap-2">
            <p className="text-sm text-red-400">{error}</p>
            <p className="text-xs text-white/30">Please go back and try again.</p>
          </div>
        )}
        <div ref={containerRef} className="w-full h-full" />
      </div>

      {/* Navigation */}
      <div
        className="flex items-center justify-center gap-4 py-3 px-4 border-t w-full safe-bottom"
        style={{
          backgroundColor: config.navBg,
          borderColor: config.navBorder,
        }}
      >
        <button
          onClick={goPrev}
          className="w-14 h-14 md:w-10 md:h-10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <ChevronLeft size={18} style={{ color: config.textColor }} />
        </button>

        <span className="text-sm" style={{ color: config.textColor, opacity: 0.5 }}>
          {totalLocations > 0
            ? `Location ${displayedPage} of ${totalLocations}`
            : `Page ${displayedPage}`}
        </span>

        <button
          onClick={goNext}
          className="w-14 h-14 md:w-10 md:h-10 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center"
        >
          <ChevronRight size={18} style={{ color: config.textColor }} />
        </button>
      </div>
    </div>
  )
}

export default EpubReader
