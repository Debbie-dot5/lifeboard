"use client"

import { useEffect, useRef, useState, useCallback } from "react"
import type { Reminder } from "@lifeboard/types"

const useNotifications = (upcomingReminders: Reminder[]) => {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const timeoutIds = useRef<number[]>([])
  const isSupported = typeof window !== "undefined" && "Notification" in window

  // Sync permission state on mount
  useEffect(() => {
    if (isSupported) setPermission(Notification.permission)
  }, [isSupported])

  const requestPermission = useCallback(async () => {
    if (!isSupported) return
    const result = await Notification.requestPermission()
    setPermission(result)
  }, [isSupported])

  // Schedule browser notifications for reminders within 24 hours
  useEffect(() => {
    timeoutIds.current.forEach(clearTimeout)
    timeoutIds.current = []

    if (!isSupported || permission !== "granted") return

    const now = Date.now()
    const ONE_DAY = 24 * 60 * 60 * 1000

    upcomingReminders.forEach((reminder) => {
      const triggerMs = new Date(reminder.trigger_at).getTime() - now
      if (triggerMs > 0 && triggerMs < ONE_DAY) {
        const id = window.setTimeout(() => {
          const bodyMap: Record<string, string> = {
            birthday: "Don't forget to send your wishes!",
            health: "Time for your health reminder",
            custom: "You have a reminder",
          }

          new Notification(`Lifeboard — ${reminder.title}`, {
            body: reminder.description ?? bodyMap[reminder.type] ?? "You have a reminder",
            icon: "/favicon.ico",
          })
        }, triggerMs)
        timeoutIds.current.push(id)
      }
    })

    return () => {
      timeoutIds.current.forEach(clearTimeout)
      timeoutIds.current = []
    }
  }, [upcomingReminders, permission, isSupported])

  return { permission, requestPermission, isSupported }
}

export default useNotifications
