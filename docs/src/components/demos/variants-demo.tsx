import { useState } from "react"
import { type DateValue } from "react-aria-components"

import { DatePicker, DateTimePicker } from "@/components/ui/datetime-picker"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"

type Variant = "date" | "time-12" | "seconds-24" | "hour" | "invalid" | "disabled"

/** A single picker configured for one of the options on the Usage page. */
export function VariantsDemo({ variant }: { variant: Variant }) {
  const [value, setValue] = useState<DateValue | null>(null)
  const id = `variant-${variant}`

  const picker = {
    date: <DatePicker id={id} value={value} onChange={setValue} />,
    "time-12": (
      <DateTimePicker
        id={id}
        value={value}
        onChange={setValue}
        pickerProps={{ hourCycle: 12 }}
      />
    ),
    "seconds-24": (
      <DateTimePicker
        id={id}
        value={value}
        onChange={setValue}
        pickerProps={{ granularity: "second", hourCycle: 24 }}
      />
    ),
    hour: (
      <DateTimePicker
        id={id}
        value={value}
        onChange={setValue}
        pickerProps={{ granularity: "hour" }}
      />
    ),
    invalid: (
      <DateTimePicker id={id} value={value} onChange={setValue} aria-invalid />
    ),
    disabled: (
      <DateTimePicker id={id} value={value} onChange={setValue} disabled />
    ),
  }[variant]

  const label = {
    date: "Date",
    "time-12": "Appointment",
    "seconds-24": "Timestamp",
    hour: "Start hour",
    invalid: "Appointment",
    disabled: "Appointment",
  }[variant]

  return (
    <FieldGroup className="w-80">
      <Field data-invalid={variant === "invalid" || undefined}>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        {picker}
      </Field>
    </FieldGroup>
  )
}
