"use client"

import { createContext, useContext, type ReactNode } from "react"
import useToast from "@/lib/hooks/useToast"
import { ToastContainer } from "@/components/ui/Toast"
import type { ToastType } from "@/lib/hooks/useToast"

type ToastContextType = {
  showToast: (message: string, type?: ToastType) => string
}

const ToastContext = createContext<ToastContextType | null>(null)

export const useToastContext = () => {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error("useToastContext must be used within ToastProvider")
  return ctx
}

export const ToastProvider = ({ children }: { children: ReactNode }) => {
  const { toasts, showToast, dismissToast } = useToast()

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  )
}
