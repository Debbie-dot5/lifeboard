"use client"

import { useEffect, useMemo } from "react"
import { useCreateBlockNote } from "@blocknote/react"
import { BlockNoteView } from "@blocknote/mantine"
import type { Block } from "@blocknote/core"
import "@blocknote/mantine/style.css"

const JournalEditor = ({
  initialContent,
  onChange,
  onUploadMedia,
}: {
  initialContent?: string
  onChange: (json: string) => void
  onUploadMedia: (file: File) => Promise<string>
}) => {
  const parsedContent = useMemo(() => {
    if (!initialContent) return undefined
    try {
      const blocks = JSON.parse(initialContent)
      return Array.isArray(blocks) && blocks.length > 0 ? blocks as Block[] : undefined
    } catch {
      return undefined
    }
  }, [initialContent])

  const editor = useCreateBlockNote({
    initialContent: parsedContent,
    uploadFile: async (file: File) => {
      const url = await onUploadMedia(file)
      return url
    },
  })

  useEffect(() => {
    if (!editor) return

    const handleChange = () => {
      const json = JSON.stringify(editor.document)
      onChange(json)
    }

    editor.onEditorContentChange(handleChange)
  }, [editor, onChange])

  return (
    <div className="journal-editor">
      <BlockNoteView editor={editor} theme="dark" />
      <style jsx global>{`
        .journal-editor .bn-editor {
          background-color: transparent;
          color: white;
          font-size: 16px;
        }
        .journal-editor .bn-container {
          background-color: transparent;
          border: none;
        }
        .journal-editor .bn-editor .bn-block-content {
          padding: 2px 0;
        }
      `}</style>
    </div>
  )
}

export default JournalEditor
