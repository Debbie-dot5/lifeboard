"use client"

import { useParams } from "next/navigation"
import JournalEditorPage from "@/components/modules/journal/JournalEditorPage"

const EditJournalPage = () => {
  const { id } = useParams<{ id: string }>()
  return <JournalEditorPage entryId={id} />
}

export default EditJournalPage
