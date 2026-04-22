"use client"

import { useState, useCallback, useRef } from "react"

export type ToastType = "success" | "error" | "info"

export type Toast = {
  id: string
  message: string
  type: ToastType
}

let globalToastId = 0

const useToast = () => {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map())

  const dismissToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id)
    if (timer) {
      clearTimeout(timer)
      timersRef.current.delete(id)
    }
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, type: ToastType = "info") => {
      const id = `toast-${++globalToastId}`
      const toast: Toast = { id, message, type }

      setToasts((prev) => [...prev, toast])

      const timer = setTimeout(() => {
        dismissToast(id)
      }, 3000)
      timersRef.current.set(id, timer)

      return id
    },
    [dismissToast]
  )

  return { toasts, showToast, dismissToast }
}

export default useToast
