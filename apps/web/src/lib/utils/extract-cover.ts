import type { SupabaseClient } from "@supabase/supabase-js"

type ExtractionResult = {
  coverUrl: string | null
  pageCount: number | null
}

// ─── PDF ─────────────────────────────────────────────────────────────────────

const extractPdfCover = async (
  file: File,
  supabase: SupabaseClient,
  userId: string
): Promise<ExtractionResult> => {
  try {
    const pdfjs = await import("pdfjs-dist")
    pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

    const arrayBuffer = await file.arrayBuffer()
    const doc = await pdfjs.getDocument({ data: arrayBuffer }).promise
    const pageCount = doc.numPages

    // Render first page to canvas for cover
    let coverUrl: string | null = null
    try {
      const page = await doc.getPage(1)
      const viewport = page.getViewport({ scale: 1.5 })
      const canvas = document.createElement("canvas")
      canvas.width = viewport.width
      canvas.height = viewport.height

      {
        await page.render({ canvas, viewport } as any).promise

        const blob = await new Promise<Blob | null>((resolve) =>
          canvas.toBlob((b) => resolve(b), "image/jpeg", 0.85)
        )

        if (blob) {
          const path = `${userId}/${Date.now()}-cover.jpg`
          const { error: uploadError } = await supabase.storage
            .from("book-covers")
            .upload(path, blob, { contentType: "image/jpeg" })

          if (!uploadError) {
            const { data } = supabase.storage
              .from("book-covers")
              .getPublicUrl(path)
            coverUrl = data.publicUrl
          }
        }
      }
    } catch {
      // Cover extraction failed — that's fine, we still have pageCount
    }

    doc.destroy()
    return { coverUrl, pageCount }
  } catch {
    return { coverUrl: null, pageCount: null }
  }
}

// ─── EPUB ────────────────────────────────────────────────────────────────────

const extractEpubCover = async (
  file: File,
  supabase: SupabaseClient,
  userId: string
): Promise<ExtractionResult> => {
  try {
    const ePub = (await import("epubjs")).default
    const arrayBuffer = await file.arrayBuffer()
    const book = ePub(arrayBuffer)

    let coverUrl: string | null = null
    let pageCount: number | null = null

    try {
      await book.ready

      // Extract cover image
      const coverBlobUrl = await book.coverUrl()
      if (coverBlobUrl) {
        const response = await fetch(coverBlobUrl)
        const blob = await response.blob()

        const path = `${userId}/${Date.now()}-cover.jpg`
        const { error: uploadError } = await supabase.storage
          .from("book-covers")
          .upload(path, blob, { contentType: blob.type || "image/jpeg" })

        if (!uploadError) {
          const { data } = supabase.storage
            .from("book-covers")
            .getPublicUrl(path)
          coverUrl = data.publicUrl
        }
      }

      // Estimate page count from spine items
      const spine = book.spine as any
      if (spine && spine.length) {
        // Rough estimate: ~25 pages per spine item
        pageCount = spine.length * 25
      }
    } finally {
      book.destroy()
    }

    return { coverUrl, pageCount }
  } catch {
    return { coverUrl: null, pageCount: null }
  }
}

// ─── PUBLIC API ──────────────────────────────────────────────────────────────

export const extractCoverAndMetadata = async (
  file: File,
  fileType: "pdf" | "epub",
  supabase: SupabaseClient,
  userId: string
): Promise<ExtractionResult> => {
  if (fileType === "pdf") {
    return extractPdfCover(file, supabase, userId)
  }
  return extractEpubCover(file, supabase, userId)
}
