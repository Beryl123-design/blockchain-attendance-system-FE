type ToastProps = {
  title?: string
  description?: string
  duration?: number
}

export function toast({ title, description, duration = 3000 }: ToastProps) {
  // Create a custom event to show the toast
  const event = new CustomEvent("toast", {
    detail: { title, description, duration },
  })

  // Dispatch the event
  window.dispatchEvent(event)
}
