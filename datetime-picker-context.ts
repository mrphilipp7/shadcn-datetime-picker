import React from "react"
import type { DateValue } from "react-aria-components"

export type DateTimeContextValue = {
  value: DateValue | null
  onChange: (v: DateValue | null) => void
  granularity?: "day" | "hour" | "minute" | "second"
  hourCycle?: 12 | 24
  close: () => void
  isOpen: boolean
}

export const DateTimeContext = React.createContext<DateTimeContextValue | null>(
  null
)

export const useDateTime = () => {
  const ctx = React.useContext(DateTimeContext)
  if (!ctx) throw new Error("Missing DateTimeProvider")
  return ctx
}
