"use client"

import { useEffect, useState } from "react"

interface ToastProps {
  id: string
  title?: string
  description?: string
  duration?: number
}

export function Toaster() {
  const [toasts, setToasts] = useState<ToastProps[]>([])

  useEffect(() => {
    // Listen for toast events
    const handleToast = (event: CustomEvent<ToastProps>) => {
      const newToast = {
        id: Date.now().toString(),
        ...event.detail,
        duration: event.detail.duration || 3000,
      }

      setToasts((prev) => [...prev, newToast])

      // Auto-remove toast after duration
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== newToast.id))
      }, newToast.duration)
    }

    // @ts-ignore - CustomEvent with detail
    window.addEventListener("toast", handleToast)

    return () => {
      // @ts-ignore - CustomEvent with detail
      window.removeEventListener("toast", handleToast)
    }
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-0 right-0 z-50 m-4 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="animate-in slide-in-from-right rounded-md bg-white p-4 shadow-md border border-steel-blue/30"
        >
          {toast.title && <h4 className="font-medium text-navy">{toast.title}</h4>}
          {toast.description && <p className="text-sm text-muted-foreground">{toast.description}</p>}
        </div>
      ))}
    </div>
  )
}
